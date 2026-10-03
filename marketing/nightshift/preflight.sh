#!/usr/bin/env bash
# Night-shift preflight. Each autonomous firing runs this first and refuses to
# proceed on a non-zero exit. It proves the environment is safe to work in
# unattended — right branch, no surprise state — and re-states the boundary the
# session must not cross. Read-only; it changes nothing.
set -u

BRANCH_EXPECTED="claude/caffeine-ai-website-aks8ds"
fail=0

echo "== night-shift preflight =="
cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "FAIL: not a git repo"; exit 1; }

branch="$(git branch --show-current)"
if [ "$branch" != "$BRANCH_EXPECTED" ]; then
  echo "FAIL: on '$branch', expected '$BRANCH_EXPECTED'"; fail=1
else
  echo "ok: branch $branch"
fi

# A dirty tree at the start of an unattended run means a previous firing left
# work half-done. Better to stop and report than to commit a mixture.
if [ -n "$(git status --porcelain)" ]; then
  echo "FAIL: working tree not clean at start of firing:"; git status --short
  fail=1
else
  echo "ok: clean working tree"
fi

if [ ! -f marketing/nightshift/queue.md ]; then
  echo "FAIL: queue.md missing"; fail=1
else
  todo=$(grep -c '^\- \[ \]' marketing/nightshift/queue.md 2>/dev/null || echo 0)
  echo "ok: queue present, $todo task(s) remaining"
fi

python3 --version >/dev/null 2>&1 && echo "ok: python3" || { echo "FAIL: no python3"; fail=1; }

echo "-- boundary (this firing must not): dispatch Caffeine · go live · post"
echo "   externally · spend money · make play-to-earn/on-chain claims · touch"
echo "   package.json deps · commit dist/ --"

[ "$fail" -eq 0 ] && echo "PREFLIGHT PASS" || echo "PREFLIGHT FAIL"
exit "$fail"
