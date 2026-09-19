import React, { useState, useEffect } from 'react';
import { SilentBridgeLogo } from './SilentBridgeLogo';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import handsConnectingImg from '../assets/images/hands_connecting_1789792723287.jpg';

interface SplashBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SplashBridgeModal: React.FC<SplashBridgeModalProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(72);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Animate progress smoothly towards 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsReady(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030914] select-none overflow-hidden animate-in fade-in duration-300">
      {/* Background Graphic: Cosmic hands connecting with neon particle waves */}
      <div className="absolute inset-0 z-0 opacity-45 mix-blend-screen pointer-events-none">
        <img
          src={handsConnectingImg}
          alt="Hands connecting through glowing energy"
          className="w-full h-full object-cover object-center filter saturate-150 brightness-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030914] via-[#030914]/40 to-[#030914]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030914] via-transparent to-[#030914]" />
      </div>

      {/* Top right subtle tagline from image */}
      <div className="absolute top-6 right-8 z-20 text-right">
        <span className="text-xs font-medium tracking-wider text-cyan-300/80 font-mono">
          More than an app,
          <br />
          it's a bridge.
        </span>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-20 w-9 h-9 rounded-full bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        title="Enter Workspace"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Central Content Column */}
      <div className="relative z-10 max-w-2xl w-full mx-auto px-6 flex flex-col items-center text-center">
        {/* Luminous Brand Infinity Logo */}
        <div className="mb-4">
          <div className="w-24 h-14 mx-auto flex items-center justify-center drop-shadow-[0_0_25px_rgba(34,211,238,0.75)]">
            <svg
              viewBox="0 0 100 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id="splashInfinity" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="35%" stopColor="#38BDF8" />
                  <stop offset="70%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
                <filter id="splashGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                d="M30 14 C16 14 6 22 6 30 C6 38 16 46 30 46 C42 46 50 36 50 30 C50 24 58 14 70 14 C84 14 94 22 94 30 C94 38 84 46 70 46 C58 46 50 36 50 30 C50 24 42 14 30 14 Z"
                stroke="url(#splashInfinity)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
                filter="url(#splashGlow)"
              />
              <path
                d="M30 14 C16 14 6 22 6 30 C6 38 16 46 30 46 C42 46 50 36 50 30 C50 24 58 14 70 14 C84 14 94 22 94 30 C94 38 84 46 70 46 C58 46 50 36 50 30 C50 24 42 14 30 14 Z"
                stroke="url(#splashInfinity)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
          SilentBridge AI
        </h1>
        <p className="text-sm sm:text-base text-cyan-200/90 font-medium tracking-wide mt-1 mb-8">
          Communication Without Barriers
        </p>

        {/* Poetic Tagline from Image 1 */}
        <div className="space-y-1 text-slate-300 text-sm sm:text-base font-normal tracking-wide max-w-md mx-auto my-6">
          <p className="text-cyan-100/90">Different hands. Same words.</p>
          <p className="text-cyan-100/90">Different voices. Same thoughts.</p>
        </div>

        {/* Bottom Loading Progress Container */}
        <div className="w-full max-w-md mt-10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              Initializing your communication space...
            </span>
            <span className="font-mono text-cyan-300 font-semibold">{progress}%</span>
          </div>

          {/* Glowing Gradient Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800/80 p-0.5 border border-cyan-500/30 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 transition-all duration-300 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Launch Action Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer"
            >
              <span>{isReady ? 'Launch Communication Bridge' : 'Enter Workspace'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
