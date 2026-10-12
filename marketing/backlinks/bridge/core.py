"""backlink bridge core: registry, probe, submission packs, ledger, verify.

Read-only against every third-party site. It never submits a form, creates an account or solves a
captcha: submitting is outward-facing and the founder does it. A link is LIVE only after verify()
fetches the listing and finds the anchor.
"""
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
BASE = HERE.parent
ROOT = BASE.parent.parent
sys.path.insert(0, str(ROOT / "marketing" / "aeo"))
REGISTRY = BASE / "directories.json"
LEDGER = BASE / "ledger.jsonl"
BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
OURS = ["smokegame.win", "youngstunners88.itch.io/smokerealm"]
STATUSES = ["submitted", "rejected", "withdrawn"]  # "live" can only come from verify()


def _get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": BROWSER})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read(600000).decode(errors="replace")


def targets(tier=None):
    rows = json.loads(REGISTRY.read_text())["targets"]
    return [t for t in rows if not tier or t["tier"] == tier.upper()]


def target(tid):
    for t in targets():
        if t["id"] == tid:
            return t
    raise KeyError(f"unknown target {tid}")


def ledger():
    if not LEDGER.exists():
        return []
    return [json.loads(x) for x in LEDGER.read_text().splitlines() if x.strip()]


def current_status(tid):
    rows = [r for r in ledger() if r["id"] == tid]
    return rows[-1] if rows else {"status": "not_submitted"}


def probe(tid):
    t = target(tid)
    url = t["submit"] or f"https://{t['domain']}/"
    try:
        code, html = _get(url)
    except urllib.error.HTTPError as e:
        return {"id": tid, "url": url, "reachable": False, "http": e.code}
    except Exception as e:  # noqa: BLE001
        return {"id": tid, "url": url, "reachable": False, "error": type(e).__name__}
    low = html.lower()
    return {"id": tid, "url": url, "reachable": True, "http": code,
            "title": (re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I) or [0, ""])[1].strip()[:90],
            "captcha": "captcha" in low, "needs_login": bool(re.search(r"sign ?in|log ?in|sign ?up", low)),
            "mentions_games": len(re.findall(r"\bgames?\b", low)), "checked": str(date.today())}


def _itch():
    import importlib.util
    spec = importlib.util.spec_from_file_location("itch_core", ROOT / "marketing" / "itch" / "bridge" / "core.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _pack_copy():
    p = _itch().parse_pack()
    claims = {f["id"]: f["text"] for f in json.loads((ROOT / "marketing/aeo/claims.json").read_text())["facts"]}
    return p, claims


def gate(text, deep=False):
    """Deterministic claim checks (free). deep=True adds the Jev accuracy gate (costs ~$0.00002)."""
    import surface_audit
    problems = surface_audit.checks(text, True)
    out = {"passed": not problems, "problems": problems}
    if deep:
        g = _itch().gate_text(text)
        out.update(passed=g["passed"], names_not_in_game=g["names_not_in_game"], jev_violations=g["jev_violations"])
    return out


def pack(tid):
    t = target(tid)
    itch_pack, claims = _pack_copy()
    one_liner = itch_pack["tagline"]
    short = claims["canonical_entry"]
    texts = {"name": "Lil Blunt: The Smoke Realm", "url": "https://youngstunners88.itch.io/smokerealm",
             "site": "https://www.smokegame.win/", "one_liner": one_liner, "short_description": short,
             "category": "Games / Browser games / Platformer", "tags": itch_pack["tags"],
             "disambiguation": "Not the Memphis rap duo Indo G & Lil' Blunt; this is a video game."}
    gated = {k: gate(v) for k, v in texts.items() if k in ("one_liner", "short_description")}
    warns = []
    if t["tier"] != "A":
        warns.append(f"Tier {t['tier']}: {t['why']}")
    if "AI" in (t["why"] or "") and t["tier"] == "C":
        warns.append("Do NOT file the game under 'AI tool': that would be a false category claim.")
    return {"target": t["id"], "submit_url": t["submit"], "status": current_status(tid)["status"],
            "copy": texts, "gate": gated, "all_gated": all(g["passed"] for g in gated.values()),
            "warnings": warns, "handoff": "Founder submits. Then call bl_record(submitted), later bl_verify(listing_url)."}


def record(tid, status, listing_url="", note=""):
    target(tid)
    if status not in STATUSES:
        raise ValueError(f"status must be one of {STATUSES}; 'live' is set only by verify")
    row = {"id": tid, "status": status, "listing_url": listing_url, "note": note, "date": str(date.today())}
    with LEDGER.open("a") as f:
        f.write(json.dumps(row) + "\n")
    return row


def find_links(html):
    found = []
    for m in re.finditer(r"<a\b([^>]*)>", html, re.I):
        attrs = m.group(1)
        h = re.search(r'href=["\']([^"\']+)', attrs)
        if h and any(o in h.group(1).lower() for o in OURS):
            rel = (re.search(r'rel=["\']([^"\']+)', attrs) or [0, ""])[1].lower()
            found.append({"href": h.group(1), "rel": rel, "follow": not any(k in rel for k in ("nofollow", "ugc", "sponsored"))})
    return found


def verify(tid, listing_url):
    target(tid)
    try:
        code, html = _get(listing_url)
    except Exception as e:  # noqa: BLE001
        return {"id": tid, "verified": False, "reason": f"fetch failed: {type(e).__name__}"}
    links = find_links(html)
    res = {"id": tid, "listing_url": listing_url, "http": code, "verified": bool(links), "links": links[:5]}
    if links:
        with LEDGER.open("a") as f:
            f.write(json.dumps({"id": tid, "status": "live", "listing_url": listing_url, "date": str(date.today()),
                                "follow": any(l["follow"] for l in links)}) + "\n")
    return res


def report():
    rows = targets()
    st = {t["id"]: current_status(t["id"])["status"] for t in rows}
    by = lambda s: [i for i, v in st.items() if v == s]  # noqa: E731
    return {"live": by("live"), "submitted_unverified": by("submitted"), "rejected": by("rejected"),
            "tierA_not_started": [t["id"] for t in rows if t["tier"] == "A" and st[t["id"]] == "not_submitted"],
            "headline": f"{len(by('live'))} LIVE verified links of {len(rows)} researched sites; {len(by('submitted'))} submitted, unverified"}


FORM_FIELDS = {  # observed 2026-10-12; sites not listed get a generic goal
    "viesearch": {"url": "url", "title": "title", "description": "description", "category": "category_slug", "email": "email"},
}
DESC = ("Lil Blunt: The Smoke Realm is a free 2D Wild West platformer and arcade score-chaser that plays in your web browser "
        "on desktop or mobile. Throw axes at Tax Collector enemies across three stages. No download, no account, nothing to buy.")  # Jev geo 2.93, tied best of 5
TITLE = "Lil Blunt: The Smoke Realm - free browser platformer"


def submit_plan(tid, email=""):
    """Everything needed to submit, only if the target and copy pass. Never submits; returns a browser-automation goal.
    The contact email is supplied by the caller for this one plan and is never stored."""
    t = target(tid)
    if t["tier"] == "C":
        return {"ok": False, "reason": f"tier C, do not submit: {t['why']}"}
    if not t["submit"]:
        return {"ok": False, "reason": "no submit URL on record; probe first"}
    if current_status(tid)["status"] in ("submitted", "live"):
        return {"ok": False, "reason": f"already {current_status(tid)['status']}"}
    pr = probe(tid)
    if not pr.get("reachable"):
        return {"ok": False, "reason": f"submit page unreachable: {pr}"}
    if pr.get("captcha"):
        return {"ok": False, "reason": "captcha present; a human must do this one"}
    g = {k: gate(v) for k, v in (("title", TITLE), ("description", DESC))}
    if not all(x["passed"] for x in g.values()):
        return {"ok": False, "reason": "copy failed the gate", "gate": g}
    fields = FORM_FIELDS.get(tid)
    site = "https://www.smokegame.win/"
    lines = [f"Go to {t['submit']}.", "Fill the submission form with exactly these values and change nothing:",
             f"- website URL: {site}", f"- title: {TITLE}", f"- description: {DESC}",
             "- category: the closest Games / Video Games / Browser Games entry under Arts and Entertainment; never create a new category"]
    if email:
        lines.append(f"- email: {email}")
    lines += ["Do not buy, upgrade or pick any paid plan. Do not tick any newsletter box. If a captcha, payment step or login wall",
              "appears that you cannot pass with a free account created from the email above, stop and report exactly what blocked you.",
              "After submitting, report the confirmation text and the final page URL."]
    return {"ok": True, "id": tid, "fields": fields, "needs_email": bool(fields and "email" in fields) and not email,
            "automation_goal": "\n".join(lines), "after": "bl_record(id, submitted, listing_url), then bl_verify once the listing is public"}


def recheck():
    """CI: re-fetch every verified-live listing and report any that lost the link."""
    lost, ok = [], []
    state = {}
    for r in ledger():
        state[r["id"]] = r
    for tid, r in state.items():
        if r["status"] != "live" or not r.get("listing_url"):
            continue
        try:
            _, html = _get(r["listing_url"])
            (ok if find_links(html) else lost).append(tid)
        except Exception:  # noqa: BLE001
            lost.append(tid)
    return {"checked": len(ok) + len(lost), "still_live": ok, "lost": lost}
