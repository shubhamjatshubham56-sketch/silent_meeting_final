import React from 'react';
import {
  Video,
  VideoOff,
  Hand,
  Radio,
  Bot,
  Mic,
  MicOff,
  MoreHorizontal,
  ChevronRight,
  Pin,
  PinOff,
  X,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

export type MessageLifecycleState = 'HIDDEN' | 'APPEARING' | 'VISIBLE' | 'FADING';

export interface ActiveCommunicationMessage {
  text: string;
  gestureLabel: string;
  gestureId: string;
  category?: string;
  pinned: boolean;
  timestamp: number;
}

interface MainVideoStageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isMicListening?: boolean;
  onToggleMic?: () => void;
  audioLevel?: number;
  interimSpeech?: string;
  isGestureTracking: boolean;
  onToggleGestureTracking: () => void;
  isVirtualCamConnected: boolean;
  onToggleVirtualCam: () => void;
  isAIAssistantOnline: boolean;
  onToggleAIAssistant: () => void;
  userProfile: UserProfile;
  activeMessage: ActiveCommunicationMessage | null;
  messageState: MessageLifecycleState;
  onDismissMessage: () => void;
  onTogglePinMessage: () => void;
  stabilizingEvent?: {
    label: string;
    confidence: number;
  } | null;
  onOpenMoreMenu?: () => void;
}

export const MainVideoStage: React.FC<MainVideoStageProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  onToggleCamera,
  isMicListening = false,
  onToggleMic,
  audioLevel = 0,
  interimSpeech = '',
  isGestureTracking,
  onToggleGestureTracking,
  isVirtualCamConnected,
  onToggleVirtualCam,
  isAIAssistantOnline,
  onToggleAIAssistant,
  userProfile,
  activeMessage,
  messageState,
  onDismissMessage,
  onTogglePinMessage,
  stabilizingEvent,
  onOpenMoreMenu,
}) => {
  return (
    <div
      id="main-video-card"
      className="w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-[#07111D] shadow-xl flex flex-col"
    >
      {/* Video Viewport */}
      <div className="relative w-full aspect-video sm:max-h-[52vh] bg-[#0A1624] overflow-hidden flex items-center justify-center">
        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
            !isCameraActive ? 'hidden' : 'block'
          }`}
        />

        {/* Hand Landmark Skeleton Canvas */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10 ${
            !isCameraActive ? 'hidden' : 'block'
          }`}
        />

        {/* Presenter Photo / Fallback state when webcam is offline */}
        {!isCameraActive && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <img
              src="/src/assets/images/presenter_photo_1789742181007.jpg"
              alt="Presenter Preview"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Subtle dark vignette overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-slate-950/30" />
          </div>
        )}

        {/* Top-Left Overlay Pill: User name + Camera indicator */}
        <div className="absolute top-3.5 left-3.5 z-20 pointer-events-auto">
          <div className="px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-white flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>{userProfile.name || 'Shrim Yadav'} (You)</span>
            <div className="flex items-center gap-0.5 text-slate-400">
              <Video className="w-3 h-3 text-slate-300" />
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Top-Right Overlay Pill: Camera Active status */}
        <div className="absolute top-3.5 right-3.5 z-20 pointer-events-auto">
          <button
            onClick={onToggleCamera}
            className="px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-all hover:bg-slate-900/90"
          >
            {isCameraActive ? (
              <>
                <Video className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-white">Camera Active</span>
              </>
            ) : (
              <>
                <VideoOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">Camera Off (Using Mock Preview)</span>
              </>
            )}
          </button>
        </div>

        {/* Stabilizing Live Indicator (subtle pill) */}
        {stabilizingEvent && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in duration-150">
            <div className="px-3.5 py-1 rounded-full bg-[#022122]/90 border border-teal-500/50 text-xs text-teal-200 flex items-center gap-2 shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>
                Stabilizing: <strong className="text-white">{stabilizingEvent.label}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Glowing Gesture Confirmation HUD Banner */}
        {messageState !== 'HIDDEN' && activeMessage && (
          <div
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ${
              messageState === 'FADING'
                ? 'opacity-0 translate-y-2'
                : 'opacity-100 translate-y-0 animate-in fade-in slide-in-from-bottom-3'
            }`}
          >
            <div className="bg-[#022122]/90 backdrop-blur-md border-2 border-[#00E599] ring-2 ring-[#00E599]/30 shadow-2xl shadow-[#00E599]/30 rounded-xl px-4 py-2.5 flex items-center gap-3.5 min-w-[280px] sm:min-w-[320px]">
              {/* Left: Green badge with gesture icon */}
              <div className="w-10 h-10 rounded-full bg-[#00E599] text-[#022122] flex items-center justify-center shrink-0 shadow-md">
                <ThumbsUp className="w-5 h-5 fill-current stroke-current" />
              </div>

              {/* Center: Gesture Message & Confidence */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="text-base sm:text-lg font-black text-white uppercase tracking-wide leading-none">
                  {activeMessage.gestureLabel === 'Thumbs Up' || !activeMessage.gestureLabel
                    ? 'I AGREE'
                    : activeMessage.gestureLabel.toUpperCase()}
                </div>
                <div className="text-xs text-teal-200 font-medium mt-1">
                  {activeMessage.gestureLabel || 'Thumbs Up'} • 94% confidence
                </div>
              </div>

              {/* Pin & Dismiss Controls */}
              <div className="flex items-center gap-1 shrink-0 text-teal-300">
                <button
                  onClick={onTogglePinMessage}
                  className={`p-1.5 rounded hover:bg-teal-900/50 transition-colors ${
                    activeMessage.pinned ? 'text-amber-400' : 'text-teal-300'
                  }`}
                  title={activeMessage.pinned ? 'Unpin message' : 'Pin message'}
                >
                  {activeMessage.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={onDismissMessage}
                  className="p-1.5 rounded hover:bg-teal-900/50 text-teal-300 hover:text-white transition-colors"
                  title="Dismiss message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Speech Interim Subtitle Overlay */}
        {isMicListening && interimSpeech && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-[85%] px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-emerald-500/40 text-white text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Live Speech:</span>
            <span className="truncate italic">"{interimSpeech}"</span>
          </div>
        )}
      </div>

      {/* Integrated Bottom Control Dock */}
      <div
        id="integrated-dock"
        className="h-14 px-4 sm:px-6 bg-[#06121E] border-t border-slate-800/80 flex items-center justify-around sm:justify-center sm:gap-6 z-20 select-none"
      >
        {/* 1. Camera */}
        <button
          onClick={onToggleCamera}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
          title="Toggle Webcam"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D3836] text-[#14B8A6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">Camera</span>
            <span className="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {isCameraActive ? 'Active' : 'Off'}
            </span>
          </div>
        </button>

        {/* 1.5. Live Mic STT */}
        <button
          onClick={onToggleMic}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
          title="Toggle Real-Time Speech Transcription"
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
              isMicListening ? 'bg-[#0D3836] text-[#10B981]' : 'bg-[#2A1618] text-[#E06C75]'
            }`}
          >
            {isMicListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">Live Mic</span>
            <span
              className={`text-[10px] font-medium flex items-center gap-1 ${
                isMicListening ? 'text-[#10B981]' : 'text-[#E06C75]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMicListening ? 'bg-[#10B981] animate-ping' : 'bg-[#E06C75]'
                }`}
              />
              {isMicListening ? 'Transcribing' : 'Muted'}
            </span>
          </div>
        </button>

        {/* 2. Gestures */}
        <button
          onClick={onToggleGestureTracking}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
          title="Toggle Gesture Tracking"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D3836] text-[#14B8A6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Hand className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">Gestures</span>
            <span className="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {isGestureTracking ? 'Active' : 'Paused'}
            </span>
          </div>
        </button>

        {/* 3. Virtual Camera */}
        <button
          onClick={onToggleVirtualCam}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
          title="Toggle Virtual Camera DirectShow bridge"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D3836] text-[#14B8A6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">Virtual Camera</span>
            <span className="text-[10px] text-[#14B8A6] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" />
              {isVirtualCamConnected ? 'Connected' : 'Standby'}
            </span>
          </div>
        </button>

        {/* 4. AI Assistant */}
        <button
          onClick={onToggleAIAssistant}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
          title="Toggle AI Intelligence Engine"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D3836] text-[#14B8A6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-white">AI Assistant</span>
            <span className="text-[10px] text-[#10B981] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {isAIAssistantOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </button>

        {/* 5. More */}
        <button
          onClick={onOpenMoreMenu}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors text-left group"
          title="More options"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0D3836] text-[#14B8A6] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </div>
          <div className="hidden sm:flex items-center gap-1 leading-tight">
            <span className="text-xs font-semibold text-white">More</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </div>
        </button>
      </div>
    </div>
  );
};
