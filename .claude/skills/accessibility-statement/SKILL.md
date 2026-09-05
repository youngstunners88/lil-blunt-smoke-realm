---
name: accessibility-statement
description: Write and maintain an honest accessibility statement, and do the real WCAG-basics audit that has to back it — not the "one magic prompt" version. Use when asked to add an accessibility statement, reduce ADA/accessibility legal exposure, respond to an accessibility complaint, or when a growth-hack claims a statement alone is a legal shield.
---

# Accessibility statement — done honestly

A viral framing going around (2026): "generate an accessibility statement in
one prompt, put it in the footer, you won't get sued." **That advice is
backwards for a project that holds an accuracy rule as strict as this one's.**
A statement claiming testing that never happened is a false claim, not
protection — potentially worse evidence in a dispute than having no statement
at all. Real exposure reduction comes from actual accessibility work; the
statement's only honest job is to describe that work accurately and give
people a way to report a problem.

Lawsuit volume over ADA Title III web accessibility is genuinely large in the
US — real, not manufactured hype — but do not repeat a specific number (e.g.
"4,600 lawsuits") as fact unless it is sourced and dated. Unverified statistics
from a growth-hack video don't clear this project's bar for a claim any more
than an unverified game feature does.

## Before writing the statement: do the real audit

A statement with nothing behind it is the thing to avoid. Spend the time
here first.

### 1. Check what's actually there, don't assume either direction

```sh
grep -rn "<img" src/frontend/src --include="*.tsx"   # every one needs real alt text
grep -rln "aria-label\|aria-pressed" src/frontend/src --include="*.tsx"
grep -rn "onKeyDown\|tabIndex\|focus" src/frontend/src/components/*.tsx
```

Check specifically: alt text on every image (descriptive, not filler);
icon-only buttons have `aria-label`; interactive controls are reachable and
operable by keyboard alone (tab to it, activate with Enter/Space); any modal
or overlay traps focus while open and returns it on close; color contrast on
the actual theme (this project runs dark, high-saturation themes — check real
foreground/background pairs, don't assume); form inputs have associated
labels, not just placeholder text.

### 2. Name what the audit actually found

State results as measured, same discipline as everywhere else in this
project:

- What passes (cite the actual line — "Hero.tsx:267, alt text present and
  descriptive")
- What doesn't (cite the file/line, not a vague "some issues")
- What was **not checked** (screen-reader walkthrough, e.g. — most agent
  audits are static-analysis only and cannot claim to have used a screen
  reader unless one was actually driven)

### 3. Distinguish the marketing site from the game

For a game project specifically: the marketing/hub site (static HTML pages,
React SPA) and the game itself (often a canvas — Godot, Unity WebGL, etc.) are
different accessibility surfaces with different realistic bars. A canvas game
requiring a keyboard is not screen-reader operable, full stop — that is normal
for the medium, not a defect to hide. State it plainly rather than making a
blanket "fully accessible" claim that the game canvas immediately contradicts.

## Writing the statement

- **State what was actually tested**, and by what method (static code review
  vs. an actual screen-reader pass vs. an automated scanner). Never claim
  manual testing that was only automated, or vice versa.
- **Never claim a compliance level** ("WCAG 2.1 AA compliant") unless a real
  audit against that standard was performed and passed. "Working toward" or
  "partially conforms, see known limitations" is the honest framing absent
  that.
- **List known limitations explicitly** — the game-canvas-needs-keyboard case,
  any modal focus-trap gap found, anything else the audit surfaced. A
  limitations section is what makes the rest of the statement credible.
- **Give a real way to report a problem.** Reuse channels the project already
  publishes — do not invent a new contact method or add company/postal
  details a decentralized project doesn't have (see `AGENTS.md` / the site's
  existing no-HQ framing). The existing footer social links are the contact
  path; point to them.
- **Match the site's own page style** (see `/terms/`, `/privacy/`, `/about/`
  for this project) — a static page under `public/`, one clear H1, plain
  language, no fabricated urgency.
- **Add it to the sitemap and link it from the footer**, same as every other
  static page — an accessibility statement nobody can find defeats its own
  purpose.

## What this skill will not do

- Will not generate a statement claiming testing that wasn't performed.
- Will not treat "add the statement" as the whole task — the audit comes
  first, or the statement is empty performance, worse than the video's own
  advice is meant to fix.
- Will not repeat an unverified lawsuit-count statistic as established fact.
- Will not add a fabricated company name, address, or "legal team" contact —
  that would contradict a project's own decentralization framing where one
  exists.

## When this hands off

| Situation | Go to |
|---|---|
| A specific WCAG technical fix (contrast ratio math, ARIA pattern for a widget) | Standard WCAG 2.1 references — this skill scopes the statement + audit process, not every technique |
| General frontend polish/critique beyond accessibility | `impeccable` |
| The page's SEO metadata once it exists | `seo-optimization` |
