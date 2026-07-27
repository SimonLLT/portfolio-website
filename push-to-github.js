// GitHub API push script for bali-portfolio
const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN';
const OWNER = 'SimonLLT';
const REPO = 'portfolio-website';
const BASE_DIR = __dirname;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB max per file

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'workbuddy-push',
        'Accept': 'application/vnd.github+json',
      },
    };
    if (body) {
      const data = JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = https.request(options, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(text ? JSON.parse(text) : null);
        } else {
          console.error(`  API ${res.statusCode}: ${text.substring(0, 300)}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function collectFiles(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === 'push-to-github.js') continue;
    const full = path.join(dir, e.name);
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      files.push(...collectFiles(full, rel));
    } else {
      files.push({ relative: rel.replace(/\\/g, '/'), absolute: full });
    }
  }
  return files;
}

async function main() {
  console.log('=== GitHub Push: bali-portfolio ===\n');

  // Step 1: Check repo
  console.log('Step 1: Getting repo info...');
  let defaultBranch, latestCommitSha, baseTreeSha;
  try {
    const repoInfo = await api('GET', `/repos/${OWNER}/${REPO}`);
    defaultBranch = repoInfo.default_branch;
    console.log(`  Default branch: ${defaultBranch}`);
  } catch (e) {
    console.error('  Cannot access repo. Check token and repo name.');
    process.exit(1);
  }

  try {
    const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${defaultBranch}`);
    latestCommitSha = ref.object.sha;
    const commit = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`);
    baseTreeSha = commit.tree.sha;
    console.log(`  Latest: ${latestCommitSha.substring(0, 7)}`);
  } catch (e) {
    console.log('  Empty repo (no commits yet)');
  }

  // Step 2: Collect & filter files
  console.log('\nStep 2: Collecting files...');
  const allFiles = collectFiles(BASE_DIR, '');
  
  const skipped = [];
  const toPush = [];
  for (const f of allFiles) {
    const stat = fs.statSync(f.absolute);
    if (stat.size > MAX_SIZE) {
      skipped.push({ file: f.relative, size: (stat.size / 1024 / 1024).toFixed(1) + 'MB' });
    } else {
      toPush.push(f);
    }
  }
  console.log(`  ${toPush.length} files to push, ${skipped.length} skipped`);
  if (skipped.length > 0) {
    console.log('  Skipped (too large):');
    skipped.forEach(f => console.log(`    ${f.file} (${f.size})`));
  }

  // Step 3: Create blobs (batch of 5 to avoid rate limits)
  console.log('\nStep 3: Creating blobs...');
  const treeEntries = [];
  for (let i = 0; i < toPush.length; i++) {
    const f = toPush[i];
    const buf = fs.readFileSync(f.absolute);
    const result = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: buf.toString('base64'),
      encoding: 'base64',
    });
    treeEntries.push({
      path: f.relative,
      mode: '100644',
      type: 'blob',
      sha: result.sha,
    });
    if ((i + 1) % 5 === 0 || i === toPush.length - 1) {
      console.log(`  ${i + 1}/${toPush.length}`);
    }
  }

  // Step 4: Create tree
  console.log('\nStep 4: Creating tree...');
  const treeBody = { tree: treeEntries };
  if (baseTreeSha) treeBody.base_tree = baseTreeSha;
  const newTree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, treeBody);
  console.log(`  Tree: ${newTree.sha}`);

  // Step 5: Create commit
  console.log('\nStep 5: Creating commit...');
  const commitBody = {
    message: 'feat: bali-portfolio website with 7 project galleries',
    tree: newTree.sha,
  };
  if (latestCommitSha) commitBody.parents = [latestCommitSha];
  const newCommit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, commitBody);
  console.log(`  Commit: ${newCommit.sha}`);

  // Step 6: Update ref
  console.log('\nStep 6: Updating branch...');
  await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${defaultBranch}`, {
    sha: newCommit.sha,
    force: false,
  });

  console.log(`\n✅ Done! https://github.com/${OWNER}/${REPO}`);
  if (skipped.length > 0) {
    console.log(`\n⚠ ${skipped.length} large files skipped. Use Git LFS or manual upload.`);
  }
}

main().catch(e => {
  console.error('\n❌ ERROR:', e.message);
  process.exit(1);
});
