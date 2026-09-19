import React from 'react';
import {
  Sparkles,
  Video,
  Radio,
  Check,
  X,
  Play,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';
import { GestureMapping, UserProfile } from '../types';

interface DemoPresentationViewProps {
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onStartCamera: () => void;
  activeGesture: GestureMapping | null;
  currentMessage: string;
  detectedGestureEvent: {
    label: string;
    confidence: number;
    stabilizing: boolean;
    gestureId: string;
  } | null;
  userProfile: UserProfile;
  availableGestures: GestureMapping[];
  onTriggerGesture: (gesture: GestureMapping) => void;
}

export const DemoPresentationView: React.FC<DemoPresentationViewProps> = ({
  onClose,
  videoRef,
  canvasRef,
  isCameraActive,
  onStartCamera,
  activeGesture,
  currentMessage,
  detectedGestureEvent,
  userProfile,
  availableGestures,
  onTriggerGesture,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col select-none overflow-y-auto"
      style={{ backgroundColor: '#07151D', color: '#F1F5F3' }}
    >
      {/* Top Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-[#123136] bg-[#0A1E25] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#163E32] text-[#2AA879] border border-[#1F8F68]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#F1F5F3] tracking-tight">
              Demo & Gesture Evaluation Mode
            </h1>
            <p className="text-[11px] text-[#9BAEAA]">
              Dedicated evaluation sandbox verifying local gesture recognition and synchronized virtual camera output.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#123E5A] hover:bg-[#1F5D80] text-[#F1F5F3] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit Demo Mode</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Dual Viewports: Input vs Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Viewport 1: Computer Vision Landmark Tracking */}
          <div className="rounded-xl border border-[#123136] bg-[#0A1E25] p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#2AA879]" />
                <span className="text-xs font-bold text-[#F1F5F3]">
                  1. Local Input & Landmark Tracking
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#9BAEAA] bg-[#0D2528] px-2 py-0.5 rounded border border-[#123136]">
                {isCameraActive ? 'MediaPipe 3D Mesh Active' : 'Camera Idle'}
              </span>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#123136] bg-[#07151D] flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                  !isCameraActive ? 'hidden' : 'block'
                }`}
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10 ${
                  !isCameraActive ? 'hidden' : 'block'
                }`}
              />

              {!isCameraActive && (
                <div className="text-center p-4">
                  <span className="text-xs text-[#9BAEAA] block mb-2">Webcam not started</span>
                  <button
                    onClick={onStartCamera}
                    className="px-3 py-1.5 rounded-lg bg-[#1F8F68] text-[#F1F5F3] text-xs font-semibold"
                  >
                    Start Camera
                  </button>
                </div>
              )}

              {/* Status overlay */}
              {detectedGestureEvent && (
                <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded bg-[#0D2528]/90 border border-[#1F8F68] text-[11px] text-[#F1F5F3]">
                  {detectedGestureEvent.stabilizing ? 'Stabilizing: ' : 'Confirmed: '}
                  <strong>{detectedGestureEvent.label}</strong> ({Math.round(detectedGestureEvent.confidence * 100)}%)
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#9BAEAA] leading-relaxed">
              Processes 21 skeletal coordinates locally in-browser with multi-frame stabilization consensus.
            </div>
          </div>

          {/* Viewport 2: Virtual Camera Output Preview */}
          <div className="rounded-xl border border-[#123136] bg-[#0A1E25] p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#2AA879]" />
                <span className="text-xs font-bold text-[#F1F5F3]">
                  2. Virtual Camera Output Stream
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#2AA879] bg-[#163E32] px-2 py-0.5 rounded border border-[#1F8F68]">
                DirectShow Pipeline Active
              </span>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#123136] bg-[#07151D] flex items-center justify-center">
              <video
                playsInline
                muted
                autoPlay
                className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
                  !isCameraActive ? 'hidden' : 'block'
                }`}
              />

              {!isCameraActive && (
                <div className="text-center p-4">
                  <span className="text-xs text-[#9BAEAA]">Clean video pipeline standby</span>
                </div>
              )}

              {/* Lower-third overlay preview */}
              {currentMessage && (
                <div className="absolute bottom-3 left-3 right-3 z-20">
                  <div className="rounded-lg bg-[#0A1E25]/95 border border-[#1F8F68] px-3.5 py-2 text-xs flex items-center gap-2 shadow-xl">
                    <Check className="w-4 h-4 text-[#2AA879] shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-[#F1F5F3] block truncate">
                        "{currentMessage}"
                      </span>
                      <span className="text-[10px] text-[#9BAEAA]">
                        {activeGesture?.label || 'Confirmed Gesture'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-[#9BAEAA] leading-relaxed">
              Output mirrored to DirectShow / OBS virtual webcam driver so remote conference attendees see clean broadcast.
            </div>
          </div>
        </div>

        {/* Rapid Gesture Trigger Sandbox */}
        <div className="rounded-xl border border-[#123136] bg-[#0A1E25] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F1F5F3]">
              One-Click Gesture Simulation (For Evaluation Without Camera)
            </h3>
            <span className="text-[10px] text-[#6F827E]">
              Isolated to Demo Mode only
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {availableGestures.map((gesture) => (
              <button
                key={gesture.id}
                onClick={() => onTriggerGesture(gesture)}
                className="p-2.5 rounded-lg border border-[#123136] bg-[#0D2528] hover:bg-[#123136] hover:border-[#1F8F68] text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F1F5F3] group-hover:text-[#2AA879] truncate">
                    {gesture.label}
                  </span>
                  <Play className="w-3 h-3 text-[#6F827E] group-hover:text-[#2AA879]" />
                </div>
                <div className="text-[10px] text-[#9BAEAA] truncate">
                  "{gesture.text}"
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
