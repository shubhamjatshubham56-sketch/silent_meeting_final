import React from 'react';
import {
  Zap,
  Edit3,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';

export interface QuickCommandItem {
  id: string;
  label: string;
  message: string;
  gesture: string;
  icon: string;
  color?: string;
  enabled: boolean;
  cooldown?: number;
  confidenceThreshold?: number;
  gestureDescription?: string;
}

interface QuickCommandsRowProps {
  commands: QuickCommandItem[];
  activeCommandId: string | null;
  onSelectCommand: (cmd: QuickCommandItem) => void;
  onEditCommands: () => void;
  onToggleCommand?: (id: string) => void;
}

export const QuickCommandsRow: React.FC<QuickCommandsRowProps> = ({
  commands,
  activeCommandId,
  onSelectCommand,
  onEditCommands,
}) => {
  // Helper to render gesture illustration
  const renderGestureIllustration = (gesture: string, id: string) => {
    switch (gesture) {
      case 'ok_sign':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center text-slate-800">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Palm and wrist */}
              <path d="M16 38V30M24 38V32" />
              {/* Three extended fingers: Middle, Ring, Pinky */}
              <path d="M22 20V8C22 6.5 24 6.5 24 8V20" />
              <path d="M26 20V10C26 8.5 28 8.5 28 10V22" />
              <path d="M30 22V13C30 11.5 32 11.5 32 13V26" />
              {/* Thumb and Index circle */}
              <circle cx="17" cy="20" r="5" className="stroke-indigo-600 fill-indigo-50/50" />
              <path d="M12 28C12 24 14 20 17 20" />
            </svg>
          </div>
        );
      case 'pointing_up':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center text-slate-800">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 38V28M26 38V30" />
              {/* Pointing Index */}
              <path d="M22 24V6C22 4.5 24 4.5 24 6V24" className="stroke-blue-600" />
              {/* Middle, Ring, Pinky folded */}
              <path d="M24 19C24 17.5 27 17.5 27 19V25" />
              <path d="M27 20C27 18.5 30 18.5 30 20V26" />
              <path d="M30 22C30 20.5 33 20.5 33 22V28" />
              {/* Thumb across palm */}
              <path d="M18 24C18 21 21 21 21 24" />
            </svg>
          </div>
        );
      case 'open_palm':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center text-slate-800">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 38V30M28 38V30" />
              {/* Open palm with circular repeat icon */}
              <path d="M14 22V14C14 12.5 16 12.5 16 14V22" />
              <path d="M19 20V9C19 7.5 21 7.5 21 9V20" />
              <path d="M24 19V8C24 6.5 26 6.5 26 8V20" />
              <path d="M29 20V10C29 8.5 31 8.5 31 10V22" />
              <path d="M34 22V14C34 12.5 36 12.5 36 14V24" />
            </svg>
          </div>
        );
      case 'folded_hands':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center text-slate-800">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Namaste / prayer hands */}
              <path d="M18 36L22 14C22.5 12 24 12 24 14L28 36" className="stroke-purple-600 fill-purple-50/40" />
              <path d="M24 12V36" strokeDasharray="2 2" />
              <path d="M14 36H32" />
            </svg>
          </div>
        );
      case 'thumbs_up':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center text-slate-800">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Thumbs up outline */}
              <path d="M14 26H18V38H14Z" className="fill-slate-100" />
              <path d="M18 26L23 12C24.5 12 25 13.5 25 15V23H33C35 23 36 24.5 35.5 26.5L33.5 35C33 37 31 38 29 38H18" className="stroke-emerald-600 fill-emerald-50/40" />
            </svg>
          </div>
        );
      case 'thumbs_down':
        return (
          <div className="relative w-12 h-12 flex items-center justify-center text-slate-800">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10 stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* Thumbs down outline */}
              <path d="M14 10H18V22H14Z" className="fill-slate-100" />
              <path d="M18 22L23 36C24.5 36 25 34.5 25 33V25H33C35 25 36 23.5 35.5 21.5L33.5 13C33 11 31 10 29 10H18" className="stroke-rose-600 fill-rose-50/40" />
            </svg>
          </div>
        );
      default:
        return <div className="text-2xl">{id === 'cmd-ok' ? '👌' : '✋'}</div>;
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-5 transition-all">
      {/* 1. Header Bar: Quick Commands & Edit Commands button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 fill-purple-100" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Quick Commands</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Perform these gestures to communicate
            </p>
          </div>
        </div>

        {/* Edit Commands Button */}
        <button
          onClick={onEditCommands}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-semibold text-xs border border-slate-200/80 hover:border-purple-200 transition-all shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Commands</span>
        </button>
      </div>

      {/* 2. Responsive Cards Grid matching Image (6 command cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {commands.map((cmd) => {
          const isActive = activeCommandId === cmd.id || activeCommandId === cmd.gesture;

          return (
            <div
              key={cmd.id}
              onClick={() => onSelectCommand(cmd)}
              className={`group relative rounded-2xl p-3 sm:p-3.5 border cursor-pointer transition-all duration-200 flex flex-col items-center text-center select-none ${
                isActive
                  ? 'bg-gradient-to-b from-purple-50/90 to-white border-purple-400 shadow-md shadow-purple-500/15 ring-2 ring-purple-500/20'
                  : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Top right active checkmark badge if triggered */}
              {isActive && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}

              {/* Gesture Vector Illustration */}
              <div className="mb-2 transition-transform duration-200 group-hover:scale-105">
                {renderGestureIllustration(cmd.gesture, cmd.id)}
              </div>

              {/* Command Title */}
              <span className="text-xs font-bold text-slate-800 leading-tight mb-1 truncate w-full">
                {cmd.label}
              </span>

              {/* Emoji / Subtitle indicator */}
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span>{cmd.icon}</span>
              </div>

              {/* Bottom Subtle Indicator Dot */}
              <div className="mt-2 w-3 h-0.5 rounded-full bg-slate-200 group-hover:bg-purple-400 transition-colors" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
