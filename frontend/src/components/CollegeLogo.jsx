import React from 'react';

export default function CollegeLogo({
  size = 54,
  showTitle = true,
  lightTheme = false,
  subtitle = "KARUR – 639 111"
}) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Official V.S.B. Engineering College Logo Image */}
      <img
        src="/vsb-logo.png"
        alt="V.S.B. Engineering College Logo"
        width={size}
        height={size}
        className="shrink-0 object-contain transition-transform duration-300 hover:scale-105"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: 'transparent',
          objectFit: 'contain'
        }}
      />

      {/* Official College Title & Subtitle */}
      {showTitle && (
        <div className="flex flex-col text-left">
          <span
            className="font-extrabold tracking-tight leading-tight"
            style={{
              fontSize: size > 48 ? '1.25rem' : size > 38 ? '1.05rem' : '0.92rem',
              color: lightTheme ? '#FFFFFF' : '#6E0F0F',
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.02em'
            }}
          >
            V.S.B. ENGINEERING COLLEGE
          </span>
          <span
            className="font-bold tracking-wider uppercase mt-0.5"
            style={{
              fontSize: size > 48 ? '0.72rem' : '0.62rem',
              color: lightTheme ? '#D49A17' : '#666666',
              letterSpacing: '0.08em',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}
