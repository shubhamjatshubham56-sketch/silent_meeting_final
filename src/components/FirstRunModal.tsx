import React, { useState } from 'react';
import { AppTheme, GestureMapping } from '../types';
import {
  Sparkles,
  Video,
  Radio,
  Hand,
  CheckCircle,
  X,
  ArrowRight,
  ArrowLeft,
  Bot,
  Play,
} from 'lucide-react';

interface FirstRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  isCameraActive: boolean;
  onStartCamera: () => void;
  onTriggerSimulatedGesture: (gesture: GestureMapping) => void;
  availableGestures: GestureMapping[];
}

export const FirstRunModal: React.FC<FirstRunModalProps> = ({
  isOpen,
  onClose,
  theme,
  isCameraActive,
  onStartCamera,
  onTriggerSimulatedGesture,
  availableGestures,
}) => {
  const [step, setStep] = useState(1);
  const isHighContrast = theme === 'high-contrast-light';

  if (!isOpen) return null;

  const sampleVictory = availableGestures.find((g) => g.id === 'victory') || availableGestures[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isHighContrast
            ? 'bg-white border-2 border-slate-950 text-slate-950'
            : 'bg-[#0E131F] border border-slate-800 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`h-16 px-6 flex items-center justify-between border-b shrink-0 ${
            isHighContrast
              ? 'bg-slate-100 border-b-2 border-slate-950 text-slate-950'
              : 'bg-slate-950 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isHighContrast
                  ? 'bg-blue-100 border-2 border-blue-950 text-blue-950'
                  : 'bg-blue-950 border border-blue-700/60 text-blue-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">
                Quick Setup &amp; Verification (Step {step} of 4)
              </h2>
              <p
                className={`text-xs ${
                  isHighContrast ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Get ready to speak silently in Zoom, Google Meet, and Microsoft Teams
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

        {/* Step Content */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-black tracking-tight">
                Welcome to Silent Meeting Assistant
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Silent Meeting Assistant enables non-verbal, accessible communication in virtual meetings.
                Hold any natural hand gesture up to your webcam, and your message is stabilized, transcribed,
                and broadcast cleanly as a professional lower-third overlay into your video feed.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                  <Video className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-xs font-bold">100% Local CV</div>
                  <div className="text-[10px] text-slate-400">Zero cloud video lag</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                  <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs font-bold">Virtual Cam</div>
                  <div className="text-[10px] text-slate-400">Works with Zoom &amp; Teams</div>
                </div>
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 text-center">
                  <Bot className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-xs font-bold">AI Intelligence</div>
                  <div className="text-[10px] text-slate-400">Context &amp; action tracking</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-black tracking-tight">
                Camera &amp; Vision Hardware Check
              </h3>
              <p className="text-xs text-slate-300">
                Let's verify that your webcam is active and ready for MediaPipe 21-point hand landmark tracking.
              </p>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video
                    className={`w-6 h-6 ${isCameraActive ? 'text-emerald-400' : 'text-slate-500'}`}
                  />
                  <div>
                    <div className="text-xs font-bold">Webcam Video Stream</div>
                    <div className="text-[11px] text-slate-400">
                      Status:{' '}
                      <span className={isCameraActive ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {isCameraActive ? 'Connected (1080p @ 30 FPS)' : 'Not yet active'}
                      </span>
                    </div>
                  </div>
                </div>
                {!isCameraActive && (
                  <button
                    onClick={onStartCamera}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    Activate Camera
                  </button>
                )}
                {isCameraActive && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Ready
                  </span>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-black tracking-tight">
                Default Gesture Lexicon
              </h3>
              <p className="text-xs text-slate-300">
                Here are the built-in natural gestures calibrated out of the box:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {availableGestures.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3"
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: g.badgeColor }}
                    />
                    <div>
                      <div className="text-xs font-black">{g.label}</div>
                      <div className="text-[11px] text-slate-400 italic truncate">"{g.text}"</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-2">
              <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black tracking-tight">
                You're Ready for Meeting Mode!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                You can test a gesture right now with the button below, or jump straight into the full
                meeting workspace.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    if (sampleVictory) onTriggerSimulatedGesture(sampleVictory);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Test "Question" Gesture</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`h-16 px-6 flex items-center justify-between border-t shrink-0 ${
            isHighContrast
              ? 'bg-slate-100 border-t-2 border-slate-950'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Meeting Mode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
