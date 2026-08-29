#!/usr/bin/env python3
"""
Turn a capture from record_game.mjs into a 9:16 client deliverable.

The game renders 16:9. Centre-cropping that to 9:16 throws away most of the
level and usually loses the character, so instead the full frame sits centred
at full width on a branded 1080x1920 field, with the title above and the CTA
below. Nothing is cropped and the vertical space carries brand rather than
letterbox.

Frame timing comes from the capture manifest, not an assumed rate: the
screencast delivers frames irregularly under software rendering, so an
assumed constant fps would drift out of sync with the action.

    python3 compose_vertical.py --rec /tmp/rec3 --out montage.mp4 \\
        [--segment stage1_start:stage1_end] [--speed 1.5]
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

W, H = 1080, 1920
GAME_W = 1080            # game fills the full width
BG = "0x0F0D0A"          # saloon-night ground, matches the ad set
GREEN = "0xB6FF6B"
GOLD = "0xE0AE4C"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SUBLINE = "FREE  ·  NO WALLET  ·  NO DOWNLOAD"


def esc(text: str) -> str:
    """Escape text for ffmpeg drawtext.

    Colons separate filter options and single quotes terminate the value, so
    a title like "LIL BLUNT: THE SMOKE REALM" silently truncates at the colon
    unless both are escaped.
    """
    return text.replace("\\", "\\\\").replace(":", r"\:").replace("'", r"\'")


def run(cmd: list[str]) -> None:
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        print("\n".join(p.stderr.strip().splitlines()[-6:]), file=sys.stderr)
        raise SystemExit(1)


def build_concat(rec: Path, frames: list[dict], out: Path) -> None:
    """Write an ffmpeg concat list with each frame's real on-screen duration."""
    lines = []
    for i, f in enumerate(frames):
        nxt = frames[i + 1]["t"] if i + 1 < len(frames) else f["t"] + 0.12
        dur = max(0.02, min(1.0, nxt - f["t"]))
        lines.append(f"file '{(rec / 'frames' / f['file']).resolve()}'")
        lines.append(f"duration {dur:.4f}")
    # concat demuxer needs the final file repeated for its duration to apply
    lines.append(f"file '{(rec / 'frames' / frames[-1]['file']).resolve()}'")
    out.write_text("\n".join(lines) + "\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rec", required=True, help="Capture dir from record_game.mjs")
    ap.add_argument("--out", default="marketing/gameplay/smoke-realm-vertical.mp4")
    ap.add_argument("--segment", help="start_mark:end_mark to trim to")
    ap.add_argument("--speed", type=float, default=1.0,
                    help="Playback multiplier; >1 hides low capture fps")
    ap.add_argument("--title", default="LIL BLUNT: THE SMOKE REALM")
    ap.add_argument("--cta", default="PLAY FREE  ·  smokegame.win")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--zoom", type=float, default=0.78,
                    help="Fraction of frame width to keep before scaling. "
                         "<1 crops the sides so the game fills more height "
                         "and leaves less dead space in a 9:16 frame.")
    args = ap.parse_args()

    rec = Path(args.rec)
    manifest = json.loads((rec / "manifest.json").read_text())
    frames = manifest["frames"]
    marks = {m["label"]: m["at"] for m in manifest.get("marks", [])}

    if args.segment:
        a, _, b = args.segment.partition(":")
        t0 = marks.get(a, 0.0)
        t1 = marks.get(b, frames[-1]["t"])
        frames = [f for f in frames if t0 <= f["t"] <= t1]
        if len(frames) < 5:
            print(f"segment {args.segment} has too few frames", file=sys.stderr)
            return 1
        base = frames[0]["t"]
        frames = [{**f, "t": f["t"] - base} for f in frames]
        print(f"segment {a}->{b}: {len(frames)} frames, "
              f"{frames[-1]['t']:.1f}s")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    concat = rec / "_concat.txt"
    build_concat(rec, frames, concat)

    # Game centred at full width; title above it, CTA below, on a flat ground.
    crop = f"crop=iw*{args.zoom}:ih:(iw-iw*{args.zoom})/2:0," if args.zoom < 1 else ""
    vf = (
        f"{crop}"
        f"scale={GAME_W}:-2,"
        f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:{BG},"
        f"drawtext=fontfile={FONT_BOLD}:text='{esc(args.title)}':"
        f"fontcolor=white:fontsize=46:x=(w-text_w)/2:y={int(H*0.20)},"
        f"drawtext=fontfile={FONT_BOLD}:text='{esc(args.cta)}':"
        f"fontcolor={GREEN}:fontsize=52:x=(w-text_w)/2:y={int(H*0.755)},"
        f"drawtext=fontfile={FONT_BOLD}:text='{esc(SUBLINE)}':"
        f"fontcolor={GOLD}:fontsize=30:x=(w-text_w)/2:y={int(H*0.245)},"
        f"fps={args.fps},format=yuv420p"
    )
    if args.speed != 1.0:
        vf = f"setpts=PTS/{args.speed}," + vf

    run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-movflags", "+faststart", "-an",
        str(out),
    ])
    concat.unlink(missing_ok=True)

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "format=duration:stream=width,height",
         "-of", "default=noprint_wrappers=1", str(out)],
        capture_output=True, text=True)
    print(f"wrote {out}\n{probe.stdout.strip()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
