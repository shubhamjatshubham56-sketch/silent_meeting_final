import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  Radio,
  Bot,
  MoreVertical,
  Volume2,
  VolumeX,
  Activity,
  UserCheck,
  Pin,
  PinOff,
  Info,
  PhoneOff,
  HelpCircle,
  Shield,
} from 'lucide-react';

interface BottomControlBarProps {
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isMicListening?: boolean;
  onToggleMic?: () => void;
  audioLevel?: number;
  isGestureTracking: boolean;
  onToggleGestureTracking: () => void;
  isVirtualCamConnected: boolean;
  onToggleVirtualCam: () => void;
  isIntelligencePanelOpen: boolean;
  onToggleIntelligencePanel: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMessagePinned: boolean;
  onTogglePinMessage: () => void;
  onOpenDiagnostics: () => void;
  onOpenIntro: () => void;
  onLeaveMeeting: () => void;
}

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  isCameraActive,
  onToggleCamera,
  isMicListening = false,
  onToggleMic,
  audioLevel = 0,
  isGestureTracking,
  onToggleGestureTracking,
  isVirtualCamConnected,
  onToggleVirtualCam,
  isIntelligencePanelOpen,
  onToggleIntelligencePanel,
  soundEnabled,
  onToggleSound,
  isMessagePinned,
  onTogglePinMessage,
  onOpenDiagnostics,
  onOpenIntro,
  onLeaveMeeting,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <footer
      className="h-16 px-6 flex items-center justify-center relative select-none border-t z-20"
      style={{
        backgroundColor: '#07151D',
        borderColor: '#123136',
      }}
    >
      {/* Center Action Group: Meeting-style restrained control buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* 1. Camera Control */}
        <button
          onClick={onToggleCamera}
          className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[76px] sm:min-w-[84px] transition-colors border"
          style={{
            backgroundColor: isCameraActive ? '#0D2528' : '#1C1215',
            borderColor: isCameraActive ? '#1F8F68' : '#5A1F28',
            color: isCameraActive ? '#F1F5F3' : '#E06C75',
          }}
          title="Toggle camera video input"
        >
          {isCameraActive ? (
            <Video className="w-4 h-4 text-[#2AA879] mb-0.5" />
          ) : (
            <VideoOff className="w-4 h-4 text-[#E06C75] mb-0.5" />
          )}
          <span className="text-[11px] font-medium leading-tight">Camera</span>
          <span
            className="text-[9px] font-semibold tracking-wider uppercase mt-0.5"
            style={{ color: isCameraActive ? '#2AA879' : '#E06C75' }}
          >
            {isCameraActive ? 'ACTIVE' : 'OFF'}
          </span>
        </button>

        {/* 1.5. Real-Time Mic & Speech Transcription */}
        <button
          onClick={onToggleMic}
          className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[76px] sm:min-w-[84px] transition-colors border relative"
          style={{
            backgroundColor: isMicListening ? '#0D2B22' : '#1C1215',
            borderColor: isMicListening ? '#10B981' : '#5A1F28',
            color: isMicListening ? '#F1F5F3' : '#E06C75',
          }}
          title={isMicListening ? 'Microphone active - Transcribing speech in real-time' : 'Turn on microphone for real-time live transcription'}
        >
          {isMicListening ? (
            <div className="relative mb-0.5">
              <Mic className="w-4 h-4 text-[#10B981]" />
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#10B981] rounded-full animate-ping"
              />
            </div>
          ) : (
            <MicOff className="w-4 h-4 text-[#E06C75] mb-0.5" />
          )}
          <span className="text-[11px] font-medium leading-tight">Live Mic</span>
          <span
            className="text-[9px] font-semibold tracking-wider uppercase mt-0.5"
            style={{ color: isMicListening ? '#10B981' : '#E06C75' }}
          >
            {isMicListening ? 'TRANSCRIBING' : 'MUTED'}
          </span>
          {isMicListening && audioLevel > 0 && (
            <div
              className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#10B981] rounded-full transition-all duration-75"
              style={{ width: `${Math.min(100, Math.max(10, audioLevel))}%`, margin: '0 auto' }}
            />
          )}
        </button>

        {/* 2. Gesture Tracking Control */}
        <button
          onClick={onToggleGestureTracking}
          className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[76px] sm:min-w-[84px] transition-colors border"
          style={{
            backgroundColor: isGestureTracking ? '#0D2528' : '#1F1B12',
            borderColor: isGestureTracking ? '#1F8F68' : '#5A4612',
            color: isGestureTracking ? '#F1F5F3' : '#D97706',
          }}
          title="Toggle hand gesture recognition tracking"
        >
          <Hand
            className={`w-4 h-4 mb-0.5 ${
              isGestureTracking ? 'text-[#2AA879]' : 'text-amber-500'
            }`}
          />
          <span className="text-[11px] font-medium leading-tight">Gestures</span>
          <span
            className="text-[9px] font-semibold tracking-wider uppercase mt-0.5"
            style={{ color: isGestureTracking ? '#2AA879' : '#D97706' }}
          >
            {isGestureTracking ? 'ACTIVE' : 'PAUSED'}
          </span>
        </button>

        {/* 3. Virtual Camera Bridge */}
        <button
          onClick={onToggleVirtualCam}
          className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[76px] sm:min-w-[84px] transition-colors border"
          style={{
            backgroundColor: isVirtualCamConnected ? '#0D2528' : '#0A1E25',
            borderColor: isVirtualCamConnected ? '#1F8F68' : '#123136',
            color: isVirtualCamConnected ? '#F1F5F3' : '#9BAEAA',
          }}
          title="DirectShow Virtual Camera Stream output"
        >
          <Radio
            className={`w-4 h-4 mb-0.5 ${
              isVirtualCamConnected ? 'text-[#2AA879]' : 'text-[#6F827E]'
            }`}
          />
          <span className="text-[11px] font-medium leading-tight">Virtual Cam</span>
          <span
            className="text-[9px] font-semibold tracking-wider uppercase mt-0.5"
            style={{ color: isVirtualCamConnected ? '#2AA879' : '#6F827E' }}
          >
            {isVirtualCamConnected ? 'CONNECTED' : 'STANDBY'}
          </span>
        </button>

        {/* 4. AI / Meeting Intelligence */}
        <button
          onClick={onToggleIntelligencePanel}
          className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[76px] sm:min-w-[84px] transition-colors border"
          style={{
            backgroundColor: isIntelligencePanelOpen ? '#163E32' : '#0D2528',
            borderColor: isIntelligencePanelOpen ? '#2AA879' : '#123136',
            color: isIntelligencePanelOpen ? '#F1F5F3' : '#9BAEAA',
          }}
          title="Toggle Meeting Intelligence panel"
        >
          <Bot
            className={`w-4 h-4 mb-0.5 ${
              isIntelligencePanelOpen ? 'text-[#2AA879]' : 'text-[#9BAEAA]'
            }`}
          />
          <span className="text-[11px] font-medium leading-tight">AI Panel</span>
          <span
            className="text-[9px] font-semibold tracking-wider uppercase mt-0.5"
            style={{ color: isIntelligencePanelOpen ? '#2AA879' : '#9BAEAA' }}
          >
            {isIntelligencePanelOpen ? 'OPEN' : 'ONLINE'}
          </span>
        </button>

        {/* 5. More Menu Dropdown */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center px-4 py-1.5 rounded-lg min-w-[64px] sm:min-w-[74px] transition-colors border"
            style={{
              backgroundColor: isMoreOpen ? '#163E32' : '#0D2528',
              borderColor: isMoreOpen ? '#1F8F68' : '#123136',
              color: '#F1F5F3',
            }}
            title="Additional actions and tools"
          >
            <MoreVertical className="w-4 h-4 mb-0.5 text-[#9BAEAA]" />
            <span className="text-[11px] font-medium leading-tight">More</span>
            <span className="text-[9px] font-semibold tracking-wider uppercase mt-0.5 text-[#6F827E]">
              MENU
            </span>
          </button>

          {/* More Menu Popover Drawer */}
          {isMoreOpen && (
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 rounded-lg shadow-xl border py-1.5 z-50 text-xs animate-in fade-in slide-in-from-bottom-2"
              style={{
                backgroundColor: '#0A1E25',
                borderColor: '#123136',
                color: '#F1F5F3',
              }}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#6F827E] border-b border-[#123136]">
                Meeting Utilities
              </div>

              {/* Pin Message Toggle */}
              <button
                onClick={() => {
                  onTogglePinMessage();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0D2528] transition-colors"
              >
                {isMessagePinned ? (
                  <PinOff className="w-4 h-4 text-amber-400" />
                ) : (
                  <Pin className="w-4 h-4 text-[#9BAEAA]" />
                )}
                <span>{isMessagePinned ? 'Unpin Active Message' : 'Pin Active Message'}</span>
              </button>

              {/* Audio Chime Feedback Toggle */}
              <button
                onClick={onToggleSound}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0D2528] transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#2AA879]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#6F827E]" />
                )}
                <span>Audio Cues: {soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>

              {/* Introduction Macro Shortcut */}
              <button
                onClick={() => {
                  onOpenIntro();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0D2528] transition-colors"
              >
                <UserCheck className="w-4 h-4 text-[#9BAEAA]" />
                <span>Introduction & Profile</span>
              </button>

              {/* Diagnostics Technical View */}
              <button
                onClick={() => {
                  onOpenDiagnostics();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-[#0D2528] transition-colors"
              >
                <Activity className="w-4 h-4 text-[#9BAEAA]" />
                <span>Technical Diagnostics</span>
              </button>

              <div className="my-1 border-t border-[#123136]" />

              {/* Leave / Reset Meeting */}
              <button
                onClick={() => {
                  onLeaveMeeting();
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-400 hover:bg-[#201014] transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Meeting</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
