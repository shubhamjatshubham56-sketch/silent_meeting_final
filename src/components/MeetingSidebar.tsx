import React from 'react';
import {
  Home,
  Tv,
  ListOrdered,
  Calendar,
  Clock,
  Settings,
  Target,
  Zap,
  BarChart2,
  Timer,
  ChevronRight,
} from 'lucide-react';

export type SidebarPage = 'dashboard' | 'live-translate' | 'commands' | 'my-schedule' | 'history' | 'settings';

interface QuickStatsProps {
  accuracy: number;
  commandsUsed: number;
  sessionTimeStr: string;
}

interface MeetingSidebarProps {
  activePage: SidebarPage;
  onSelectPage: (page: SidebarPage) => void;
  stats: QuickStatsProps;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MeetingSidebar: React.FC<MeetingSidebarProps> = ({
  activePage,
  onSelectPage,
  stats,
}) => {
  const navItems = [
    { id: 'dashboard' as SidebarPage, label: 'Dashboard', icon: Home },
    { id: 'live-translate' as SidebarPage, label: 'Live Translate', icon: Tv },
    { id: 'commands' as SidebarPage, label: 'Commands', icon: ListOrdered },
    { id: 'my-schedule' as SidebarPage, label: 'My Schedule', icon: Calendar },
    { id: 'history' as SidebarPage, label: 'History', icon: Clock },
    { id: 'settings' as SidebarPage, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 lg:w-60 flex-shrink-0 bg-white/90 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between p-3.5 sm:p-4 z-20 select-none transition-all">
      {/* 1. Main Navigation Links */}
      <div className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-md shadow-indigo-500/25 ring-1 ring-white/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/90" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Middle Decorative Pastel Waves matching Reference UI */}
      <div className="my-auto py-4 px-2 opacity-80 pointer-events-none hidden md:block">
        <svg
          viewBox="0 0 200 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto text-indigo-400"
        >
          <path
            d="M0 30C40 10 70 50 110 30C150 10 180 45 200 35"
            stroke="url(#wave-grad-1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d="M0 42C35 22 65 55 105 38C145 20 175 48 200 42"
            stroke="url(#wave-grad-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="opacity-60"
          />
          <defs>
            <linearGradient id="wave-grad-1" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="0.5" stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="0.5" stopColor="#A78BFA" />
              <stop offset="1" stopColor="#F472B6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3. Bottom Widget: Quick Stats (Reference Image Exact Match) */}
      <div className="bg-slate-50/90 border border-slate-200/70 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-3">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Quick Stats</span>
        </div>

        <div className="space-y-2.5">
          {/* Accuracy */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800">{stats.accuracy}%</span>
              <span className="text-[11px] text-slate-500 font-medium">Accuracy</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              ↑ 5%
            </span>
          </div>

          {/* Commands Used */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800">{stats.commandsUsed}</span>
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[70px]">Commands</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              ↑ 12%
            </span>
          </div>

          {/* Session Time */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
                <Timer className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-800">{stats.sessionTimeStr}</span>
              <span className="text-[11px] text-slate-500 font-medium">Session</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              ↑ 18%
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
