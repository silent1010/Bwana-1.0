import React from 'react';

interface BwanaLogoProps {
  variant?: 'full' | 'compact' | 'mark-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

export const BwanaLogo: React.FC<BwanaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  // Sizing configurations
  const markDimensions = {
    sm: { w: 28, h: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { w: 36, h: 36, text: 'text-xl', sub: 'text-[10px]' },
    lg: { w: 44, h: 44, text: 'text-2xl', sub: 'text-xs' },
    xl: { w: 56, h: 56, text: 'text-3xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Bespoke Geometric Emblem */}
      <svg
        width={markDimensions.w}
        height={markDimensions.h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bwana-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="bwana-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="bwana-shadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.18" floodColor="#047857" />
          </filter>
        </defs>

        {/* Outer Hexagonal Shield (Zambian Sovereignty & Trust) */}
        <path
          d="M24 3L43 11V26C43 35.8 34.9 44 24 46C13.1 44 5 35.8 5 26V11L24 3Z"
          fill="url(#bwana-grad-primary)"
          filter="url(#bwana-shadow)"
        />

        {/* Inner Stylized Architectural "B" & Open Portal */}
        {/* Left Vertical Spine */}
        <path
          d="M16 14C16 12.8954 16.8954 12 18 12H21C22.1046 12 23 12.8954 23 14V34C23 35.1046 22.1046 36 21 36H18C16.8954 36 16 35.1046 16 34V14Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* Top Loop of 'B' */}
        <path
          d="M22 13H28.5C31.5376 13 34 15.4624 34 18.5C34 21.5376 31.5376 24 28.5 24H22V13Z"
          fill="#FFFFFF"
          fillOpacity="0.92"
        />

        {/* Bottom Loop of 'B' */}
        <path
          d="M22 23.5H30C33.3137 23.5 36 26.1863 36 29.5C36 32.8137 33.3137 35.5 30 35.5H22V23.5Z"
          fill="#FFFFFF"
          fillOpacity="0.96"
        />

        {/* Center Negative Space Cutouts */}
        <rect x="23" y="16.5" width="5.5" height="4.5" rx="1.5" fill="#047857" />
        <rect x="23" y="27" width="7" height="5" rx="1.5" fill="#047857" />

        {/* Copper Ore Accent Spark (Zambian Copper Heritage) */}
        <circle cx="36" cy="12" r="3.5" fill="url(#bwana-grad-accent)" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>

      {/* Brand Wordmark & Tagline */}
      {variant !== 'mark-only' && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 leading-none">
            <span
              className={`font-black tracking-tight font-display text-stone-900 dark:text-white ${markDimensions.text}`}
            >
              Bwana
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 self-baseline mt-1" title="Zambian Copper Accent" />
          </div>

          {showSubtitle && variant === 'full' && (
            <span
              className={`font-medium tracking-wider uppercase text-emerald-700 dark:text-emerald-400 font-sans mt-0.5 ${markDimensions.sub}`}
            >
              Commerce · Zambia
            </span>
          )}
        </div>
      )}
    </div>
  );
};
