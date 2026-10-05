import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
import core  # noqa: E402

HTML = '''<html><head><title>Lil Blunt: The Smoke Realm by Young Stunners</title>
<meta name="description" content="Free browser platformer."></head><body>
<div class="formatted_description user_formatted"><p>Hello &amp; welcome.</p><p>Second&nbsp;para.</p></div></div>
<div class="info_panel"><table><tr><td>Tags</td><td><a>2D</a>, <a>Arcade</a></td></tr>
<tr><td>Genre</td><td><a>Platformer</a></td></tr></table></div></body></html>'''


class Parse(unittest.TestCase):
    def test_html(self):
        s = core.parse_html(HTML)
        self.assertEqual(s["title"], "Lil Blunt: The Smoke Realm")
        self.assertEqual(s["tagline"], "Free browser platformer.")
        self.assertEqual(s["tags"], ["2D", "Arcade"])
        self.assertEqual(s["genre"], ["Platformer"])
        self.assertIn("Hello & welcome.", s["description"])

    def test_pack_has_all_fields(self):
        p = core.parse_pack()
        self.assertEqual(p["title"], "Lil Blunt: The Smoke Realm")
        self.assertIn("platformer", p["tags"])
        self.assertTrue(p["description"].startswith("Lil Blunt: The Smoke Realm is a free 2D"))
        self.assertNotIn("wallet to save", p["description"].lower())

    def test_diff_detects_title_and_counts_genre_as_tag(self):
        st = {"title": "The Smoke Realm", "tagline": "x", "description": "y", "tags": ["2D"], "genre": ["Platformer"]}
        pack = {"title": "Lil Blunt: The Smoke Realm", "tagline": "x", "description": "y", "tags": ["2d", "platformer"]}
        d = core.diff(st, pack)
        self.assertFalse(d["title"]["same"])
        self.assertTrue(d["tagline"]["same"])
        self.assertTrue(d["tags"]["same"])


class Gate(unittest.TestCase):
    def test_blocks_the_known_bad_itch_text(self):
        g = core.gate_text("Collect on-chain Blunts and own your character upgrades. Connect your wallet to save progress permanently and trade rare items.", describes=False)
        self.assertFalse(g["passed"])
        self.assertTrue(any("on-chain" in p for p in g["problems"]))

    def test_passes_the_approved_description(self):
        g = core.gate_text(core.parse_pack()["description"])
        self.assertTrue(g["passed"], g)


class Plan(unittest.TestCase):
    def test_plan_refuses_when_a_changed_field_fails_the_gate(self):
        bad = {"title": "Lil Blunt: The Smoke Realm", "tagline": "Own your progress on-chain.", "tags": ["2d"], "description": "Lil Blunt: The Smoke Realm is a free browser platformer."}
        st = {"title": "x", "tagline": "y", "description": "z", "tags": [], "genre": [], "api": {"id": 1}}
        plan = core.apply_plan(pack=bad, state=st)
        self.assertFalse(plan["ready"])
        self.assertIsNone(plan["automation_goal"])
        self.assertIn("tagline", plan["blocked"])


class Protocol(unittest.TestCase):
    def rpc(self, *msgs):
        p = subprocess.run([sys.executable, str(HERE / "server.py")], input="\n".join(json.dumps(m) for m in msgs) + "\n", capture_output=True, text=True, timeout=120)
        return [json.loads(x) for x in p.stdout.splitlines()]

    def test_handshake_list_and_call(self):
        out = self.rpc({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05"}},
                       {"jsonrpc": "2.0", "method": "notifications/initialized"},
                       {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
                       {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "itch_gate", "arguments": {"text": "Play-to-earn: earn tokens and airdrops!", "describes_game": False}}},
                       {"jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": {"name": "nope", "arguments": {}}})
        self.assertEqual(out[0]["result"]["serverInfo"]["name"], "itch-bridge")
        names = {t["name"] for t in out[1]["result"]["tools"]}
        self.assertEqual(names, {"itch_state", "itch_audit", "itch_diff", "itch_gate", "itch_score_variants", "itch_apply_plan", "itch_verify"})
        self.assertFalse(json.loads(out[2]["result"]["content"][0]["text"])["passed"])
        self.assertEqual(out[3]["error"]["code"], -32602)
        self.assertEqual(len(out), 4)  # the notification gets no reply


if __name__ == "__main__":
    unittest.main()
