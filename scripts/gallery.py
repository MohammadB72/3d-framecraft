#!/usr/bin/env python3
"""Serve the bundled gallery on loopback and save one session-scoped choice."""
import argparse
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import secrets
import threading
import time

ROOT = Path(__file__).resolve().parents[1]


def make_server(selection_file):
    catalog = {s['id']: s for s in json.loads((ROOT / 'references/styles.json').read_text())}
    html = (ROOT / 'assets/gallery.html').read_bytes()
    selection_file = Path(selection_file).resolve()

    class Handler(BaseHTTPRequestHandler):
        def setup(self):
            self.request.settimeout(2)
            super().setup()

        def log_message(self, *_):
            pass

        def respond(self, status, data, content_type='application/json; charset=utf-8'):
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if self.headers.get('Host') != self.server.origin.split('//', 1)[1]:
                self.respond(403, b'{}')
            elif self.path == self.server.route:
                self.respond(200, html, 'text/html; charset=utf-8')
            else:
                self.respond(404, b'{}')

        def do_POST(self):
            if (self.headers.get('Host') != self.server.origin.split('//', 1)[1]
                    or self.headers.get('Origin', self.server.origin) != self.server.origin):
                self.respond(403, b'{}')
                return
            if self.path != self.server.route + 'select':
                self.respond(404, b'{}')
                return
            try:
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 2048:
                    raise ValueError('Invalid request size')
                body = json.loads(self.rfile.read(size))
                choice = body.get('style_id') if isinstance(body, dict) else None
                if not isinstance(choice, str) or choice not in catalog:
                    raise ValueError('Invalid style')
            except (ValueError, UnicodeDecodeError):
                self.respond(400, b'{}')
                return
            except TimeoutError:
                self.respond(408, b'{}')
                return
            card = catalog[choice]
            receipt = {'session_id': self.server.session_id, 'style_id': choice,
                       'name': card['name'], 'order': card['order'],
                       'selected_at': datetime.now(timezone.utc).isoformat()}
            with self.server.selection_lock:
                if time.monotonic() >= self.server.deadline:
                    self.respond(410, b'{}')
                    return
                if self.server.selection is not None:
                    self.respond(409, b'{}')
                    return
                try:
                    selection_file.parent.mkdir(parents=True, exist_ok=True)
                    temporary = selection_file.with_name(selection_file.name + '.' + self.server.session_id + '.tmp')
                    temporary.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
                    temporary.replace(selection_file)
                except OSError:
                    self.respond(500, b'{"ok":false}')
                    return
                try:
                    self.respond(200, json.dumps({'ok': True, **receipt}).encode())
                finally:
                    self.server.selection = receipt

    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    server.session_id = secrets.token_hex(16)
    server.route = '/s/' + server.session_id + '/'
    server.origin = 'http://127.0.0.1:' + str(server.server_address[1])
    server.gallery_url = server.origin + server.route
    server.selection = None
    server.selection_lock = threading.Lock()
    server.deadline = float('inf')
    server.timeout = 0.5
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--selection-file', type=Path, required=True)
    parser.add_argument('--timeout', type=int, default=900, help='Seconds before the gallery server exits (default: 900)')
    args = parser.parse_args()
    if not 1 <= args.timeout <= 3600:
        parser.error('--timeout must be between 1 and 3600 seconds')
    with make_server(args.selection_file) as server:
        print(json.dumps({'url': server.gallery_url, 'session_id': server.session_id,
                          'selection_file': str(args.selection_file.resolve())}), flush=True)
        server.deadline = time.monotonic() + args.timeout
        try:
            while server.selection is None and time.monotonic() < server.deadline:
                server.handle_request()
        except KeyboardInterrupt:
            return
        print(json.dumps({'status': 'selected' if server.selection else 'expired',
                          'selection': server.selection}), flush=True)


if __name__ == '__main__':
    main()
