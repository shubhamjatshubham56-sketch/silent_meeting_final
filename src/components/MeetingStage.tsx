import React from 'react';
import { MeetingPlatform, AppTheme } from '../types';
import { MicOff, Video, Users, MessageSquare, Hand, Share2, MoreVertical, PhoneOff, Shield, Settings, LayoutGrid, MonitorPlay } from 'lucide-react';

interface MeetingStageProps {
  platform: MeetingPlatform;
  onPlatformChange: (platform: MeetingPlatform) => void;
  activeTranscription: string | null;
  activeGestureLabel: string | null;
  theme?: AppTheme;
}

export const MeetingStage: React.FC<MeetingStageProps> = ({
  platform,
  onPlatformChange,
  activeTranscription,
  activeGestureLabel,
  theme = 'dark',
}) => {
  const isHighContrast = theme === 'high-contrast-light';

  return (
    <div
      className={`relative flex-1 flex flex-col overflow-hidden select-none transition-colors duration-200 ${
        isHighContrast ? 'bg-slate-100 text-slate-950' : 'bg-[#0B0F19] text-white'
      }`}
    >
      {/* Top Meeting Header Bar */}
      <div
        className={`h-12 px-4 flex items-center justify-between z-10 transition-colors ${
          isHighContrast
            ? 'border-b-2 border-slate-950 bg-white text-slate-950 shadow-sm'
            : 'border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span
              className={`font-extrabold text-xs tracking-wider uppercase ${
                isHighContrast ? 'text-slate-950' : 'text-slate-300'
              }`}
            >
              {platform === 'zoom' ? 'Zoom Video Call' : platform === 'meet' ? 'Google Meet Call' : 'MS Teams Call'}
            </span>
          </div>
          <span className={isHighContrast ? 'text-slate-400 font-bold' : 'text-slate-600 text-xs'}>|</span>
          <span className={`text-xs font-semibold ${isHighContrast ? 'text-slate-800' : 'text-slate-400'}`}>
            Sprint Planning &amp; Architecture Sync
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
              isHighContrast
                ? 'bg-slate-950 text-white border border-slate-950'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            00:24:18
          </span>
        </div>

        {/* Platform Switcher Buttons */}
        <div
          className={`flex items-center rounded-lg p-0.5 border ${
            isHighContrast
              ? 'bg-slate-200 border-2 border-slate-950'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={() => onPlatformChange('zoom')}
            className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
              platform === 'zoom'
                ? isHighContrast
                  ? 'bg-blue-700 text-white shadow-sm border border-blue-900'
                  : 'bg-blue-600 text-white shadow-sm'
                : isHighContrast
                ? 'text-slate-800 hover:text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Zoom View
          </button>
          <button
            onClick={() => onPlatformChange('meet')}
            className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
              platform === 'meet'
                ? isHighContrast
                  ? 'bg-emerald-700 text-white shadow-sm border border-emerald-900'
                  : 'bg-emerald-600 text-white shadow-sm'
                : isHighContrast
                ? 'text-slate-800 hover:text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google Meet
          </button>
          <button
            onClick={() => onPlatformChange('teams')}
            className={`text-xs px-2.5 py-1 rounded font-bold transition-all ${
              platform === 'teams'
                ? isHighContrast
                  ? 'bg-indigo-700 text-white shadow-sm border border-indigo-900'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isHighContrast
                ? 'text-slate-800 hover:text-black font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MS Teams
          </button>
        </div>
      </div>

      {/* Main Video Meeting Stage Grid */}
      <div className="flex-1 p-4 grid grid-cols-12 grid-rows-6 gap-3 min-h-[420px] relative">
        {/* Main Presentation / Key Speaker Tile */}
        <div
          className={`col-span-12 lg:col-span-9 row-span-6 rounded-xl overflow-hidden relative flex flex-col justify-between p-5 transition-colors shadow-xl ${
            isHighContrast
              ? 'bg-white border-2 border-slate-950 shadow-slate-300/60 text-slate-950'
              : 'bg-slate-900/90 border border-slate-800/80 shadow-2xl text-white'
          }`}
        >
          {/* Presentation Screen */}
          <div
            className={`absolute inset-0 p-6 flex flex-col justify-between ${
              isHighContrast
                ? 'bg-slate-50'
                : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold text-xs ${
                  isHighContrast
                    ? 'bg-white border-2 border-slate-950 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 backdrop-blur border-slate-700/60 text-slate-200'
                }`}
              >
                <MonitorPlay className={`w-4 h-4 ${isHighContrast ? 'text-indigo-700' : 'text-indigo-400'}`} />
                <span>Sarah Chen (Screen Sharing: System Architecture)</span>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-1 rounded-md font-bold ${
                  isHighContrast
                    ? 'bg-indigo-100 text-indigo-950 border-2 border-indigo-900'
                    : 'text-indigo-300 bg-indigo-950/80 border border-indigo-700/40'
                }`}
              >
                1080p 60fps Presentation
              </span>
            </div>

            {/* Slide Visual Diagram Content */}
            <div
              className={`max-w-xl mx-auto w-full rounded-xl p-5 backdrop-blur-md transition-colors ${
                isHighContrast
                  ? 'bg-white border-2 border-slate-950 shadow-md'
                  : 'bg-slate-950/70 border border-slate-800'
              }`}
            >
              <div
                className={`flex items-center justify-between border-b pb-3 mb-4 ${
                  isHighContrast ? 'border-slate-300' : 'border-slate-800'
                }`}
              >
                <div>
                  <h3 className={`text-sm font-black ${isHighContrast ? 'text-slate-950' : 'text-slate-100'}`}>
                    Silent Meeting Assistant — Real-Time Pipeline
                  </h3>
                  <p className={`text-[11px] font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                    OpenCV Capture (30+ FPS) ➔ MediaPipe 3D Landmarks ➔ Stabilization Consensus ➔ Floating Overlay HUD
                  </p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isHighContrast
                      ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-900'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  LIVE PIPELINE
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  className={`p-3 rounded-lg border transition-colors ${
                    isHighContrast
                      ? 'bg-blue-50/70 border-2 border-blue-900 text-slate-950'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isHighContrast ? 'text-blue-900' : 'text-blue-400'}`}>
                    1. Video Input
                  </div>
                  <div className={`text-[11px] ${isHighContrast ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                    Front Camera 30+ FPS
                  </div>
                  <div className={`text-[10px] font-mono mt-1 ${isHighContrast ? 'text-slate-600' : 'text-slate-500'}`}>
                    OpenCV VideoCapture
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border transition-colors ${
                    isHighContrast
                      ? 'bg-purple-50/70 border-2 border-purple-900 text-slate-950'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isHighContrast ? 'text-purple-900' : 'text-purple-400'}`}>
                    2. Vision Classifier
                  </div>
                  <div className={`text-[11px] ${isHighContrast ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                    21 3D Landmarks
                  </div>
                  <div className={`text-[10px] font-mono mt-1 ${isHighContrast ? 'text-slate-600' : 'text-slate-500'}`}>
                    MediaPipe Hands
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg border transition-colors ${
                    isHighContrast
                      ? 'bg-emerald-50/70 border-2 border-emerald-900 text-slate-950'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className={`font-bold mb-1 ${isHighContrast ? 'text-emerald-900' : 'text-emerald-400'}`}>
                    3. Floating HUD
                  </div>
                  <div className={`text-[11px] ${isHighContrast ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                    Always-On-Top Window
                  </div>
                  <div className={`text-[10px] font-mono mt-1 ${isHighContrast ? 'text-slate-600' : 'text-slate-500'}`}>
                    PyQt6 SubWindow
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Meeting Subtitle in Meeting (if gesture triggered) */}
            {activeTranscription && (
              <div
                className={`mx-auto max-w-2xl px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md text-center transition-all ${
                  isHighContrast
                    ? 'bg-white border-4 border-slate-950 text-slate-950 shadow-slate-400'
                    : 'bg-black/90 border-2 border-blue-500/80 text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      isHighContrast ? 'text-blue-900' : 'text-blue-400'
                    }`}
                  >
                    [{activeGestureLabel || 'GESTURE'}] YOU BROADCASTED:
                  </span>
                </div>
                <div className={`text-lg font-black tracking-wide ${isHighContrast ? 'text-slate-950' : 'text-white'}`}>
                  "{activeTranscription}"
                </div>
              </div>
            )}

            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                isHighContrast ? 'text-slate-700' : 'text-slate-500'
              }`}
            >
              <span>Host: Sarah Chen (Principal Architect)</span>
              <span>4 participants active</span>
            </div>
          </div>
        </div>

        {/* Remote Attendees Column */}
        <div className="col-span-12 lg:col-span-3 row-span-6 flex flex-col gap-3">
          {/* Sarah Chen (Host) */}
          <div
            className={`flex-1 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 min-h-[90px] border transition-colors ${
              isHighContrast
                ? 'bg-white border-2 border-slate-950 text-slate-950 shadow-sm'
                : 'bg-slate-900/80 border-slate-800/80 text-white'
            }`}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                isHighContrast
                  ? 'bg-gradient-to-t from-slate-100 to-white'
                  : 'bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-black border ${
                  isHighContrast
                    ? 'bg-indigo-100 border-2 border-indigo-900 text-indigo-950'
                    : 'bg-indigo-700/60 border-indigo-400/40 text-indigo-200'
                }`}
              >
                SC
              </div>
            </div>
            <div className="z-10 flex items-center justify-between text-[11px]">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  isHighContrast
                    ? 'bg-white border-2 border-slate-950 text-slate-950'
                    : 'bg-slate-950/80 backdrop-blur text-slate-300'
                }`}
              >
                Sarah Chen (Speaking)
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>

          {/* Marcus Brody */}
          <div
            className={`flex-1 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 min-h-[90px] border transition-colors ${
              isHighContrast
                ? 'bg-white border-2 border-slate-950 text-slate-950 shadow-sm'
                : 'bg-slate-900/80 border-slate-800/80 text-white'
            }`}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                isHighContrast
                  ? 'bg-gradient-to-t from-slate-100 to-white'
                  : 'bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-black border ${
                  isHighContrast
                    ? 'bg-emerald-100 border-2 border-emerald-900 text-emerald-950'
                    : 'bg-emerald-700/60 border-emerald-400/40 text-emerald-200'
                }`}
              >
                MB
              </div>
            </div>
            <div className="z-10 flex items-center justify-between text-[11px]">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  isHighContrast
                    ? 'bg-white border-2 border-slate-950 text-slate-950'
                    : 'bg-slate-950/80 backdrop-blur text-slate-300'
                }`}
              >
                Marcus Brody
              </span>
              <MicOff className="w-3.5 h-3.5 text-red-600" />
            </div>
          </div>

          {/* Elena Rostova */}
          <div
            className={`flex-1 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 min-h-[90px] border transition-colors ${
              isHighContrast
                ? 'bg-white border-2 border-slate-950 text-slate-950 shadow-sm'
                : 'bg-slate-900/80 border-slate-800/80 text-white'
            }`}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                isHighContrast
                  ? 'bg-gradient-to-t from-slate-100 to-white'
                  : 'bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-black border ${
                  isHighContrast
                    ? 'bg-amber-100 border-2 border-amber-900 text-amber-950'
                    : 'bg-amber-700/60 border-amber-400/40 text-amber-200'
                }`}
              >
                ER
              </div>
            </div>
            <div className="z-10 flex items-center justify-between text-[11px]">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  isHighContrast
                    ? 'bg-white border-2 border-slate-950 text-slate-950'
                    : 'bg-slate-950/80 backdrop-blur text-slate-300'
                }`}
              >
                Elena Rostova
              </span>
              <MicOff className="w-3.5 h-3.5 text-red-600" />
            </div>
          </div>

          {/* User Self Tile (On Silent Mode) */}
          <div
            className={`flex-1 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 min-h-[90px] shadow-lg border-2 transition-colors ${
              isHighContrast
                ? 'bg-blue-50/50 border-blue-900 text-slate-950'
                : 'bg-slate-900/95 border-indigo-500/50 text-white'
            }`}
          >
            <div className="z-10 flex items-center justify-between text-[11px]">
              <span
                className={`px-2 py-0.5 rounded font-black border ${
                  isHighContrast
                    ? 'bg-blue-200 text-blue-950 border-blue-900'
                    : 'bg-indigo-950/90 text-indigo-300 border-indigo-700/50'
                }`}
              >
                You (Silent Meeting Assistant Active)
              </span>
              <MicOff className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div
              className={`z-10 flex items-center justify-between text-[10px] font-bold px-2 py-1 rounded border ${
                isHighContrast
                  ? 'bg-white border-slate-950 text-slate-950'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400'
              }`}
            >
              <span>Overlay Connected</span>
              <span className={`font-mono font-bold ${isHighContrast ? 'text-emerald-700' : 'text-emerald-400'}`}>
                30+ FPS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Meeting Call Controls */}
      <div
        className={`h-16 px-6 flex items-center justify-between z-10 transition-colors ${
          isHighContrast
            ? 'bg-white border-t-2 border-slate-950 text-slate-950'
            : 'bg-slate-950 border-t border-slate-800/80 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs ${
              isHighContrast
                ? 'bg-red-100 border-2 border-red-900 text-red-950'
                : 'bg-red-950/50 border-red-800/60 text-red-300'
            }`}
          >
            <MicOff className="w-4 h-4 text-red-600" />
            <span>Microphone Muted (Silent Mode)</span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs ${
              isHighContrast
                ? 'bg-emerald-100 border-2 border-emerald-900 text-emerald-950'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Front Camera Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className={`p-2.5 rounded-full transition-colors ${
              isHighContrast
                ? 'bg-white hover:bg-slate-200 text-slate-950 border-2 border-slate-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            className={`p-2.5 rounded-full transition-colors ${
              isHighContrast
                ? 'bg-white hover:bg-slate-200 text-slate-950 border-2 border-slate-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            className={`p-2.5 rounded-full transition-colors ${
              isHighContrast
                ? 'bg-white hover:bg-slate-200 text-slate-950 border-2 border-slate-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>
          <button
            className={`p-2.5 rounded-full transition-colors ${
              isHighContrast
                ? 'bg-white hover:bg-slate-200 text-slate-950 border-2 border-slate-950'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors flex items-center gap-2 shadow-lg shadow-red-900/30 border-2 border-red-950">
            <PhoneOff className="w-4 h-4" />
            Leave
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-bold ${isHighContrast ? 'text-slate-800' : 'text-slate-500'}`}>
            Encrypted Meeting Feed
          </span>
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};
