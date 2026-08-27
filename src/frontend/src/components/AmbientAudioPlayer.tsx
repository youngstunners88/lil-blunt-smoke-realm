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
 * Autoplay is attempted as soon as the track is ready; browsers that
 * block unmuted autoplay will silently fail, and playback then starts on
 * the first user gesture anywhere on the page instead — except on the
 * toggle button itself, whose own click already carries the play/pause
 * intent and must not be second-guessed by the generic gesture listener.
 */
export function AmbientAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.35;
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
        // Autoplay blocked — wait for a user gesture.
      });
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
      tryPlay();
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
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
