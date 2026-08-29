#!/usr/bin/env bash
#
# Record the game with a real X server (Xvfb) and ffmpeg x11grab.
#
# This is the Xvfb approach adapted for what this game actually is. The usual
# recipe assumes a native binary you can launch on the display; Lil Blunt is a
# Godot HTML5 export, so the thing running on the display is a browser, and the
# browser needs three extra pieces the generic recipe has no reason to mention:
#
#   * the game is served locally, because this sandbox drops browser traffic to
#     the public internet but exempts 127.0.0.1
#   * that local server must send COOP/COEP or Godot 4 never starts
#   * keyboard input goes through CDP, because a canvas has no DOM to click and
#     the game binds A/D rather than arrow keys
#
# Why bother when CDP screencast already works: x11grab samples the composited
# display at a fixed rate, so the output has an even cadence and real-time
# pacing. The screencast path only emits a frame when the compositor produces
# one, which under software rendering arrives irregularly.
#
# Usage: record_xvfb.sh [seconds] [outfile]

set -euo pipefail

DURATION="${1:-60}"
OUT="${2:-/tmp/xvfb-demo.mp4}"
DISPLAY_NUM=99
W=1920
H=1080
GAME_DIR="${GAME_DIR:-/tmp/game}"
PORT="${PORT:-8900}"
CDP_PORT=9333
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  set +e
  [[ -n "${FFMPEG_PID:-}"  ]] && kill -INT "$FFMPEG_PID"  2>/dev/null
  [[ -n "${CHROME_PID:-}"  ]] && kill      "$CHROME_PID"  2>/dev/null
  [[ -n "${SERVER_PID:-}"  ]] && kill      "$SERVER_PID"  2>/dev/null
  [[ -n "${XVFB_PID:-}"    ]] && kill      "$XVFB_PID"    2>/dev/null
}
trap cleanup EXIT

echo "== 1. virtual display =="
Xvfb ":$DISPLAY_NUM" -screen 0 "${W}x${H}x24" -nolisten tcp &
XVFB_PID=$!
sleep 2
xdpyinfo -display ":$DISPLAY_NUM" >/dev/null 2>&1 \
  && echo "   display :$DISPLAY_NUM ready (${W}x${H})" \
  || { echo "   display failed to start"; exit 1; }

echo "== 2. game server =="
python3 "$HERE/serve_game.py" --dir "$GAME_DIR" --port "$PORT" &
SERVER_PID=$!
sleep 2
curl -sf --noproxy 127.0.0.1 "http://127.0.0.1:$PORT/" >/dev/null \
  && echo "   serving $GAME_DIR on :$PORT" \
  || { echo "   server failed"; exit 1; }

echo "== 3. browser on the virtual display =="
DISPLAY=":$DISPLAY_NUM" /opt/pw-browsers/chromium-1194/chrome-linux/chrome \
  --no-sandbox --disable-dev-shm-usage \
  --use-gl=swiftshader --enable-unsafe-swiftshader --disable-gpu-sandbox \
  --autoplay-policy=no-user-gesture-required --mute-audio \
  --disable-infobars --test-type --noerrdialogs \
  --disable-features=Translate,InfiniteSessionRestore \
  --remote-debugging-port="$CDP_PORT" \
  --window-position=0,0 --window-size="$W,$H" --start-fullscreen \
  --app="http://127.0.0.1:$PORT/" \
  >/tmp/chrome-xvfb.log 2>&1 &
CHROME_PID=$!

# Godot has to fetch and instantiate ~200MB of wasm and pck before it paints.
echo "   waiting for the engine to boot"
for i in $(seq 1 40); do
  sleep 3
  if curl -sf --noproxy 127.0.0.1 "http://127.0.0.1:$CDP_PORT/json/list" 2>/dev/null \
      | grep -q '"type": *"page"'; then
    READY=$(node "$HERE/xvfb_driver.mjs" --cdp "http://127.0.0.1:$CDP_PORT" --check 2>/dev/null || echo no)
    [[ "$READY" == "ready" ]] && { echo "   engine booted after $((i*3))s"; break; }
  fi
done

echo "== 4. recording ${DURATION}s =="
ffmpeg -y -f x11grab -framerate 30 -video_size "${W}x${H}" -i ":$DISPLAY_NUM" \
  -c:v libx264 -preset ultrafast -crf 23 -pix_fmt yuv420p \
  -t "$DURATION" "$OUT" >/tmp/ffmpeg-xvfb.log 2>&1 &
FFMPEG_PID=$!
echo "   ffmpeg pid $FFMPEG_PID -> $OUT"

# Drive the game with native X input while ffmpeg runs. xdotool talks to the
# X server directly, so there is no ambiguity about which context receives the
# event — the reason the CDP-over-Xvfb attempt kept missing the menu button.
export DISPLAY=":$DISPLAY_NUM"
WID=$(xdotool search --sync --onlyvisible --class chrom | head -1)
xdotool windowactivate --sync "$WID" 2>/dev/null || true
sleep 1

click_frac() {  # click_frac <x-fraction> <y-fraction>
  xdotool mousemove $(python3 -c "print(int($W*$1))") $(python3 -c "print(int($H*$2))")
  sleep 0.3
  xdotool click 1
}

echo "   entering the game"
click_frac 0.5 0.735          # PLAY LEVEL 1
sleep 2
click_frac 0.62 0.75          # SKIP the email-capture modal
sleep 2
xdotool key --window "$WID" Return 2>/dev/null || xdotool key Return
sleep 3

echo "   playing"
PLAY_UNTIL=$(( SECONDS + DURATION - 12 ))
xdotool keydown d
while [ $SECONDS -lt $PLAY_UNTIL ]; do
  sleep 0.6; xdotool key space
  sleep 0.1; xdotool key j
done
xdotool keyup d
echo "   play loop done"

echo "== 5. finalising =="
# -INT is what flushes the moov atom; killing hard leaves an unplayable file.
kill -INT "$FFMPEG_PID" 2>/dev/null || true
for _ in $(seq 1 20); do kill -0 "$FFMPEG_PID" 2>/dev/null || break; sleep 1; done
FFMPEG_PID=""

echo "== 6. verify =="
ls -lh "$OUT"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$OUT"
