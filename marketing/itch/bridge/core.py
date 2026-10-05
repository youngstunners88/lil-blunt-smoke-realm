"""itch bridge core: read, audit, diff, gate, score and verify the itch.io page.

Everything here is read-only against itch. The official API has no endpoint that edits a page and
the edit screen needs a logged-in web session, so writes are handed off (see apply_plan).
"""
import difflib
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "marketing" / "aeo"))
PACK = ROOT / "marketing" / "itch" / "page-content.md"
SLUG_URL = "https://youngstunners88.itch.io/smokerealm"
BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"


def _get(url, headers=None, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": BROWSER, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode(errors="replace")


def _text(html):
    html = re.sub(r"<(script|style).*?</\1>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<(br|/p|/li|/h\d|/div)[^>]*>", "\n", html, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", html)
    t = t.replace("&nbsp;", " ").replace("&amp;", "&").replace("&mdash;", "—").replace("&#39;", "'").replace("&quot;", '"')
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", t)).strip()


def parse_html(html):
    title = (re.search(r"<title>(.*?)</title>", html, re.S) or [None, ""])[1].strip()
    title = re.sub(r"\s+by\s+\S.*$", "", title)
    desc = (re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', html)
            or re.search(r'<meta[^>]+content="([^"]*)"[^>]+name="description"', html)
            or re.search(r'<meta[^>]+property="og:description"[^>]+content="([^"]*)"', html) or [None, ""])[1]
    genre_cell = re.search(r"<td>\s*Genre\s*</td>\s*<td>(.*?)</td>", html, re.S)
    genre = re.findall(r">([^<>]+)</a>", genre_cell.group(1)) if genre_cell else []
    body = re.search(r'class="formatted_description[^"]*"[^>]*>(.*?)</div>\s*</div>', html, re.S)
    tags_cell = re.search(r"<td>\s*Tags\s*</td>\s*<td>(.*?)</td>", html, re.S)
    tags = re.findall(r">([^<>]+)</a>", tags_cell.group(1)) if tags_cell else []
    return {"title": title, "tagline": desc, "tags": [t.strip() for t in tags], "genre": [g.strip() for g in genre], "description": re.split(r"\n?More information", _text(body.group(1)))[0].strip() if body else ""}


def page_state(url=SLUG_URL):
    st = parse_html(_get(url))
    st["url"] = url
    key = os.environ.get("ITCH_API_KEY")
    if key:
        try:
            games = json.loads(_get("https://api.itch.io/profile/games", {"Authorization": f"Bearer {key}"}))["games"]
            g = next((x for x in games if x.get("url", "").rstrip("/") == url.rstrip("/")), None)
            if g:
                st["api"] = {k: g.get(k) for k in ("id", "title", "short_text", "classification", "type", "published", "views_count", "traits", "cover_url")}
        except Exception as e:  # noqa: BLE001
            st["api_error"] = str(e)[:120]
    return st


def parse_pack(path=PACK):
    s = Path(path).read_text()
    def fence(marker):
        i = s.index(marker)
        m = re.search(r"```\n(.*?)\n```", s[i:], re.S)
        return m.group(1).strip()
    return {
        "title": fence("**1 — Title**"),
        "tagline": fence("**2 — Short description"),
        "tags": [t.strip() for t in fence("**5 — Tags**").split(",")],
        "description": fence("**6 — Description**"),
    }


def _norm(t):
    return re.sub(r"\s+", " ", t.lower()).strip()


def diff(state, pack):
    out = {}
    for f in ("title", "tagline", "description"):
        a, b = _norm(state.get(f, "")), _norm(pack[f])
        out[f] = {"same": a == b, "similarity": round(difflib.SequenceMatcher(None, a, b).ratio(), 3), "live": state.get(f, ""), "wanted": pack[f]}
    live_tags = {t.lower() for t in state.get("tags", []) + state.get("genre", [])}
    want = {t.lower().replace("-", " ") for t in pack["tags"]}
    live_n = {t.replace("-", " ") for t in live_tags}
    out["tags"] = {"same": want <= live_n, "missing": sorted(want - live_n), "extra": sorted(live_n - want)}
    return out


def gate_text(text, describes=True):
    """Deterministic checks first (free), then Jev. Returns {passed, problems, jev}."""
    import surface_audit, research_agent, jev
    problems = surface_audit.checks(text, describes)
    names = [n for n in research_agent.unverified_names(text) if "\n" not in n]
    g = jev.gate(text)
    jev_bad = {k: round(v, 2) for k, v in g.get("violations", {}).items()}
    return {"passed": not problems and g.get("passed", False) and not names,
            "problems": problems, "names_not_in_game": names, "jev_violations": jev_bad}


def score_variants(variants, battery="geo"):
    import passage
    rows = []
    for v in variants:
        g = gate_text(v, describes=False)
        if not g["passed"]:
            rows.append({"text": v, "gate": "BLOCKED", "why": g}); continue
        s = passage.score_passage(v, battery, "openrouter") or {}
        vals = [x for k, x in s.items() if k != "error"]
        rows.append({"text": v, "gate": "pass", "mean": round(sum(vals) / len(vals), 2) if vals else None, "scores": s})
    rows.sort(key=lambda r: -(r.get("mean") or -1))
    return rows


def audit(state=None):
    state = state or page_state()
    full = "\n".join([state["title"], state["tagline"], state["description"]])
    g = gate_text(full, describes=False)
    issues = []
    if "Lil Blunt" not in state["title"]:
        issues.append("title lacks the entity name 'Lil Blunt'")
    if state["title"] != "Lil Blunt: The Smoke Realm":
        issues.append(f"title is {state['title']!r}, canonical is 'Lil Blunt: The Smoke Realm'")
    return {"state_url": state["url"], "gate": g, "issues": issues, "passed": g["passed"] and not issues}


def apply_plan(pack=None, state=None):
    """Everything needed to make the edit, only if every wanted field passes the gate. Never writes."""
    pack = pack or parse_pack(); state = state or page_state()
    gates = {f: gate_text(pack[f], describes=(f == "description")) for f in ("title", "tagline", "description")}
    d = diff(state, pack)
    changes = {f: d[f]["wanted"] for f in ("title", "tagline", "description") if not d[f]["same"]}
    if not d["tags"]["same"]:
        changes["tags"] = ", ".join(pack["tags"])
    blocked = {f: g for f, g in gates.items() if f in changes and not g["passed"]}
    plan = {"ready": not blocked, "blocked": blocked, "changes": changes, "edit_url": "https://itch.io/game/edit/%s" % (state.get("api") or {}).get("id", "<game id>"),
            "do_not_touch": ["Project URL (slug) must stay 'smokerealm'", "pricing", "uploads"]}
    plan["automation_goal"] = (
        "You are already logged in to itch.io through a saved browser profile. If you ever see a login, captcha or two-factor page, STOP and report that; "
        "never try to log in or create an account. Open the edit page for the project. Set ONLY these fields to exactly the given text, change nothing else, "
        "never touch the Project URL (slug), pricing or uploads: " + json.dumps(changes, ensure_ascii=False) +
        " Click Save. Then reload the edit page and report the saved Title, Short description, Tags and the first 200 characters of the Description, "
        "and the Project URL (it must still end in /smokerealm).") if changes and not blocked else None
    plan["access_check_goal"] = access_check_goal(plan["edit_url"])
    return plan


def access_check_goal(edit_url):
    return ("You are already logged in to itch.io through a saved browser profile. If you see a login, captcha or two-factor page, STOP and report exactly that. "
            f"Open {edit_url}. Do NOT change or save anything. Report the logged-in username and the current values of Title, Short description, Tags and the Project URL.")


def verify(pack=None):
    pack = pack or parse_pack(); st = page_state(); d = diff(st, pack)
    ok = all(d[f]["same"] or d[f]["similarity"] > 0.97 for f in ("title", "tagline", "description")) and d["tags"]["same"]
    return {"verified": ok, "diff": {f: ({k: v for k, v in d[f].items() if k not in ("live", "wanted")} if f != "tags" else d[f]) for f in d}}
