#!/usr/bin/env python3
"""itch bridge: a dependency-free MCP server (stdio, JSON-RPC 2.0) for the Lil Blunt itch.io page.

Read, audit, diff, gate, score and verify. It never writes to itch: the official API cannot edit a page.
"""
import json
import sys
import traceback
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import core  # noqa: E402

TOOLS = {
    "itch_state": ("Live itch page: title, tagline, tags, description text, plus API fields (id, views, traits).", {}, lambda a: core.page_state()),
    "itch_audit": ("Audit the live page: banned or blocked claims, invented names, Jev accuracy gate, canonical title.", {}, lambda a: core.audit()),
    "itch_diff": ("Field-by-field diff of the live page against the approved pack (marketing/itch/page-content.md).", {}, lambda a: core.diff(core.page_state(), core.parse_pack())),
    "itch_gate": ("Gate proposed text: deterministic claim and name checks plus the Jev accuracy gate.", {"text": "string"}, lambda a: core.gate_text(a["text"], a.get("describes_game", True))),
    "itch_score_variants": ("Gate then Jev-score candidate texts (geo battery) and rank them. Pass variants as a list of strings.", {"variants": "array"}, lambda a: core.score_variants(a["variants"], a.get("battery", "geo"))),
    "itch_apply_plan": ("Everything needed to make the edit, only if every changed field passes the gate. Never writes; returns paste values and an automation goal.", {}, lambda a: core.apply_plan()),
    "itch_verify": ("After an edit: re-read the live page and confirm it matches the approved pack.", {}, lambda a: core.verify()),
}


def schema(props):
    t = {"string": {"type": "string"}, "array": {"type": "array", "items": {"type": "string"}}}
    return {"type": "object", "properties": {k: t[v] for k, v in props.items()}, "required": [k for k in props]}


def handle(msg):
    m, i = msg.get("method"), msg.get("id")
    if m == "initialize":
        return {"jsonrpc": "2.0", "id": i, "result": {"protocolVersion": (msg.get("params") or {}).get("protocolVersion", "2024-11-05"),
                "capabilities": {"tools": {}}, "serverInfo": {"name": "itch-bridge", "version": "0.1.0"}}}
    if m == "ping":
        return {"jsonrpc": "2.0", "id": i, "result": {}}
    if m == "tools/list":
        return {"jsonrpc": "2.0", "id": i, "result": {"tools": [{"name": n, "description": d, "inputSchema": schema(p)} for n, (d, p, _) in TOOLS.items()]}}
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
            sys.stdout.write(json.dumps(resp) + "\n"); sys.stdout.flush()


if __name__ == "__main__":
    main()
