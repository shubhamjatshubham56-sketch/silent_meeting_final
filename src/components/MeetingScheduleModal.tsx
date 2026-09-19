import React, { useState } from 'react';
import { AppTheme, MeetingPlatform, MeetingScheduleItem } from '../types';
import {
  Calendar,
  Clock,
  Video,
  Users,
  X,
  Play,
  CheckCircle,
  Plus,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface MeetingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  schedule: MeetingScheduleItem[];
  onSelectMeeting: (item: MeetingScheduleItem) => void;
  currentMeetingId: string;
}

export const MeetingScheduleModal: React.FC<MeetingScheduleModalProps> = ({
  isOpen,
  onClose,
  theme,
  schedule,
  onSelectMeeting,
  currentMeetingId,
}) => {
  const isHighContrast = theme === 'high-contrast-light';
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'this_week' | 'upcoming'>('all');

  if (!isOpen) return null;

  const filtered = schedule.filter((item) => {
    if (activeTab === 'all') return true;
    return item.period === activeTab;
  });

  const getPlatformLabel = (platform: MeetingPlatform) => {
    switch (platform) {
      case 'zoom':
        return 'Zoom Video';
      case 'meet':
        return 'Google Meet';
      case 'teams':
        return 'Microsoft Teams';
      case 'webex':
        return 'Cisco Webex';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] transition-colors ${
          isHighContrast
            ? 'bg-white border-2 border-slate-950 text-slate-950'
            : 'bg-[#0E131F] border border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`h-16 px-6 flex items-center justify-between border-b ${
            isHighContrast
              ? 'bg-slate-100 border-b-2 border-slate-950 text-slate-950'
              : 'bg-slate-950 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isHighContrast
                  ? 'bg-indigo-100 border-2 border-indigo-950 text-indigo-950'
                  : 'bg-indigo-950 border border-indigo-700/60 text-indigo-400'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">
                Meeting Management &amp; Agenda Schedule
              </h2>
              <p
                className={`text-xs ${
                  isHighContrast ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Select an upcoming conference to load its context, participants, and intent telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isHighContrast
                ? 'hover:bg-slate-200 text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Period Filter Tabs */}
        <div
          className={`flex px-6 border-b text-xs font-bold ${
            isHighContrast
              ? 'bg-slate-50 border-slate-900'
              : 'bg-slate-950/40 border-slate-800'
          }`}
        >
          {(['all', 'today', 'this_week', 'upcoming'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 border-b-2 transition-all uppercase text-[11px] tracking-wider ${
                activeTab === tab
                  ? isHighContrast
                    ? 'border-indigo-700 text-indigo-950 font-black'
                    : 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'all'
                ? 'All Meetings'
                : tab === 'today'
                ? 'Today'
                : tab === 'this_week'
                ? 'This Week'
                : 'Upcoming'}
            </button>
          ))}
        </div>

        {/* Meeting List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No meetings scheduled for this period.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.id === currentMeetingId;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? isHighContrast
                        ? 'bg-indigo-50 border-2 border-indigo-950 shadow-md'
                        : 'bg-slate-900/95 border-2 border-indigo-500 shadow-lg shadow-indigo-950/40'
                      : isHighContrast
                      ? 'bg-white border-2 border-slate-200 hover:border-slate-400 text-slate-950'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          item.platform === 'meet'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.platform === 'zoom'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}
                      >
                        {getPlatformLabel(item.platform)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{item.dateStr}</span>
                      <span className="text-xs font-mono font-bold text-slate-300">• {item.time}</span>
                    </div>

                    {isSelected && (
                      <span className="self-start sm:self-auto text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-black">
                        ● Currently Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black tracking-tight mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{item.topic}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.participantsCount} participants</span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectMeeting(item);
                        onClose();
                      }}
                      className={`text-xs px-4 py-2 rounded-xl font-black flex items-center gap-1.5 transition-all shadow-md ${
                        isSelected
                          ? isHighContrast
                            ? 'bg-slate-950 text-white'
                            : 'bg-indigo-600 text-white'
                          : isHighContrast
                          ? 'bg-indigo-700 hover:bg-indigo-800 text-white border border-indigo-950'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Resume Meeting Mode' : 'Start Meeting Mode'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
