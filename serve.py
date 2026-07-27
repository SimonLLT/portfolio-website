import http.server
import socketserver
import os

PORT = 8567
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map)
    extensions_map['.glb'] = 'model/gltf-binary'
    extensions_map['.js'] = 'application/javascript'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

os.chdir(DIRECTORY)
with socketserver.TCPServer(('127.0.0.1', PORT), Handler) as httpd:
    print(f'Serving on http://127.0.0.1:{PORT}')
    httpd.serve_forever()
