"""Tiny LAN test server for D MONSTERS Q STUDIO.
Run:  python serve.py   ->  prints a http://192.168.x.x:PORT URL for your phone.
"""
import http.server, socketserver, socket, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webmanifest": "application/manifest+json",
                      ".js": "text/javascript"}
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80)); return s.getsockname()[0]
    except Exception:
        return "127.0.0.1"
    finally:
        s.close()

with socketserver.ThreadingTCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"\n  D MONSTERS Q STUDIO is being served:\n")
    print(f"    Local :  http://localhost:{PORT}/")
    print(f"    Phone :  http://{lan_ip()}:{PORT}/     <-- open this on your Android\n")
    print("  (PWA *install* needs https:// — this LAN URL is for testing only.)")
    print("  Ctrl+C to stop.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("stopped")
