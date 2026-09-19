import React from 'react';

interface SilentBridgeLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  tagline?: string;
}

export const SilentBridgeLogo: React.FC<SilentBridgeLogoProps> = ({
  className = '',
  size = 36,
  showText = true,
  tagline = 'Communication Without Barriers',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Glowing Infinity Symbol */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size * 0.6 }}
      >
        <svg
          viewBox="0 0 100 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        >
          <defs>
            <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="35%" stopColor="#38BDF8" />
              <stop offset="70%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Glow Stroke */}
          <path
            d="M30 14 C16 14 6 22 6 30 C6 38 16 46 30 46 C42 46 50 36 50 30 C50 24 58 14 70 14 C84 14 94 22 94 30 C94 38 84 46 70 46 C58 46 50 36 50 30 C50 24 42 14 30 14 Z"
            stroke="url(#infinityGradient)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
            filter="url(#glow)"
          />

          {/* Crisp Primary Stroke */}
          <path
            d="M30 14 C16 14 6 22 6 30 C6 38 16 46 30 46 C42 46 50 36 50 30 C50 24 58 14 70 14 C84 14 94 22 94 30 C94 38 84 46 70 46 C58 46 50 36 50 30 C50 24 42 14 30 14 Z"
            stroke="url(#infinityGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Core Highlights */}
          <circle cx="28" cy="22" r="2.5" fill="#E0F2FE" />
          <circle cx="72" cy="38" r="2.5" fill="#F3E8FF" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-base sm:text-lg text-white font-sans">
              SilentBridge <span className="text-cyan-400 font-extrabold">AI</span>
            </span>
          </div>
          {tagline && (
            <span className="text-[11px] font-medium tracking-tight text-cyan-200/70 -mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
