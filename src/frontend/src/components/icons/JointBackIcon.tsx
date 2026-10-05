/**
 * Back-navigation glyph styled as a rolled joint: a tapered paper body
 * that twists to a point on the left (reads as an arrowhead pointing
 * back) with a lit, glowing ember on the right.
 */
export function JointBackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 16"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {/* smoke wisp */}
      <path
        d="M30 3c1.2-1 .2-2.2 1.4-3.2M31.5 5c1-.7.4-1.8 1.3-2.6"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* paper body */}
      <path
        d="M9 6.5h18a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5H9z"
        fill="#e9dcbd"
      />
      {/* twisted tip, tapering to an arrow point on the left */}
      <path d="M9 6.5 3 8l6 3.5v-1.7L6.4 8 9 6.5z" fill="#e9dcbd" />
      <path
        d="M9 6.5 2.4 8 9 11.5"
        stroke="#c9b78f"
        strokeWidth="0.75"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* rolling-paper seam lines */}
      <path d="M14 6.5v5M20 6.5v5" stroke="#c9b78f" strokeWidth="0.6" />
      {/* ember */}
      <circle cx="29.5" cy="8" r="2.6" fill="#ff7a33" />
      <circle cx="29.5" cy="8" r="1.2" fill="#ffd166" />
    </svg>
  );
}

export default JointBackIcon;
