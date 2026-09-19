import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'full' | 'icon' | 'badge';
  highContrast?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  variant = 'full',
  highContrast = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Emblem SVG: Speech bubble + Camera viewport corners + Hand gesture outline */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden transition-transform duration-200 hover:scale-105"
        style={{
          width: size,
          height: size,
          background: highContrast
            ? '#0F172A'
            : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          boxShadow: highContrast
            ? '0 2px 0 #020617'
            : '0 4px 14px rgba(30, 58, 138, 0.35)',
          border: highContrast ? '2px solid #020617' : '1px solid rgba(99, 102, 241, 0.4)',
        }}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Outer Camera Viewport Aperture Corners */}
          <path
            d="M6 12V8C6 6.89543 6.89543 6 8 6H12"
            stroke={highContrast ? '#38BDF8' : '#60A5FA'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M28 6H32C33.1046 6 34 6.89543 34 8V12"
            stroke={highContrast ? '#38BDF8' : '#60A5FA'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M34 28V32C34 33.1046 33.1046 34 32 34H28"
            stroke={highContrast ? '#38BDF8' : '#60A5FA'}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 34H8C6.89543 34 6 33.1046 6 32V28"
            stroke={highContrast ? '#38BDF8' : '#60A5FA'}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Speech Bubble Base */}
          <path
            d="M11 14C11 11.7909 12.7909 10 15 10H25C27.2091 10 29 11.7909 29 14V22C29 24.2091 27.2091 26 25 26H20L15 29.5V26H15C12.7909 26 11 24.2091 11 22V14Z"
            fill="url(#brandGrad)"
            stroke={highContrast ? '#FFFFFF' : '#818CF8'}
            strokeWidth="1.2"
          />

          {/* Hand Silhouette in center of Speech Bubble */}
          <path
            d="M18 21.5V15.5C18 15.0 18.3 14.7 18.7 14.7C19.1 14.7 19.4 15.0 19.4 15.5V18.2M19.4 17V14C19.4 13.5 19.7 13.2 20.1 13.2C20.5 13.2 20.8 13.5 20.8 14V17.5M20.8 17.5V14.8C20.8 14.3 21.1 14 21.5 14C21.9 14 22.2 14.3 22.2 14.8V19M22.2 17V16C22.2 15.5 22.5 15.2 22.9 15.2C23.3 15.2 23.6 15.5 23.6 16V20.5C23.6 22.5 22 23.5 20.2 23.5C18.5 23.5 17 22.2 17 20.8L17.5 19.2"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Broadcast Soundwave / Visual Signal Dots */}
          <circle cx="27" cy="13" r="1" fill="#34D399" />
          <circle cx="27" cy="17" r="0.75" fill="#38BDF8" />

          <defs>
            <linearGradient id="brandGrad" x1="11" y1="10" x2="29" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight text-sm uppercase ${
                highContrast ? 'text-slate-950' : 'text-white'
              }`}
            >
              Silent Meeting Assistant
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                highContrast
                  ? 'bg-blue-100 text-blue-950 border border-blue-950'
                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/60'
              }`}
            >
              PRO
            </span>
          </div>
          <span
            className={`text-[10px] font-medium leading-none ${
              highContrast ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Always-On-Top Meeting Intelligence &amp; Gesture Studio
          </span>
        </div>
      )}
    </div>
  );
};
