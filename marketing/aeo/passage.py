#!/usr/bin/env python3
"""
Passage-level scoring for SEO, AEO and GEO — three different questions.

Every other scorer in this repo grades a whole page. That is the wrong unit for
answer engines: selection happens at passage level. A page can be excellent on
average and still contain no single paragraph an assistant would lift. This
finds the paragraph that would get quoted, and the ones dragging the page down.

Three batteries, because the three disciplines optimise for different outcomes
and conflating them is how projects "do SEO" and wonder why nothing is cited:

  seo   Position in a ranked list of links.
        Does this satisfy the intent behind the query, and deliver what the
        title promised?

  aeo   Being the cited source inside an answer.
        Could this paragraph be lifted verbatim and still make sense, and does
        it answer a question someone actually types?

  geo   Being described CORRECTLY when generated text mentions you.
        Is it unambiguous what this is, would it survive as one row in a
        "best free browser games" list, and does it disambiguate from the
        things it gets confused with? For this project that last one is
        concrete: "Lil Blunt" collides with an established music artist, and
        the 0/14 probe baseline cannot distinguish "not known" from "known as
        the wrong entity".

    python3 marketing/aeo/passage.py --page src/frontend/public/about/index.html
    python3 marketing/aeo/passage.py --page FILE --battery geo
    python3 marketing/aeo/passage.py --page FILE --battery all --top 3

Scores are 0-3 per rubric. They rank passages against each other on one page;
they are not a prediction that anything will be cited. Only probe.py measures
citation.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jev  # noqa: E402

BATTERIES: dict[str, dict] = {
    "seo": {
        "intent_match": {
            "type": "score",
            "instructions": "Someone searched for a free browser game to play "
                            "right now. How well does this passage satisfy what "
                            "they were actually looking for?",
            "criteria": ["Irrelevant to that intent", "Tangentially related",
                         "Mostly satisfies it", "Directly satisfies it"],
        },
        "beyond_generic": {
            "type": "score",
            "instructions": "How much does this passage say that a hundred "
                            "other pages about browser games could not say "
                            "equally well?",
            "criteria": ["Entirely generic", "Slightly specific",
                         "Clearly specific", "Uniquely specific to this game"],
        },
        "scannable": {
            "type": "score",
            "instructions": "How easily could a reader skimming the page "
                            "extract the key fact from this passage in a few "
                            "seconds?",
            "criteria": ["Dense and unskimmable", "Requires careful reading",
                         "Mostly scannable", "Key fact is immediately obvious"],
        },
    },
    "aeo": {
        "quotable": {
            "type": "score",
            "instructions": "If an AI assistant were answering a player's "
                            "question, how directly could it quote this "
                            "passage verbatim without rewriting it?",
            "criteria": ["Not usable", "Needs heavy rewriting",
                         "Usable with light editing", "Directly quotable as-is"],
        },
        "self_contained": {
            "type": "score",
            "instructions": "Could this passage be lifted out of the page and "
                            "still make complete sense to someone who never "
                            "saw the rest?",
            "criteria": ["Meaningless alone", "Needs surrounding context",
                         "Mostly stands alone", "Fully self-contained"],
        },
        "answers_question": {
            "type": "score",
            "instructions": "How clearly does this answer a specific question "
                            "a person would actually type into a search box, "
                            "rather than describing the product in general?",
            "criteria": ["Answers nothing", "Vaguely on-topic",
                         "Answers a question indirectly",
                         "Directly answers a real question"],
        },
        "evidence_density": {
            "type": "score",
            "instructions": "How much concrete verifiable detail does this "
                            "contain — named technologies, exact mechanics, "
                            "numbers, specific constraints — versus vague "
                            "marketing language?",
            "criteria": ["Purely vague marketing", "Some specifics",
                         "Mostly concrete", "Dense with verifiable specifics"],
        },
    },
    "geo": {
        "entity_clarity": {
            "type": "score",
            "instructions": "After reading only this passage, how certain "
                            "would a reader be about what kind of thing is "
                            "being described and what it is called?",
            "criteria": ["Completely ambiguous", "Somewhat unclear",
                         "Mostly clear", "Unmistakably identified"],
        },
        "disambiguates_artist": {
            "type": "noul",
            "instructions": "Does this passage make clear that it is about a "
                            "video game, as opposed to a musician, rapper, or "
                            "recording artist?",
        },
        "list_ready": {
            "type": "score",
            "instructions": "Imagine an article titled 'best free browser "
                            "games with no download'. How usable is this "
                            "passage as the one-entry description for this "
                            "game in that list?",
            "criteria": ["Unusable as a list entry", "Needs rewriting",
                         "Usable with light editing",
                         "Drop-in ready as a list entry"],
        },
        "category_anchored": {
            "type": "score",
            "instructions": "How clearly does this place the game into "
                            "recognisable categories a person would browse by "
                            "(genre, theme, platform, price)?",
            "criteria": ["No category signals", "One weak signal",
                         "Several clear signals", "Fully categorised"],
        },
    },
}


def passages(raw: str, min_chars: int = 120) -> list[str]:
    """Split into candidate passages the way a retriever would chunk a page.

    Block boundaries are respected. An earlier version stripped tags first and
    then accumulated sentences blindly, which merged the end of one block with
    the start of the next — it split the canonical list entry across two
    passages on /faq/not-the-artist/ and scored neither of them as the entry.
    Real retrievers chunk on document structure, so splitting on block-level
    elements BEFORE flattening is both more faithful and the only way a
    deliberately self-contained block gets measured as one.

    JSON-LD is stripped, unlike in the accuracy gate which deliberately keeps
    it. A schema block is markup, not prose: it can never be quoted as an
    answer, and leaving it in produces junk passages that score near zero.
    """
    is_html = "<" in raw[:2000]
    if not is_html:
        return [p.strip() for p in re.split(r"\n\s*\n", raw)
                if len(p.strip()) >= min_chars]

    raw = re.sub(r"<script[^>]*application/ld\+json[^>]*>.*?</script>",
                 " ", raw, flags=re.S | re.I)
    # Split on the close of any block-level container, keeping blocks whole.
    blocks = re.split(r"</(?:div|section|article|aside|p|li|h[1-6]|blockquote|td)>",
                      raw, flags=re.I)

    out: list[str] = []
    for b in blocks:
        text = jev.visible_text(b)
        if len(text) < min_chars:
            continue
        # A block longer than a retrieval window still needs splitting, but
        # only within its own boundary.
        if len(text) <= 700:
            out.append(text)
            continue
        cur = ""
        for sent in re.split(r"(?<=[.!?])\s+", text):
            cur = f"{cur} {sent}".strip()
            if len(cur) >= 320:
                out.append(cur)
                cur = ""
        if len(cur) >= min_chars:
            out.append(cur)
    return out


def score_passage(text: str, battery: str, backend: str) -> dict | None:
    r = jev.classify(text, BATTERIES[battery], backend)
    if "error" in r:
        return {"error": r["error"]}
    out = {}
    for k, v in r.get("answers", {}).items():
        if "score" in v:
            out[k] = float(v["score"])
        elif "noul" in v:
            # Put noul on the same 0-3 axis so one mean is meaningful.
            out[k] = float(v["noul"]) * 3.0
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--page", required=True, metavar="FILE")
    ap.add_argument("--battery", choices=["seo", "aeo", "geo", "all"], default="aeo")
    ap.add_argument("--backend", choices=["openrouter", "demo"], default="openrouter")
    ap.add_argument("--top", type=int, default=3, help="Best/worst to show")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()

    raw = Path(a.page).read_text(errors="replace")
    ps = passages(raw)
    if not ps:
        print("  no passages long enough to score.", file=sys.stderr)
        return 1

    batteries = ["seo", "aeo", "geo"] if a.battery == "all" else [a.battery]
    results: dict[str, list] = {}

    for b in batteries:
        rows = []
        for p in ps:
            sc = score_passage(p, b, a.backend)
            if sc and "error" not in sc:
                rows.append({"text": p, "scores": sc,
                             "mean": sum(sc.values()) / len(sc)})
        results[b] = sorted(rows, key=lambda r: r["mean"], reverse=True)

    if a.json:
        print(json.dumps({"page": a.page, "n_passages": len(ps),
                          "model": jev.LAST_MODEL_VERSION[0],
                          "results": results}, indent=2))
        return 0

    print(f"\n  {a.page}")
    print(f"  {len(ps)} passages · model {jev.LAST_MODEL_VERSION[0]}")

    for b in batteries:
        rows = results[b]
        if not rows:
            print(f"\n  [{b}] no readings", file=sys.stderr)
            continue
        page_mean = sum(r["mean"] for r in rows) / len(rows)
        print(f"\n{'='*66}\n  {b.upper()}   page mean {page_mean:.2f} / 3.00\n{'='*66}")

        keys = list(BATTERIES[b].keys())
        print(f"\n  per-rubric page average:")
        for k in keys:
            vals = [r["scores"][k] for r in rows if k in r["scores"]]
            if vals:
                m = sum(vals) / len(vals)
                bar = "#" * int(round(m / 3 * 24))
                print(f"    {k:<22}{m:>5.2f}  {bar}")

        print(f"\n  STRONGEST passage ({rows[0]['mean']:.2f}):")
        print(f"    {rows[0]['text'][:240]}")
        if len(rows) > 1:
            print(f"\n  WEAKEST {min(a.top, len(rows)-1)} — rewrite these first:")
            for r in rows[-a.top:][::-1]:
                if r is rows[0]:
                    continue
                low = sorted(r["scores"].items(), key=lambda kv: kv[1])[:2]
                why = ", ".join(f"{k} {v:.1f}" for k, v in low)
                print(f"    [{r['mean']:.2f}]  {why}")
                print(f"      {r['text'][:180]}")

    print("\n  Scores rank passages within this page. They do not predict")
    print("  citation — only probe.py measures that.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
