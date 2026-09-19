import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Video,
  Sliders,
  Volume2,
  Shield,
  Palette,
  Globe,
  Bell,
  Check,
  RotateCcw,
} from 'lucide-react';

export interface AppSettingsState {
  cameraResolution: string;
  cameraMirror: boolean;
  showBoundingBox: boolean;
  showSkeleton: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  confidenceThreshold: number;
  gestureCooldown: number;
  theme: string;
  language: string;
  ttsEnabled: boolean;
  ttsRate: number;
  soundEffects: boolean;
  vibrateOnMobile: boolean;
  developerMode: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettingsState;
  onSaveSettings: (updated: AppSettingsState) => void;
  onResetDefaults: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettingsState>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Settings</h3>
              <p className="text-xs text-slate-500">Fine-tune computer vision sensitivity, audio, and display</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-700">
          {/* 1. Camera & Overlay Display */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>Camera &amp; Vision Overlay</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold block text-slate-800">Mirror Webcam</span>
                  <span className="text-[10px] text-slate-400">Horizontal flip for natural reflection</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.cameraMirror}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, cameraMirror: e.target.checked })
                  }
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold block text-slate-800">Show Hand Box</span>
                  <span className="text-[10px] text-slate-400">Purple bounding box with corner pins</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.showBoundingBox}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, showBoundingBox: e.target.checked })
                  }
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold block text-slate-800">Show Landmarks</span>
                  <span className="text-[10px] text-slate-400">MediaPipe hand skeleton joints</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.showSkeleton}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, showSkeleton: e.target.checked })
                  }
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="font-semibold block text-slate-800 mb-1">Resolution</span>
                <select
                  value={localSettings.cameraResolution}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, cameraResolution: e.target.value })
                  }
                  className="w-full text-xs px-2 py-1.5 rounded-xl bg-white border border-slate-200"
                >
                  <option value="720p">720p HD (Optimal)</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="480p">480p Fast (Low CPU)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Gesture Recognition Parameters */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Recognition Tuning</span>
            </h4>

            {/* Confidence Threshold */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Confidence Threshold</span>
                <span className="font-bold text-purple-600">
                  {Math.round(localSettings.confidenceThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.65"
                max="0.95"
                step="0.05"
                value={localSettings.confidenceThreshold}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    confidenceThreshold: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-purple-600"
              />
              <span className="text-[10px] text-slate-500 block">
                Higher values prevent accidental triggers; lower values improve quick response.
              </span>
            </div>

            {/* Gesture Cooldown */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800">Gesture Debounce / Cooldown</span>
                <span className="font-bold text-indigo-600">{localSettings.gestureCooldown}s</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3.5"
                step="0.1"
                value={localSettings.gestureCooldown}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    gestureCooldown: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-500 block">
                Wait interval before repeating the same recognized gesture.
              </span>
            </div>
          </div>

          {/* 3. Audio & Text-to-Speech */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice &amp; Audio Feedback</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold block text-slate-800">Text-to-Speech</span>
                  <span className="text-[10px] text-slate-400">Speak recognized message aloud</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.ttsEnabled}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, ttsEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                <div>
                  <span className="font-semibold block text-slate-800">Sound Chime</span>
                  <span className="text-[10px] text-slate-400">Play soft chime upon recognition</span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.soundEffects}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, soundEffects: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* 4. Developer / Testing Mode */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Developer &amp; Testing Mode</span>
            </h4>
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200/80 cursor-pointer">
              <div className="pr-4">
                <span className="font-semibold block text-slate-800">Real-Time Debug HUD Overlay</span>
                <span className="text-[10px] text-slate-500">
                  Displays live hand landmark status, real-time gesture probability distribution, and alternative predictions directly on the video feed.
                </span>
              </div>
              <input
                type="checkbox"
                checked={localSettings.developerMode}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, developerMode: e.target.checked })
                }
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-150 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => {
              onResetDefaults();
              onClose();
            }}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : null}
              <span>{savedNotice ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
