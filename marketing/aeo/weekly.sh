#!/usr/bin/env bash
# Weekly AEO reading. Cheap enough to run indefinitely: Gemini only, ~$0.80.
#
# Cadence is weekly rather than daily on purpose. These probes cost real money
# (~$0.115 each on Gemini, ~$0.395 on Grok) and the thing being measured — a
# search index reordering itself — does not move fast enough for daily
# sampling to add signal over noise.
set -euo pipefail
cd "$(dirname "$0")/../.."

if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
  echo "OPENROUTER_API_KEY is not set; skipping probe." >&2
  exit 1
fi

python3 marketing/aeo/probe.py --run --report --models gemini

echo
echo "Reminder: a shift counts only when it holds for three consecutive runs."
