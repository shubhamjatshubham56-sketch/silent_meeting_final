import React from 'react';
import {
  Home,
  Video,
  MessageSquare,
  Users,
  Hand,
  Calendar,
  Sparkles,
  Accessibility,
  Settings,
  Activity,
  Sliders,
} from 'lucide-react';
import shrimAvatarImg from '../assets/images/shrim_avatar_1789792741812.jpg';
import { SilentBridgeLogo } from './SilentBridgeLogo';

export type NavigationPage =
  | 'home'
  | 'live-translate'
  | 'conversations'
  | 'meeting'
  | 'gestures'
  | 'intro'
  | 'schedule'
  | 'insights'
  | 'accessibility'
  | 'settings'
  | 'diagnostics';

interface NavigationRailProps {
  activePage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  userName?: string;
  userPhoto?: string | null;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activePage,
  onSelectPage,
  isDemoMode,
  onToggleDemoMode,
  userName = 'Shrim Yadav',
  userPhoto,
}) => {
  const navItems: { id: NavigationPage; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'live-translate', label: 'Live Translate', icon: Video },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'meeting', label: 'Meetings', icon: Users },
    { id: 'gestures', label: 'Gesture Studio', icon: Hand },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
    { id: 'insights', label: 'AI Insights', icon: Sparkles },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="navigation-rail"
      className="w-48 shrink-0 flex flex-col justify-between py-4 px-3 select-none border-r border-slate-800/80 transition-colors z-20 bg-[#05101E]"
    >
      {/* Top Section */}
      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
        {/* Nav Items matching Image 2 sidebar */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="tracking-tight truncate">{item.label}</span>
            </button>
          );
        })}

        {/* Diagnostics shortcut */}
        <button
          onClick={() => onSelectPage('diagnostics')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all mt-1 ${
            activePage === 'diagnostics'
              ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-500 hover:text-emerald-400 hover:bg-slate-800/40'
          }`}
          title="Diagnostics & Landmarks Engine"
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span className="tracking-tight text-[11px]">Diagnostics</span>
        </button>

        {onToggleDemoMode && (
          <button
            onClick={onToggleDemoMode}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-500 hover:text-amber-300 hover:bg-slate-800/40'
            }`}
            title="Toggle Demo Presentation"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="tracking-tight text-[11px]">Demo Mode</span>
          </button>
        )}
      </div>

      {/* Bottom User Profile Pill matching Image 2 */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          onClick={() => onSelectPage('intro')}
          className="w-full flex items-center gap-2.5 p-2 rounded-2xl bg-[#08182B] hover:bg-[#0C223C] border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left group cursor-pointer"
        >
          <div className="relative">
            <img
              src={userPhoto || shrimAvatarImg}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover border border-cyan-400/40"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#08182B]" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
              {userName}
            </span>
            <span className="text-[10px] text-slate-400">User</span>
          </div>
        </button>
      </div>
    </aside>
  );
};
