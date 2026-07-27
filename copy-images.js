const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\96114\\Desktop\\素材';
const dst = path.join(__dirname, 'images');

const map = {
  '01哈尔滨鲁商': 'harbin',
  '02昆明中信': 'kunming',
  '03北京中海': 'beijing',
  '04深圳怀德': 'shenzhen',
  '05上海中海': 'shanghai',
  '07广州金茂': 'guangzhou'
};

let total = 0;
for (const [folder, pid] of Object.entries(map)) {
  const targetDir = path.join(dst, pid);
  fs.mkdirSync(targetDir, { recursive: true });
  const srcDir = path.join(src, folder);
  if (!fs.existsSync(srcDir)) { console.log(`SKIP ${folder} (not found)`); continue; }
  const files = fs.readdirSync(srcDir)
    .filter(f => /^0 \(\d+\)\.png$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });
  files.forEach((f, i) => {
    const num = String(i + 1).padStart(2, '0');
    fs.copyFileSync(path.join(srcDir, f), path.join(targetDir, num + '.png'));
    console.log(`  ${pid}/${num}.png  <-  ${f}`);
    total++;
  });
}
console.log(`===DONE=== total=${total}`);
