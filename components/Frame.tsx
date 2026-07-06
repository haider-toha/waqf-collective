"use client";

/**
 * Fixed chrome: the wordmark top-left, a quiet pledge link top-right. Both read
 * --fg so they stay legible across the night → deed → night arc.
 */
export function Frame() {
  return (
    <>
      <a href="#top" className="frame-wordmark" aria-label="Waqf Collective, home">
        <svg viewBox="0 0 24 24" aria-hidden className="frame-mark">
          <path
            d="M12 2C16.5 7 16.5 17 12 22C7.5 17 7.5 7 12 2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M12 4.5V19.5" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
        </svg>
        <span className="frame-wordmark__text">Waqf Collective</span>
      </a>
      <a href="#pledge" className="frame-pledge u-label">
        Make a pledge&nbsp;&#8594;
      </a>
    </>
  );
}
