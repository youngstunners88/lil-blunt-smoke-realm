import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const THEME_TRACK_SRC = "/assets/audio/theme.mp3";

/**
 * Small fixed play/pause control for the ambient background theme song.
 *
 * The track is fetched in full and handed to the player as an in-memory
 * blob URL rather than streamed from its path. ICP asset canisters serve
 * certified assets without reliable HTTP Range support, and a media
 * element that cannot issue range requests stops at whatever it managed
 * to buffer — which is why the song appeared to cut off partway through.
 * Loading the whole file up front sidesteps that entirely and lets `loop`
 * restart the complete track.
 *
 * A single `Audio` object is created once and kept alive for the whole
 * component lifetime (not re-created via JSX props), so playback survives
 * re-renders.
 *
 * Browsers always block unmuted autoplay with zero prior interaction, but
 * always allow *muted* autoplay. So playback starts muted the moment the
 * track is ready, and the very first gesture anywhere on the page unmutes
 * it — from the visitor's perspective the theme is already running before
 * they've even found the toggle button, which only ever needs pressing to
 * stop or resume playback that has already started.
 */
export function AmbientAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userPausedRef = useRef(false);
  const unlockedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.35;
    audio.muted = true;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    // `loop` alone can stall on some browsers when the source was a
    // partial stream; rewinding explicitly guarantees a clean restart.
    const handleEnded = () => {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    };
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    const tryPlay = () => {
      if (userPausedRef.current || !audio.src) return;
      audio.play().catch(() => {
        // Still blocked — a later gesture, or the toggle button, retries.
      });
    };

    // Unmute on the first real gesture. This is intentionally idempotent
    // via `unlockedRef` rather than removing the listeners the instant a
    // gesture fires: a gesture can land before the blob fetch below has
    // finished, when `audio.src` isn't set yet and `tryPlay` is a no-op.
    // Removing the listeners at that point (the previous behavior) left
    // nothing to retry once the fetch *did* resolve — that later `play()`
    // call happens outside any gesture, so the browser silently blocks it
    // forever and the track never starts. Leaving the listeners live until
    // a gesture actually lands after the track is ready fixes that.
    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      audio.muted = false;
      tryPlay();
    };

    const onGesture = (event: Event) => {
      const target = event.target;
      if (
        buttonRef.current &&
        target instanceof Node &&
        buttonRef.current.contains(target)
      ) {
        // The toggle button handles its own play/pause intent.
        return;
      }
      unlock();
    };
    document.addEventListener("pointerdown", onGesture);
    document.addEventListener("keydown", onGesture);

    // Pull the whole track down before playing so no part of it depends
    // on range requests the asset canister may not honor.
    let objectUrl: string | null = null;
    let cancelled = false;
    fetch(THEME_TRACK_SRC)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        audio.src = objectUrl;
        audio.load();
        tryPlay();
      })
      .catch(() => {
        // Fall back to streaming from the path directly.
        if (cancelled) return;
        audio.src = THEME_TRACK_SRC;
        audio.load();
        tryPlay();
      });

    return () => {
      cancelled = true;
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      audio.pause();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      audioRef.current = null;
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    unlockedRef.current = true;
    audio.muted = false;
    if (audio.paused) {
      userPausedRef.current = false;
      audio.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      audio.pause();
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={togglePlayback}
      aria-label={
        isPlaying ? "Pause background music" : "Play background music"
      }
      aria-pressed={isPlaying}
      data-ocid="ambient_audio.toggle"
      className="brass fixed bottom-5 right-5 z-50 flex size-11 items-center justify-center rounded-full text-foreground shadow-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isPlaying ? (
        <Pause className="size-4" aria-hidden="true" />
      ) : (
        <Play className="ml-0.5 size-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default AmbientAudioPlayer;
