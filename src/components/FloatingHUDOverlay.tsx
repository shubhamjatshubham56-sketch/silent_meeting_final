import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Settings, Code, Sparkles, Move, Maximize2, Minimize2, Eye, EyeOff, Camera, Sun, Moon } from 'lucide-react';
import { GestureMapping, AppTheme } from '../types';

interface FloatingHUDOverlayProps {
  isTracking: boolean;
  onToggleTracking: () => void;
  onClearText: () => void;
  onOpenSettings: () => void;
  onOpenCode: () => void;
  currentMessage: string;
  activeGesture: GestureMapping | null;
  cooldownProgress: number; // 0 to 1
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onStartCamera: () => void;
  onTriggerSimulatedGesture: (gesture: GestureMapping) => void;
  availableGestures: GestureMapping[];
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const FloatingHUDOverlay: React.FC<FloatingHUDOverlayProps> = ({
  isTracking,
  onToggleTracking,
  onClearText,
  onOpenSettings,
  onOpenCode,
  currentMessage,
  activeGesture,
  cooldownProgress,
  videoRef,
  canvasRef,
  isCameraActive,
  onStartCamera,
  onTriggerSimulatedGesture,
  availableGestures,
  theme = 'dark',
  onToggleTheme,
}) => {
  // Draggable positioning state
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, initialX: 0, initialY: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [opacity, setOpacity] = useState(0.96);

  const isHighContrast = theme === 'high-contrast-light';

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header handle
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 650, dragStartRef.current.initialX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 300, dragStartRef.current.initialY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const badgeColor = activeGesture ? activeGesture.badgeColor : '#3B82F6';

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        backgroundColor: isHighContrast
          ? `rgba(255, 255, 255, ${opacity})`
          : `rgba(15, 23, 42, ${opacity})`,
        backdropFilter: 'blur(16px)',
      }}
      className={`absolute z-30 w-[640px] max-w-[94vw] rounded-2xl transition-shadow duration-300 ${
        isHighContrast
          ? 'border-2 border-slate-950 shadow-[0_20px_60px_rgba(0,0,0,0.25)] text-slate-950'
          : 'border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-slate-100'
      } ${
        isDragging
          ? isHighContrast
            ? 'cursor-grabbing shadow-[0_25px_70px_rgba(0,0,0,0.4)]'
            : 'cursor-grabbing shadow-[0_25px_70px_rgba(59,130,246,0.3)]'
          : 'cursor-default'
      }`}
    >
      {/* Overlay Drag Bar / Title Header */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-11 px-4 rounded-t-2xl flex items-center justify-between cursor-grab select-none transition-colors ${
          isHighContrast
            ? 'bg-slate-100 border-b-2 border-slate-950 text-slate-950'
            : 'bg-slate-900/90 border-b border-slate-800/80 text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Move className={`w-3.5 h-3.5 ${isHighContrast ? 'text-slate-900' : 'text-slate-400'}`} />
          <span
            className={`text-[11px] font-black tracking-widest uppercase ${
              isHighContrast ? 'text-slate-950' : 'text-slate-300'
            }`}
          >
            Silent Meeting Assistant
          </span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded font-mono font-black ${
              isHighContrast
                ? 'bg-amber-300 text-slate-950 border border-slate-950'
                : 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
            }`}
          >
            ALWAYS-ON-TOP HUD
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher in HUD */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all ${
                isHighContrast
                  ? 'bg-slate-950 text-white hover:bg-slate-800 border border-slate-950'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title={isHighContrast ? 'Switch to Dark Theme' : 'Switch to High-Contrast Light Mode'}
            >
              {isHighContrast ? <Moon className="w-3 h-3 text-amber-300" /> : <Sun className="w-3 h-3 text-amber-300" />}
              <span>{isHighContrast ? 'Dark' : 'High Contrast'}</span>
            </button>
          )}

          {/* Tracking Status Pill */}
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black flex items-center gap-1.5 transition-colors ${
              isTracking
                ? isHighContrast
                  ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-900'
                  : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                : isHighContrast
                ? 'bg-red-100 text-red-950 border-2 border-red-900'
                : 'bg-red-950/80 text-red-400 border border-red-700/60'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isTracking
                  ? isHighContrast
                    ? 'bg-emerald-700 animate-pulse'
                    : 'bg-emerald-400 animate-pulse'
                  : isHighContrast
                  ? 'bg-red-700'
                  : 'bg-red-400'
              }`}
            />
            {isTracking ? '● TRACKING ACTIVE (30+ FPS)' : '|| TRACKING PAUSED'}
          </span>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`p-1 rounded transition-colors ${
              isHighContrast
                ? 'hover:bg-slate-200 text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-3">
          {/* Control Bar: Toggles & Quick Actions */}
          <div
            className={`flex items-center justify-between gap-2 pb-2 border-b ${
              isHighContrast ? 'border-slate-300' : 'border-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleTracking}
                className={`text-xs px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all shadow-sm ${
                  isTracking
                    ? isHighContrast
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-2 border-slate-950'
                      : 'bg-amber-600/90 hover:bg-amber-600 text-white'
                    : isHighContrast
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-950'
                    : 'bg-emerald-600/90 hover:bg-emerald-600 text-white'
                }`}
              >
                {isTracking ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause Tracking
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Resume Tracking
                  </>
                )}
              </button>

              <button
                onClick={onClearText}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  isHighContrast
                    ? 'bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-950 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear HUD
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSettings}
                className={`text-xs px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-colors shadow-sm ${
                  isHighContrast
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-slate-950'
                    : 'bg-indigo-600/90 hover:bg-indigo-600 text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> ⚙ Settings &amp; Macros
              </button>
              <button
                onClick={onOpenCode}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                  isHighContrast
                    ? 'bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
                title="View & Export Python Source Files"
              >
                <Code className={`w-3.5 h-3.5 ${isHighContrast ? 'text-blue-700' : 'text-blue-400'}`} /> Python Code
              </button>
            </div>
          </div>

          {/* Main Overlay Body: Camera Preview & High-Contrast Transcription Box */}
          <div className="grid grid-cols-12 gap-3 items-stretch">
            {/* Left: Live Camera & Hand Skeleton Preview */}
            <div
              className={`col-span-4 relative rounded-xl overflow-hidden flex flex-col justify-between aspect-[4/3] group transition-colors ${
                isHighContrast
                  ? 'bg-slate-100 border-2 border-slate-950 shadow-inner'
                  : 'bg-slate-950 border border-slate-800 shadow-inner'
              }`}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none -scale-x-100"
              />

              {!isCameraActive && (
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center p-3 text-center ${
                    isHighContrast ? 'bg-slate-100/95' : 'bg-slate-950/90'
                  }`}
                >
                  <Camera className={`w-6 h-6 mb-2 ${isHighContrast ? 'text-slate-600' : 'text-slate-500'}`} />
                  <p className={`text-[11px] font-bold mb-2 ${isHighContrast ? 'text-slate-800' : 'text-slate-400'}`}>
                    Webcam not connected
                  </p>
                  <button
                    onClick={onStartCamera}
                    className={`text-[11px] px-3 py-1 rounded font-black transition-all ${
                      isHighContrast
                        ? 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-950'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Camera Status Bar */}
              <div
                className={`z-10 px-2 py-1 flex items-center justify-between text-[9px] font-mono font-bold border-b ${
                  isHighContrast
                    ? 'bg-white/95 text-slate-950 border-slate-950'
                    : 'bg-slate-950/80 backdrop-blur text-slate-400 border-slate-800'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isCameraActive
                        ? isHighContrast
                          ? 'bg-emerald-600 animate-pulse'
                          : 'bg-emerald-400 animate-pulse'
                        : 'bg-slate-500'
                    }`}
                  />
                  30+ FPS
                </span>
                <span>MediaPipe 3D</span>
              </div>

              <div
                className={`z-10 px-2 py-0.5 text-[9px] font-bold text-center ${
                  isHighContrast
                    ? 'bg-white/95 text-slate-950 border-t border-slate-300'
                    : 'bg-slate-950/85 backdrop-blur text-slate-400'
                }`}
              >
                Front Camera View
              </div>
            </div>

            {/* Right: Prominent High-Contrast Transcription Display Box */}
            <div
              style={{
                borderColor: isHighContrast ? '#020617' : activeGesture ? badgeColor : '#334155',
                boxShadow: isHighContrast
                  ? '0 6px 20px rgba(0,0,0,0.18)'
                  : activeGesture
                  ? `0 0 25px ${badgeColor}33`
                  : 'none',
              }}
              className={`col-span-8 rounded-xl p-3.5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                isHighContrast
                  ? 'bg-white border-4 border-slate-950 text-slate-950'
                  : 'bg-black/95 border-2 text-white'
              }`}
            >
              {/* Cooldown progress bar overlay at top of transcription box */}
              {cooldownProgress > 0 && (
                <div
                  style={{
                    width: `${(1 - cooldownProgress) * 100}%`,
                    backgroundColor: isHighContrast ? '#020617' : badgeColor,
                  }}
                  className="absolute top-0 left-0 h-1.5 transition-all duration-100"
                />
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ color: isHighContrast ? '#020617' : badgeColor }}
                      className="text-[11px] font-black tracking-wider uppercase font-mono"
                    >
                      {activeGesture ? `DETECTED: ${activeGesture.label}` : 'LISTENING / READY'}
                    </span>
                    {activeGesture && (
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                          isHighContrast
                            ? 'bg-blue-100 text-blue-950 border-blue-900'
                            : 'bg-blue-950 text-blue-300 border border-blue-700/60'
                        }`}
                      >
                        {activeGesture.category}
                      </span>
                    )}
                  </div>
                  {cooldownProgress > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isHighContrast ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      Cooldown {Math.ceil(cooldownProgress * (activeGesture?.cooldown || 2))}s
                    </span>
                  )}
                </div>

                {/* Main Prominent Transcription Message */}
                <div className="min-h-[58px] flex items-center">
                  <p
                    className={`text-xl sm:text-2xl font-black leading-snug tracking-tight select-text ${
                      isHighContrast ? 'text-black font-black' : 'text-white'
                    }`}
                  >
                    {currentMessage || 'Awaiting hand gesture...'}
                  </p>
                </div>
              </div>

              {/* Sub-bar showing accessibility tip */}
              <div
                className={`pt-2 border-t flex items-center justify-between text-[10px] font-bold ${
                  isHighContrast
                    ? 'border-slate-300 text-slate-800'
                    : 'border-slate-900 text-slate-400'
                }`}
              >
                <span>Hold gesture for 0.3s to confirm consensus</span>
                <span className={`font-mono ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                  10-frame buffer
                </span>
              </div>
            </div>
          </div>

          {/* Quick Gesture Trigger Bar (Allows instant testing with 1 click) */}
          <div
            className={`pt-2 border-t ${
              isHighContrast ? 'border-slate-300' : 'border-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isHighContrast ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <Sparkles className={`w-3 h-3 ${isHighContrast ? 'text-amber-600' : 'text-amber-400'}`} />
                Quick Test Gestures (Click to simulate MediaPipe trigger):
              </span>
              <span className={`text-[10px] font-bold ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                Live or Simulated Input
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {availableGestures.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onTriggerSimulatedGesture(g)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                    isHighContrast
                      ? activeGesture?.id === g.id
                        ? 'bg-blue-100 text-blue-950 border-2 border-blue-900 shadow-md ring-2 ring-blue-900/40'
                        : 'bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-900 shadow-sm'
                      : activeGesture?.id === g.id
                      ? 'bg-slate-800 text-white border-blue-500 ring-1 ring-blue-500 shadow-md'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span
                    style={{ backgroundColor: g.badgeColor }}
                    className="h-2.5 w-2.5 rounded-full inline-block border border-black/30"
                  />
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
