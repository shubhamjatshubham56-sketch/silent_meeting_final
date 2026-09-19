import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mic,
  Brain,
  ShieldCheck,
  Bell,
  ChevronDown,
  LogOut,
  LogIn,
  Sparkles,
  Layers,
  Compass,
} from 'lucide-react';
import { AuthUserState } from '../types';
import { SilentBridgeLogo } from './SilentBridgeLogo';
import shrimAvatarImg from '../assets/images/shrim_avatar_1789792741812.jpg';

interface MeetingHeaderProps {
  meetingName: string;
  elapsedSeconds?: number;
  isCameraActive: boolean;
  onToggleCamera?: () => void;
  isMicActive?: boolean;
  onToggleMic?: () => void;
  isVirtualCamConnected?: boolean;
  isAIAssistantOnline?: boolean;
  isFirestoreConnected?: boolean;
  userName: string;
  user?: AuthUserState | null;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
  onOpenSchedule?: () => void;
  onOpenProfile?: () => void;
  onOpenSplash?: () => void;
  currentMode?: string;
  onSelectMode?: (mode: string) => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({
  meetingName,
  elapsedSeconds = 754,
  isCameraActive,
  onToggleCamera,
  isMicActive = false,
  onToggleMic,
  isVirtualCamConnected = true,
  isAIAssistantOnline = true,
  isFirestoreConnected = true,
  userName = 'Shrim Yadav',
  user,
  onSignInGoogle,
  onSignOut,
  onOpenSchedule,
  onOpenProfile,
  onOpenSplash,
  currentMode = 'Meeting Mode',
  onSelectMode,
}) => {
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const authMenuRef = useRef<HTMLDivElement | null>(null);
  const modeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (authMenuRef.current && !authMenuRef.current.contains(e.target as Node)) {
        setIsAuthMenuOpen(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setIsModeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayName = user?.displayName || userName || 'Shrim Yadav';
  const displayPhoto = user?.photoURL || shrimAvatarImg;

  return (
    <header
      id="meeting-header"
      className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800/80 select-none z-30 shrink-0 bg-[#05101E]"
    >
      {/* 1. Left: SilentBridge AI Infinity Brand Logo */}
      <div className="flex items-center gap-4">
        <div className="cursor-pointer" onClick={onOpenSplash} title="View SilentBridge Space Initialization">
          <SilentBridgeLogo size={36} showText={true} tagline="Communication Without Barriers" />
        </div>

        {/* Meeting Mode Selector Dropdown Pill from Screenshot */}
        <div className="relative hidden md:block" ref={modeMenuRef}>
          <button
            onClick={() => setIsModeMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#08182B] border border-cyan-500/30 hover:border-cyan-400 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{currentMode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isModeMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-[#091B30] border border-cyan-500/40 rounded-2xl shadow-2xl py-1.5 z-50 text-xs text-slate-200 backdrop-blur-xl">
              {['Meeting Mode', 'Live Translate Mode', 'Classroom Mode', 'Presentation Mode'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    onSelectMode?.(mode);
                    setIsModeMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-800/80 transition-colors flex items-center justify-between ${
                    currentMode === mode ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>{mode}</span>
                  {currentMode === mode && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Center/Right: Status Badges from Screenshot */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Camera Ready */}
        <button
          onClick={onToggleCamera}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08182B] border border-cyan-500/30 hover:border-cyan-400 text-xs text-slate-300 transition-colors cursor-pointer"
          title="Toggle camera"
        >
          <Video className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">Camera</span>
          <span className={`text-[11px] font-bold ${isCameraActive ? 'text-cyan-400' : 'text-slate-400'}`}>
            {isCameraActive ? 'Ready' : 'Off'}
          </span>
        </button>

        {/* Mic Ready */}
        <button
          onClick={onToggleMic}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08182B] border border-cyan-500/30 hover:border-cyan-400 text-xs text-slate-300 transition-colors cursor-pointer"
          title="Toggle microphone"
        >
          <Mic className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-white">Mic</span>
          <span className={`text-[11px] font-bold ${isMicActive ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isMicActive ? 'Ready' : 'Muted'}
          </span>
        </button>

        {/* AI Recognition Active */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08182B] border border-emerald-500/30 text-xs text-slate-300">
          <Brain className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-white">AI Recognition</span>
          <span className="text-[11px] font-bold text-emerald-400">Active</span>
        </div>

        {/* Privacy Protected */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08182B] border border-cyan-500/30 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-white">Privacy</span>
          <span className="text-[11px] font-bold text-cyan-400">Protected</span>
        </div>

        {/* Bridge Splash Button */}
        {onOpenSplash && (
          <button
            onClick={onOpenSplash}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#08182B] hover:bg-cyan-950/50 border border-cyan-500/30 text-xs text-cyan-300 transition-colors cursor-pointer"
            title="Open Cosmic Bridge Splash Screen"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline font-semibold">Bridge Space</span>
          </button>
        )}

        {/* Notification Bell with red unread dot */}
        <button
          onClick={() => setHasNotifications(false)}
          className="relative w-8 h-8 rounded-full bg-[#08182B] border border-slate-700/60 hover:border-cyan-400/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#05101E]" />
          )}
        </button>

        {/* User Profile Avatar with Auth Menu */}
        <div className="relative" ref={authMenuRef}>
          <button
            onClick={() => setIsAuthMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-cyan-400/50 transition-all cursor-pointer"
            title="User Profile & Settings"
          >
            <div className="relative">
              <img
                src={displayPhoto}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-cyan-400/50"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#05101E]" />
            </div>
          </button>

          {isAuthMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#091B30] border border-cyan-500/40 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200 backdrop-blur-xl">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <div className="font-bold text-white truncate">{displayName}</div>
                <div className="text-[11px] text-cyan-300 truncate font-mono">
                  {user?.email || 'shrubhamjatshubham56@gmail.com'}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{user ? 'Google Firestore Connected' : 'Local Session Ready'}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsAuthMenuOpen(false);
                  onOpenProfile?.();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Profile &amp; Gesture Studio</span>
              </button>

              <button
                onClick={() => {
                  setIsAuthMenuOpen(false);
                  onOpenSchedule?.();
                }}
                className="w-full text-left px-4 py-2 hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Schedule &amp; Tasks</span>
              </button>

              <div className="border-t border-slate-800 my-1" />

              {user ? (
                <button
                  onClick={() => {
                    setIsAuthMenuOpen(false);
                    onSignOut?.();
                  }}
                  className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthMenuOpen(false);
                    onSignInGoogle?.();
                  }}
                  className="w-full text-left px-4 py-2 text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
