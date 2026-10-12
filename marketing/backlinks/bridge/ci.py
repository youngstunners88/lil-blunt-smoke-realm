#!/usr/bin/env python3
"""CI entry for the backlink bridge. Exit 1 on any failure.

  python3 marketing/backlinks/bridge/ci.py          # offline checks (every push)
  python3 marketing/backlinks/bridge/ci.py --live   # also re-fetch verified listings and probe tier A/B submit pages
"""
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import core  # noqa: E402


def main():
    fails = []
    if subprocess.run([sys.executable, str(HERE / "test_bridge.py")]).returncode:
        fails.append("bridge unit tests failed")
    for name, text in (("title", core.TITLE), ("description", core.DESC)):
        g = core.gate(text)
        if not g["passed"]:
            fails.append(f"{name} fails claim gate: {g['problems']}")
    ids = [t["id"] for t in core.targets()]
    if len(ids) != len(set(ids)):
        fails.append("duplicate ids in directories.json")
    if "--live" in sys.argv:
        re_ = core.recheck()
        print("recheck:", json.dumps(re_))
        fails += [f"listing lost its link: {i}" for i in re_["lost"]]
        for t in core.targets():
            if t["tier"] in "AB" and t["submit"]:
                p = core.probe(t["id"])
                print(f"probe {t['id']}: {'up' if p.get('reachable') else 'DOWN'}")
    print(json.dumps(core.report()))
    for f in fails:
        print("FAIL:", f)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
