/**
 * The house mark: a leaf-knot built from two crossed ogee petals inside a
 * rounded seed — an Islamic-geometry reading of a sprouting seed. Inherits
 * `currentColor`, so callers set the tone (bronze on both grounds).
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {/* seed outline — a vertical vesica */}
      <path
        d="M16 2.5c5.4 4.6 5.4 22.4 0 27-5.4-4.6-5.4-22.4 0-27Z"
        strokeWidth="1.3"
      />
      {/* crossed petals */}
      <path
        d="M16 6.5c3.3 3 3.3 16 0 19-3.3-3-3.3-16 0-19Z"
        strokeWidth="1"
        opacity="0.75"
      />
      <path d="M16 4.5v23" strokeWidth="0.9" opacity="0.5" />
      <path d="M7.5 16h17" strokeWidth="0.9" opacity="0.5" />
    </svg>
  );
}
