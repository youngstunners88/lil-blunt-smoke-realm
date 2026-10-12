#!/usr/bin/env python3
"""backlink bridge: dependency-free MCP server (stdio, JSON-RPC 2.0). Read-only toward third-party sites;
it never submits forms. See marketing/backlinks/bridge/core.py."""
import json
import sys
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import core  # noqa: E402

TOOLS = {
    "bl_targets": ("List researched directories with tier (A honest fit, B weak, C do not submit), why and ledger status. Optional tier filter.",
                   {"tier": "string"}, lambda a: [{**t, "status": core.current_status(t["id"])["status"]} for t in core.targets(a.get("tier"))], []),
    "bl_probe": ("Live check of one target's submit page: reachable, captcha, login wall, games mention.", {"id": "string"}, lambda a: core.probe(a["id"]), ["id"]),
    "bl_pack": ("Submission pack for one target: gated copy from the approved pack/claims, warnings for off-category sites. Never submits.", {"id": "string"}, lambda a: core.pack(a["id"]), ["id"]),
    "bl_gate": ("Gate proposed listing text against banned claims; deep=true adds the Jev accuracy gate.", {"text": "string", "deep": "boolean"}, lambda a: core.gate(a["text"], bool(a.get("deep"))), ["text"]),
    "bl_record": ("Log a founder action: status submitted|rejected|withdrawn. Cannot set live.", {"id": "string", "status": "string", "listing_url": "string", "note": "string"}, lambda a: core.record(a["id"], a["status"], a.get("listing_url", ""), a.get("note", "")), ["id", "status"]),
    "bl_verify": ("Fetch a listing page and confirm an anchor to the game exists (reports rel=nofollow). Only this marks a link live.", {"id": "string", "listing_url": "string"}, lambda a: core.verify(a["id"], a["listing_url"]), ["id", "listing_url"]),
    "bl_report": ("Headline and lists: live verified, submitted unverified, rejected, tier A not started.", {}, lambda a: core.report(), []),
}
T = {"string": {"type": "string"}, "boolean": {"type": "boolean"}}


def handle(msg):
    m, i = msg.get("method"), msg.get("id")
    if m == "initialize":
        return {"jsonrpc": "2.0", "id": i, "result": {"protocolVersion": (msg.get("params") or {}).get("protocolVersion", "2024-11-05"),
                "capabilities": {"tools": {}}, "serverInfo": {"name": "backlink-bridge", "version": "0.1.0"}}}
    if m == "ping":
        return {"jsonrpc": "2.0", "id": i, "result": {}}
    if m == "tools/list":
        return {"jsonrpc": "2.0", "id": i, "result": {"tools": [
            {"name": n, "description": d, "inputSchema": {"type": "object", "properties": {k: T[v] for k, v in p.items()}, "required": req}}
            for n, (d, p, _, req) in TOOLS.items()]}}
    if m == "tools/call":
        p = msg.get("params") or {}
        name, args = p.get("name"), p.get("arguments") or {}
        if name not in TOOLS:
            return {"jsonrpc": "2.0", "id": i, "error": {"code": -32602, "message": f"unknown tool {name}"}}
        try:
            out = TOOLS[name][2](args)
            return {"jsonrpc": "2.0", "id": i, "result": {"content": [{"type": "text", "text": json.dumps(out, indent=1, ensure_ascii=False)}]}}
        except Exception as e:  # noqa: BLE001
            return {"jsonrpc": "2.0", "id": i, "result": {"isError": True, "content": [{"type": "text", "text": f"{type(e).__name__}: {e}\n{traceback.format_exc(limit=3)}"}]}}
    if i is None:
        return None
    return {"jsonrpc": "2.0", "id": i, "error": {"code": -32601, "message": f"method not found: {m}"}}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            resp = handle(json.loads(line))
        except Exception as e:  # noqa: BLE001
            resp = {"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(e)}}
        if resp is not None:
            sys.stdout.write(json.dumps(resp) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
