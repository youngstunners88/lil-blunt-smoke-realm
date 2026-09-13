#!/usr/bin/env bash
# Environment probe — prints ground truth about the CONTAINER IT RUNS IN.
# Never infer environment state from a long-lived session: settings changes
# only exist in containers started AFTER the change was saved.
echo "=== CONTAINER ==="
echo "started_marker: $(date -u +%FT%TZ)  host: $(hostname)"
echo
echo "=== SETUP SCRIPT EFFECTS (did deps install?) ==="
if [ -d src/frontend/node_modules ]; then
  echo "node_modules: PRESENT ($(ls src/frontend/node_modules | wc -l) entries)"
else
  echo "node_modules: ABSENT  <-- setup script did not install deps"
fi
command -v pnpm >/dev/null 2>&1 && echo "pnpm: $(pnpm --version)" || echo "pnpm: MISSING"
echo
echo "=== ENV VARS (names only, values never printed) ==="
env | grep -oE '^[A-Z0-9_]+=' | tr -d '=' | grep -iE 'crawl|cc_|console|api|key|token|firecrawl|openrouter|eleven|monid|itch' | sort || echo "(none matched)"
echo
echo "=== MCP SERVERS ==="
claude mcp list 2>&1 | tail -n +2
echo
echo "=== VERDICT ==="
[ -d src/frontend/node_modules ] && echo "build-capable: YES" || echo "build-capable: NO"
