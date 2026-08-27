import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const THEME_TRACK_SRC = "/assets/audio/theme.mp3";

/**
 * Small fixed play/pause control for the ambient background theme song.
 *
 * A single `Audio` object is created once and kept alive for the whole
 * component lifetime (not re-created via JSX props), so playback survives
 * re-renders and `loop` reliably restarts the track at the end instead of
 * stopping.
 *
 * Autoplay is attempted on mount; browsers that block unmuted autoplay
 * will silently fail, and playback then starts on the first user gesture
 * anywhere on the page instead — except on the toggle button itself,
 * whose own click already carries the play/pause intent and must not be
 * second-guessed by the generic gesture listener (that race was causing
 * the button to start and immediately re-pause on the very first click).
 */
export function AmbientAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(THEME_TRACK_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.35;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    const tryPlay = () => {
      if (userPausedRef.current) return;
      audio.play().catch(() => {
        // Autoplay blocked — wait for a user gesture.
      });
    };
    tryPlay();

    const onFirstGesture = (event: Event) => {
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
      document.removeEventListener("pointerdown", onFirstGesture);
      document.removeEventListener("keydown", onFirstGesture);
    };
    document.addEventListener("pointerdown", onFirstGesture);
    document.addEventListener("keydown", onFirstGesture);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      document.removeEventListener("pointerdown", onFirstGesture);
      document.removeEventListener("keydown", onFirstGesture);
      audio.pause();
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
      className="glass-panel fixed bottom-5 right-5 z-50 flex size-11 items-center justify-center rounded-full text-foreground shadow-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
