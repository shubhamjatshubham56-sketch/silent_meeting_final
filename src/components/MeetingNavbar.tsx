import React from 'react';
import {
  Radio,
  List,
  Clock,
  Settings as SettingsIcon,
  Hand,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
} from 'lucide-react';

interface MeetingNavbarProps {
  activeTab: 'dashboard' | 'live' | 'commands' | 'history' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'live' | 'commands' | 'history' | 'settings') => void;
  cameraStatus: 'connected' | 'initializing' | 'paused' | 'disconnected' | 'error';
  isTracking: boolean;
  userInitials?: string;
  userName?: string;
  userPhoto?: string | null;
  onOpenProfile?: () => void;
}

export const MeetingNavbar: React.FC<MeetingNavbarProps> = ({
  activeTab,
  onSelectTab,
  cameraStatus,
  isTracking,
  userInitials = 'SA',
  userName = 'Shrim Yadav',
  userPhoto,
  onOpenProfile,
}) => {
  // Compute display status label and dot color
  let statusColor = 'bg-emerald-500';
  let statusText = 'System Active';
  let subText = 'Webcam Connected';

  if (cameraStatus === 'initializing') {
    statusColor = 'bg-amber-400 animate-pulse';
    statusText = 'Initializing';
    subText = 'Connecting Webcam...';
  } else if (cameraStatus === 'paused') {
    statusColor = 'bg-slate-400';
    statusText = 'System Paused';
    subText = 'Tracking on hold';
  } else if (cameraStatus === 'disconnected' || cameraStatus === 'error') {
    statusColor = 'bg-rose-500';
    statusText = 'Camera Disconnected';
    subText = 'Check permissions';
  }

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between z-30 transition-all shadow-xs">
      {/* 1. LEFT: Silent Meeting Assistant Brand Logo & Slogan */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/30">
          <Hand className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
            <span>Silent</span>
            <span className="text-purple-600">Meeting</span>
            <span>Assistant</span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-tight">
            Speak Silently, Be Heard Clearly.
          </p>
        </div>
      </div>

      {/* 2. CENTER: Quick Navigation Pills matching Reference UI */}
      <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
        {/* Live Pill */}
        <button
          onClick={() => onSelectTab('live')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            activeTab === 'live' || activeTab === 'dashboard'
              ? 'bg-blue-50/90 text-blue-600 border-blue-200/80 shadow-xs'
              : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-100/70'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Live</span>
        </button>

        {/* Commands */}
        <button
          onClick={() => onSelectTab('commands')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'commands'
              ? 'bg-purple-50 text-purple-600 border border-purple-200/80'
              : 'text-slate-600 hover:bg-slate-100/70'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Commands</span>
        </button>

        {/* History */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-purple-50 text-purple-600 border border-purple-200/80'
              : 'text-slate-600 hover:bg-slate-100/70'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-purple-50 text-purple-600 border border-purple-200/80'
              : 'text-slate-600 hover:bg-slate-100/70'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* 3. RIGHT: Live System Status & User Profile Avatar */}
      <div className="flex items-center gap-4">
        {/* System Active Status Card */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 shadow-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${statusColor} shadow-xs`} />
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-none">
              {statusText}
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              {subText}
            </span>
          </div>
        </div>

        {/* User Circle Avatar with SA Initials matching image */}
        <button
          onClick={onOpenProfile}
          title={userName}
          className="relative group focus:outline-none"
        >
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500 transition-all"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-purple-400/30 group-hover:ring-purple-500 transition-all shadow-xs">
              {userInitials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </button>
      </div>
    </header>
  );
};
