import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const THEME_TRACK_SRC = "/assets/audio/theme.mp3";

/**
 * Small fixed play/pause control for the ambient background theme song.
 * Attempts autoplay on mount; browsers that block unmuted autoplay will
 * silently fail, and playback then starts on the first user interaction
 * (click, keydown, touch) instead. The button always reflects and
 * controls the true playback state either way.
 */
export function AmbientAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;

    const attemptAutoplay = () => {
      audio.play().catch(() => {
        // Autoplay blocked — wait for a user gesture.
      });
    };
    attemptAutoplay();

    const playOnFirstGesture = () => {
      attemptAutoplay();
    };
    window.addEventListener("pointerdown", playOnFirstGesture, {
      once: true,
    });
    window.addEventListener("keydown", playOnFirstGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", playOnFirstGesture);
      window.removeEventListener("keydown", playOnFirstGesture);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: instrumental ambient theme, no dialogue to caption */}
      <audio
        ref={audioRef}
        src={THEME_TRACK_SRC}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
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
    </>
  );
}

export default AmbientAudioPlayer;
