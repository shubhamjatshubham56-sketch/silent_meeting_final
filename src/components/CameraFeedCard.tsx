import React, { useRef, useState, useEffect } from 'react';
import {
  Video,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Crosshair,
  AlertTriangle,
  RefreshCw,
  CameraOff,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { drawLandmarkConnections, drawHandBoundingBox } from '../utils/handDetection';

interface CameraFeedCardProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onOpenCalibration: () => void;
  detectedGesture: string | null;
  detectedConfidence: number;
  landmarks: any[] | null;
  cameraError: string | null;
  onRetryCamera: () => void;
  fps?: number;
  showSkeleton?: boolean;
  showBoundingBox?: boolean;
  developerMode?: boolean;
  gestureProbabilities?: Record<string, number>;
  cameraStatus?: 'connected' | 'initializing' | 'paused' | 'disconnected' | 'error' | 'permission-denied';
}

export const CameraFeedCard: React.FC<CameraFeedCardProps> = ({
  videoRef,
  canvasRef,
  isCameraActive,
  onToggleCamera,
  isPaused,
  onTogglePause,
  onOpenCalibration,
  detectedGesture,
  detectedConfidence,
  landmarks,
  cameraError,
  onRetryCamera,
  fps = 30,
  showSkeleton = true,
  showBoundingBox = true,
  developerMode = false,
  gestureProbabilities,
  cameraStatus = 'disconnected',
}) => {
  // Waveform bars animation
  const [waveSeed, setWaveSeed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveSeed((s) => (s + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden transition-all h-full min-h-[500px] lg:min-h-[540px]">
      {/* 1. Header Bar: Live Camera Feed & LIVE status badge */}
      <div className="px-5 py-3.5 border-b border-slate-150 flex items-center justify-between flex-shrink-0 bg-white/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
              Live Camera Feed
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Real-time silent gesture capture &amp; landmark vision
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {fps > 0 && isCameraActive && !isPaused && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium mr-1">
              {fps} FPS
            </span>
          )}
          {isCameraActive && !isPaused && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Camera Active</span>
            </div>
          )}
          {isCameraActive && isPaused && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Detection Paused</span>
            </div>
          )}
          {!isCameraActive && cameraStatus === 'initializing' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Starting Camera</span>
            </div>
          )}
          {!isCameraActive && cameraStatus === 'permission-denied' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Permission Denied</span>
            </div>
          )}
          {!isCameraActive && cameraStatus === 'error' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Camera Error</span>
            </div>
          )}
          {!isCameraActive &&
            cameraStatus !== 'initializing' &&
            cameraStatus !== 'permission-denied' &&
            cameraStatus !== 'error' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-600 text-xs font-medium shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Camera Off</span>
              </div>
            )}
        </div>
      </div>

      {/* 2. Main Live Viewport - Enhanced Height (55-65% usable vertical area, min 450px) */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[500px]">
        {/* Hidden Video element capturing user media */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 opacity-0 pointer-events-none"
        />

        {/* Canvas displaying processed video stream with gesture bounding box & landmarks */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
            isCameraActive && !isPaused && !cameraError ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {/* Camera Initializing Screen */}
        {!isCameraActive && cameraStatus === 'initializing' && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 ring-1 ring-amber-500/30">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Starting Camera</h3>
            <p className="text-xs text-slate-300 max-w-xs mb-2">
              Requesting webcam stream and initializing vision pipeline...
            </p>
          </div>
        )}

        {/* Camera Permission / Error Fallback Screen */}
        {cameraError && !isCameraActive && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 ring-1 ring-rose-500/40">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {cameraStatus === 'permission-denied'
                ? 'Camera Permission Required'
                : cameraError.includes('No camera')
                ? 'No Camera Detected'
                : 'Camera Unavailable'}
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed font-medium">
              {cameraError}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onRetryCamera}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={onOpenCalibration}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Calibration Guide
              </button>
            </div>
          </div>
        )}

        {/* Camera Off / Inactive Screen */}
        {!isCameraActive && !cameraError && cameraStatus !== 'initializing' && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-3 ring-1 ring-slate-700/60">
              <CameraOff className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Camera Off</h3>
            <p className="text-xs text-slate-400 max-w-xs mb-4 leading-relaxed">
              Camera is currently off. Click below to start the webcam stream and activate real-time silent gesture recognition.
            </p>
            <button
              onClick={onToggleCamera}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Turn Camera On</span>
            </button>
          </div>
        )}

        {/* Paused State Overlay */}
        {isPaused && isCameraActive && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-2">
              <Pause className="w-6 h-6 fill-current" />
            </div>
            <p className="text-sm font-semibold text-white">Recognition Paused</p>
            <p className="text-[11px] text-slate-300 max-w-xs mb-3">
              Webcam stream is active, but gesture processing is on hold.
            </p>
            <button
              onClick={onTogglePause}
              className="px-4 py-1.5 rounded-lg bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-md"
            >
              Resume Detection
            </button>
          </div>
        )}

        {/* Top-Right Gesture Status Pin if detected */}
        {detectedGesture && isCameraActive && !isPaused && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-purple-500/40 text-white shadow-lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold tracking-tight">
              Gesture: {detectedGesture}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
              {Math.round(detectedConfidence * 100)}%
            </span>
          </div>
        )}

        {/* Developer / Testing Mode HUD Overlay */}
        {developerMode && isCameraActive && !isPaused && (
          <div className="absolute top-4 left-4 z-20 max-w-xs bg-slate-950/85 backdrop-blur-md border border-purple-500/30 text-white p-3 rounded-2xl shadow-xl font-mono text-[10px] space-y-2 pointer-events-none">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-purple-400 font-bold uppercase tracking-wider">Dev Diagnostics</span>
              <span className="text-emerald-400 font-semibold">FPS: {fps}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Landmarks:</span>
                <span className={landmarks && landmarks.length > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {landmarks && landmarks.length > 0 ? `21 Points (Tracked)` : 'Searching...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active Candidate:</span>
                <span className="text-white font-bold">{detectedGesture || 'None (Neutral)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Live Confidence:</span>
                <span className="text-purple-300 font-bold">{Math.round(detectedConfidence * 100)}%</span>
              </div>
            </div>

            {/* Gesture Probabilities distribution */}
            {gestureProbabilities && (
              <div className="pt-1.5 border-t border-slate-800 space-y-1">
                <span className="text-slate-400 block font-semibold">Class Probabilities:</span>
                {Object.entries(gestureProbabilities).map(([key, prob]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-slate-300 capitalize">{key.replace('_', ' ')}:</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${key === detectedGesture ? 'bg-purple-500' : 'bg-slate-500'}`}
                          style={{ width: `${Math.round(prob * 100)}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-[9px] w-6 text-right font-mono">
                        {(prob).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Controls Bar matching Reference UI */}
      <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-200/80 flex items-center justify-between flex-shrink-0 gap-3 flex-wrap sm:flex-nowrap">
        {/* Left Action Buttons: Camera ON/OFF + Pause/Resume */}
        <div className="flex items-center gap-2">
          {/* Main Camera ON/OFF Toggle Button */}
          {isCameraActive ? (
            <button
              onClick={onToggleCamera}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200/80 shadow-xs transition-all cursor-pointer"
              title="Stop webcam stream and release hardware"
            >
              <CameraOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Turn Camera Off</span>
            </button>
          ) : (
            <button
              onClick={onToggleCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              title="Start webcam and activate gesture detection"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Turn Camera On</span>
            </button>
          )}

          {/* Pause / Resume Detection Button (Only active when camera is ON) */}
          {isCameraActive && (
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs border shadow-xs transition-all cursor-pointer ${
                isPaused
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={
                isPaused
                  ? 'Resume gesture detection'
                  : 'Temporarily pause gesture detection without turning off camera'
              }
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-600" />
                  <span>Resume Detection</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-slate-600" />
                  <span>Pause Detection</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Center Equalizer Waveform & 'Detecting Gestures...' Status */}
        <div className="flex items-center gap-3">
          {/* Animated waveform bars */}
          <div className="flex items-center gap-1 h-5">
            {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3, 0.7].map((heightFactor, i) => {
              const animatedH = Math.max(
                4,
                Math.round(
                  18 *
                    Math.abs(Math.sin((waveSeed * 0.15) + (i * 0.7))) *
                    heightFactor
                )
              );
              return (
                <span
                  key={i}
                  style={{ height: `${animatedH}px` }}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    detectedGesture && isCameraActive && !isPaused
                      ? 'bg-purple-600'
                      : isCameraActive && !isPaused
                      ? 'bg-indigo-400'
                      : 'bg-slate-300'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-xs font-semibold text-slate-600 tracking-tight hidden sm:inline-block">
            {!isCameraActive
              ? 'Camera Off'
              : isPaused
              ? 'Detection Paused'
              : detectedGesture
              ? `Detected: ${detectedGesture}`
              : 'Detecting Gestures...'}
          </span>
        </div>

        {/* Calibrate Button */}
        <button
          onClick={onOpenCalibration}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shadow-xs transition-all hover:border-purple-300 cursor-pointer"
        >
          <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
          <span>Calibrate</span>
        </button>
      </div>
    </div>
  );
};
