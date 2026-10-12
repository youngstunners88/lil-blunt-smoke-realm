import json, subprocess, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import core


class T(unittest.TestCase):
    def setUp(self):
        self._l = core.LEDGER
        core.LEDGER = Path(tempfile.mkdtemp()) / "l.jsonl"

    def tearDown(self):
        core.LEDGER = self._l

    def test_registry_covers_doc(self):
        self.assertEqual(len(core.targets()), 30)
        self.assertTrue(all(t["tier"] in "ABC" for t in core.targets()))
        self.assertEqual(len({t["id"] for t in core.targets()}), 30)

    def test_find_links_reads_rel(self):
        html = '<a href="https://www.smokegame.win/" rel="nofollow noopener">x</a><a href="https://other.com">y</a><a href="https://youngstunners88.itch.io/smokerealm">z</a>'
        l = core.find_links(html)
        self.assertEqual([x["follow"] for x in l], [False, True])

    def test_live_cannot_be_recorded(self):
        with self.assertRaises(ValueError):
            core.record("fazier", "live")

    def test_verify_requires_anchor(self):
        core._get = lambda u, timeout=25: (200, "<p>nothing here</p>")
        self.assertFalse(core.verify("fazier", "https://x/")["verified"])
        self.assertEqual(core.current_status("fazier")["status"], "not_submitted")
        core._get = lambda u, timeout=25: (200, '<a href="https://www.smokegame.win/">g</a>')
        self.assertTrue(core.verify("fazier", "https://x/")["verified"])
        self.assertEqual(core.current_status("fazier")["status"], "live")

    def test_pack_warns_off_category_and_gates(self):
        p = core.pack("toolify")
        self.assertTrue(p["warnings"])
        self.assertTrue(p["all_gated"], p["gate"])

    def test_gate_catches_banned_claim(self):
        self.assertFalse(core.gate("Lil Blunt: The Smoke Realm lets you earn tokens while you play.")["passed"])

    def test_mcp_roundtrip(self):
        msgs = [{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}},
                {"jsonrpc": "2.0", "id": 2, "method": "tools/list"},
                {"jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {"name": "bl_report", "arguments": {}}}]
        out = subprocess.run([sys.executable, str(Path(__file__).parent / "server.py")], input="\n".join(map(json.dumps, msgs)),
                             capture_output=True, text=True, timeout=30).stdout.splitlines()
        self.assertEqual(len(json.loads(out[1])["result"]["tools"]), 7)
        self.assertIn("LIVE verified", json.loads(out[2])["result"]["content"][0]["text"])


if __name__ == "__main__":
    unittest.main()
