#!/usr/bin/env python3
"""
Cut a raw gameplay screen recording into the ad shot list.

Recording the game has to happen on a machine with a real browser and a human
playing (see the `gameplay-capture` skill for why). Once that raw file exists,
this does the rest: pulls the exact segments, reframes them to vertical, and
optionally stitches them into one montage.

Point it at the raw file with the timestamp where each shot begins:

    python3 marketing/cut_gameplay.py --source raw.mp4 \\
        --shot stage1=0:12 --shot blaze=1:05 --shot boss1=2:30 \\
        --shot stage2=3:40 --shot boss2=4:55 --shot stage3=5:20

Durations come from the shot list below; override any with `name=MM:SS:secs`.
Output lands in marketing/gameplay/clips/ plus a stitched montage.

Vertical reframing crops from the centre of the frame by default. Platformers
keep the character left-of-centre while running right, so `--focus-x` shifts
the crop window if the character is consistently off-centre.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

# The shots agreed for the ad, with default durations in seconds.
DEFAULT_DURATIONS = {
    "stage1": 5,
    "blaze": 5,
    "boss1": 5,
    "stage2": 5,
    "boss2": 2,
    "stage3": 5,
}

# Order the montage assembles in — build to the boss, close on a later stage.
MONTAGE_ORDER = ["stage1", "blaze", "boss1", "stage2", "boss2", "stage3"]

VERTICAL = (1080, 1920)


def parse_timestamp(value: str) -> float:
    """Accept SS, MM:SS or HH:MM:SS."""
    parts = [float(p) for p in value.split(":")]
    seconds = 0.0
    for part in parts:
        seconds = seconds * 60 + part
    return seconds


def run(cmd: list[str]) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        # ffmpeg puts the real reason in the last few stderr lines.
        tail = "\n".join(proc.stderr.strip().splitlines()[-4:])
        print(f"ffmpeg failed:\n{tail}", file=sys.stderr)
        raise SystemExit(1)


def cut(source: Path, start: float, duration: float, out: Path,
        focus_x: float, vertical: bool) -> None:
    """Extract one segment, re-encoding so the cut lands on an exact frame.

    Stream-copying would snap the start to the nearest keyframe, which on a
    long recording can be seconds away — fatal when the shot is five seconds
    long and has to begin on a specific action.
    """
    if vertical:
        tw, th = VERTICAL
        # Scale so height fills, then crop a vertical window at focus_x.
        vf = (
            f"scale=-2:{th},"
            f"crop={tw}:{th}:(iw-{tw})*{focus_x}:0,"
            f"setsar=1"
        )
    else:
        vf = "scale=-2:1080,setsar=1"

    run([
        "ffmpeg", "-y",
        "-ss", f"{start}",
        "-i", str(source),
        "-t", f"{duration}",
        "-vf", vf,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-an",                      # game audio is replaced by the ad's track
        "-movflags", "+faststart",
        str(out),
    ])


def stitch(clips: list[Path], out: Path) -> None:
    """Concatenate the clips in montage order."""
    listing = out.parent / "_concat.txt"
    listing.write_text("".join(f"file '{c.resolve()}'\n" for c in clips))
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(listing), "-c", "copy", "-movflags", "+faststart", str(out),
    ])
    listing.unlink(missing_ok=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True, help="Raw gameplay recording")
    ap.add_argument("--shot", action="append", default=[], metavar="NAME=START[:DUR]",
                    help="Shot start time, e.g. stage1=1:24 or boss2=4:55:3")
    ap.add_argument("--outdir", default="marketing/gameplay/clips")
    ap.add_argument("--focus-x", type=float, default=0.5,
                    help="Horizontal crop centre for vertical, 0..1 (default 0.5)")
    ap.add_argument("--horizontal", action="store_true",
                    help="Keep 16:9 instead of reframing to vertical")
    ap.add_argument("--no-montage", action="store_true")
    args = ap.parse_args()

    source = Path(args.source)
    if not source.exists():
        print(f"Source not found: {source}", file=sys.stderr)
        return 1

    if not args.shot:
        print("No --shot given. Expected shots: "
              + ", ".join(f"{n} ({d}s)" for n, d in DEFAULT_DURATIONS.items()),
              file=sys.stderr)
        return 1

    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    produced: dict[str, Path] = {}
    for spec in args.shot:
        if "=" not in spec:
            print(f"Bad --shot {spec!r}; expected NAME=START[:DUR]", file=sys.stderr)
            return 1
        name, _, rest = spec.partition("=")
        bits = rest.split(":")
        # A trailing bare-seconds duration is allowed: name=MM:SS:DUR
        if len(bits) == 3 and float(bits[2]) < 60 and name in DEFAULT_DURATIONS:
            start = parse_timestamp(":".join(bits[:2]))
            duration = float(bits[2])
        else:
            start = parse_timestamp(rest)
            duration = DEFAULT_DURATIONS.get(name, 5)

        out = outdir / f"{name}.mp4"
        print(f"  {name:<8} start {start:>7.2f}s  dur {duration}s -> {out.name}")
        cut(source, start, duration, out, args.focus_x, not args.horizontal)
        produced[name] = out

    if not args.no_montage and len(produced) > 1:
        ordered = [produced[n] for n in MONTAGE_ORDER if n in produced]
        montage = outdir.parent / "montage.mp4"
        stitch(ordered, montage)
        total = sum(DEFAULT_DURATIONS.get(n, 5) for n in MONTAGE_ORDER if n in produced)
        print(f"\n  montage: {montage}  (~{total}s, {len(ordered)} shots)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
