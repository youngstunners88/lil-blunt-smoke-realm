#!/bin/bash
# Reconstruct hero.png from the base64 parts (or single file if present)
set -e
cd "$(dirname "$0")"
if [ -f hero.png.b64 ]; then
  base64 -d hero.png.b64 > hero.png
  echo "Decoded hero.png from hero.png.b64"
elif [ -f hero_part_aa ]; then
  cat hero_part_aa hero_part_ab hero_part_ac hero_part_ad > hero.png.b64
  base64 -d hero.png.b64 > hero.png
  rm -f hero.png.b64
  echo "Decoded hero.png from parts"
else
  echo "No base64 source found. Place hero.png manually."
  exit 1
fi
ls -la hero.png
file hero.png
