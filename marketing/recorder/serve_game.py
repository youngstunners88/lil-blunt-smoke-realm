#!/usr/bin/env python3
"""
Serve a Godot 4 HTML5 export locally with the headers it needs.

Godot 4 web builds use SharedArrayBuffer for threading, which browsers only
expose to cross-origin-isolated pages. That needs both COOP and COEP set, and
every subresource has to carry CORP — a plain `python3 -m http.server` gives
none of these and the engine fails to start.

Serving locally is what makes recording possible at all: this sandbox's
browser cannot reach the public internet, but 127.0.0.1 is exempt from the
proxy, so a locally-served copy of the game renders normally.

    python3 serve_game.py --dir /path/to/export --port 8900
"""

from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
from pathlib import Path


class IsolatedHandler(http.server.SimpleHTTPRequestHandler):
    """Static handler that sets the cross-origin isolation headers."""

    def end_headers(self) -> None:
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        # The .pck is large; letting it cache keeps repeated takes fast.
        self.send_header("Cache-Control", "public, max-age=3600")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        pass  # Quiet: recording runs print their own progress.


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True, help="Directory holding index.html")
    ap.add_argument("--port", type=int, default=8900)
    args = ap.parse_args()

    root = Path(args.dir).resolve()
    if not (root / "index.html").exists():
        raise SystemExit(f"No index.html in {root}")

    handler = functools.partial(IsolatedHandler, directory=str(root))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", args.port), handler) as httpd:
        print(f"serving {root} on http://127.0.0.1:{args.port}", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
