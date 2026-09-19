import React from 'react';
import {
  Calendar,
  CalendarPlus,
  FileText,
  Video,
  Sliders,
  Sparkles,
  Check,
} from 'lucide-react';
import { TaskItem, MessageSettingsState } from '../types';

interface BottomCardsSectionProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onOpenSchedule: () => void;
  onAddTask: () => void;
  onNewNote: () => void;
  onStartMeeting: () => void;
  messageSettings: MessageSettingsState;
  onUpdateMessageSettings: (updated: Partial<MessageSettingsState>) => void;
}

export const BottomCardsSection: React.FC<BottomCardsSectionProps> = ({
  tasks,
  onToggleTask,
  onOpenSchedule,
  onAddTask,
  onNewNote,
  onStartMeeting,
  messageSettings,
  onUpdateMessageSettings,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full mt-3.5">
      {/* 1. Today's Tasks Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                Today's Tasks
              </span>
            </div>
            <button
              onClick={onOpenSchedule}
              className="text-xs font-medium text-[#0084FF] hover:underline"
            >
              View Schedule
            </button>
          </div>

          {/* Task rows */}
          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-[#0084FF] border-[#0084FF] text-white'
                        : 'border-slate-300 group-hover:border-slate-400 bg-white'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-medium leading-tight truncate ${
                        task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      {task.time}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    task.status === 'In Progress'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : task.status === 'Today'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Quick Actions
            </span>
          </div>

          {/* 2x2 Grid Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Add Task */}
            <button
              onClick={onAddTask}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <CalendarPlus className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Add Task</span>
            </button>

            {/* New Note */}
            <button
              onClick={onNewNote}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">New Note</span>
            </button>

            {/* Start Meeting */}
            <button
              onClick={onStartMeeting}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Start Meeting</span>
            </button>

            {/* Open Schedule */}
            <button
              onClick={onOpenSchedule}
              className="p-3 rounded-xl border border-slate-200/80 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-800">Open Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Message Settings Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Message Settings
            </span>
          </div>

          {/* Form Settings */}
          <div className="space-y-2 text-xs">
            {/* Display Duration */}
            <div className="flex items-center justify-between">
              <label className="text-slate-600 font-medium">Display Duration</label>
              <select
                value={messageSettings.duration}
                onChange={(e) => onUpdateMessageSettings({ duration: Number(e.target.value) })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value={3}>3 seconds</option>
                <option value={5}>5 seconds</option>
                <option value={7}>7 seconds</option>
                <option value={10}>10 seconds</option>
              </select>
            </div>

            {/* Position */}
            <div className="flex items-center justify-between">
              <label className="text-slate-600 font-medium">Position</label>
              <select
                value={messageSettings.position}
                onChange={(e) => onUpdateMessageSettings({ position: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="bottom-center">Bottom Center</option>
                <option value="top-center">Top Center</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between">
              <label className="text-slate-600 font-medium">Font Size</label>
              <select
                value={messageSettings.fontSize}
                onChange={(e) => onUpdateMessageSettings({ fontSize: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>

            {/* High Contrast Mode Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-slate-700 font-medium">High Contrast Mode</label>
              <button
                type="button"
                onClick={() =>
                  onUpdateMessageSettings({ highContrast: !messageSettings.highContrast })
                }
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  messageSettings.highContrast ? 'bg-[#0084FF]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                    messageSettings.highContrast ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
