import React, { useState } from 'react';
import {
  Settings,
  Camera,
  Hand,
  Bot,
  Radio,
  Eye,
  Shield,
  Bell,
  HardDrive,
  Save,
  CheckCircle,
} from 'lucide-react';
import { CameraSettings } from '../types';

interface SettingsPageProps {
  cameraSettings: CameraSettings;
  onUpdateCameraSettings: (settings: CameraSettings) => void;
  messageDuration: number; // in ms
  onChangeMessageDuration: (ms: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  cameraSettings,
  onUpdateCameraSettings,
  messageDuration,
  onChangeMessageDuration,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'camera'
    | 'gestures'
    | 'ai'
    | 'virtual_cam'
    | 'appearance'
    | 'privacy'
    | 'notifications'
    | 'storage'
  >('general');

  const [camConfig, setCamConfig] = useState<CameraSettings>(cameraSettings);
  const [displaySeconds, setDisplaySeconds] = useState(messageDuration / 1000);
  const [isSaved, setIsSaved] = useState(false);

  // General settings
  const [autoStartCam, setAutoStartCam] = useState(true);
  const [confirmOnLeave, setConfirmOnLeave] = useState(true);

  // Appearance
  const [highContrast, setHighContrast] = useState(false);

  // Privacy
  const [localProcessingOnly, setLocalProcessingOnly] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCameraSettings(camConfig);
    onChangeMessageDuration(displaySeconds * 1000);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const navTabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'gestures', label: 'Gesture Recognition', icon: Hand },
    { id: 'ai', label: 'AI & Intelligence', icon: Bot },
    { id: 'virtual_cam', label: 'Virtual Camera', icon: Radio },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'storage', label: 'Storage & Cache', icon: HardDrive },
  ] as const;

  return (
    <div
      className="flex-1 h-full overflow-y-auto p-6 select-none"
      style={{ backgroundColor: '#07151D' }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-[#123136] pb-4">
          <h1 className="text-xl font-bold text-[#F1F5F3] tracking-tight">
            Application Settings
          </h1>
          <p className="text-xs text-[#9BAEAA] mt-1">
            Configure desktop preferences, video capture devices, gesture recognition lifetime, and virtual camera drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Sidebar Tabs */}
          <div className="md:col-span-1 space-y-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#163E32] text-[#F1F5F3] border border-[#1F8F68]'
                      : 'text-[#9BAEAA] hover:text-[#F1F5F3] hover:bg-[#0D2528]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#2AA879]' : 'text-[#6F827E]'}`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Tab Content */}
          <div className="md:col-span-3">
            <form onSubmit={handleSave} className="p-5 rounded-xl border bg-[#0A1E25] border-[#123136] space-y-5">
              {/* 1. GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    General Preferences
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          Auto-start camera on meeting launch
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          Immediately initialize video capture when entering meeting mode
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoStartCam}
                        onChange={(e) => setAutoStartCam(e.target.checked)}
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          Audio feedback chime on confirmed gesture
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          Play subtle non-verbal confirmation sound via Web Audio synthesizer
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={onToggleSound}
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          Confirm before leaving meeting
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          Show confirmation prompt before ending active meeting mode
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={confirmOnLeave}
                        onChange={(e) => setConfirmOnLeave(e.target.checked)}
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 2. CAMERA */}
              {activeTab === 'camera' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Camera & Capture Settings
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                        Video Resolution
                      </label>
                      <select
                        value={camConfig.resolution}
                        onChange={(e) =>
                          setCamConfig({ ...camConfig, resolution: e.target.value as any })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0D2528] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
                      >
                        <option value="720p">720p HD (1280x720)</option>
                        <option value="1080p">1080p Full HD (1920x1080)</option>
                        <option value="4k">4K Ultra HD (3840x2160)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                        Frame Rate Target
                      </label>
                      <select
                        value={camConfig.fps}
                        onChange={(e) =>
                          setCamConfig({ ...camConfig, fps: parseInt(e.target.value) || 30 })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0D2528] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
                      >
                        <option value={30}>30 FPS (Standard / Power Saving)</option>
                        <option value={60}>60 FPS (Ultra Smooth Hand Tracking)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          Mirror Camera Feed
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          Horizontal flip for natural presenter perspective
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={camConfig.mirror}
                        onChange={(e) => setCamConfig({ ...camConfig, mirror: e.target.checked })}
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          Show 3D Landmarks Skeleton Overlay
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          Render 21-joint MediaPipe computer-vision tracking mesh in preview
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={camConfig.showLandmarks}
                        onChange={(e) =>
                          setCamConfig({ ...camConfig, showLandmarks: e.target.checked })
                        }
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 3. GESTURE RECOGNITION (CRITICAL CONFIGURABLE DURATION) */}
              {activeTab === 'gestures' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Gesture Recognition & Auto-Dismiss Lifecycle
                  </h3>

                  <div className="p-3.5 rounded-lg bg-[#0D2528] border border-[#1F8F68]/60 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-semibold text-[#F1F5F3]">
                          Message Display Duration (Auto-Dismiss)
                        </label>
                        <span className="font-mono font-bold text-[#2AA879] text-xs">
                          {displaySeconds} Seconds
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2.0"
                        max="10.0"
                        step="0.5"
                        value={displaySeconds}
                        onChange={(e) => setDisplaySeconds(parseFloat(e.target.value))}
                        className="w-full accent-[#1F8F68] cursor-pointer"
                      />
                      <span className="text-[11px] text-[#9BAEAA] block mt-1">
                        Controls how long a confirmed gesture overlay remains visible before automatically fading out and restoring clean video (Default: 4.5s).
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                        Stabilization Buffer (Consensus Frames)
                      </label>
                      <select
                        value={camConfig.stabilizationThreshold}
                        onChange={(e) =>
                          setCamConfig({
                            ...camConfig,
                            stabilizationThreshold: parseInt(e.target.value) || 7,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0D2528] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
                      >
                        <option value={5}>5 Frames (~160ms - Fast)</option>
                        <option value={7}>7 Frames (~230ms - Balanced)</option>
                        <option value={10}>10 Frames (~330ms - High Precision)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                        Minimum Detection Confidence
                      </label>
                      <select
                        defaultValue="0.65"
                        className="w-full px-3 py-2 rounded-lg bg-[#0D2528] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
                      >
                        <option value="0.55">0.55 (Loose / Low Light)</option>
                        <option value="0.65">0.65 (Standard Recommended)</option>
                        <option value="0.80">0.80 (Strict)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. AI & INTELLIGENCE */}
              {activeTab === 'ai' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    AI & Language Refinement
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#0D2528] border border-[#123136]">
                      <span className="font-semibold text-[#F1F5F3] block">
                        Server-Side Gemini Model
                      </span>
                      <span className="text-[11px] text-[#9BAEAA] block mt-0.5">
                        Gemini 2.5 Flash endpoint active for real-time phrase formatting and tone adjustments.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                        Default Formatter Tone
                      </label>
                      <select
                        defaultValue="concise"
                        className="w-full px-3 py-2 rounded-lg bg-[#0D2528] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
                      >
                        <option value="concise">Concise & Direct (Executive Sync)</option>
                        <option value="diplomatic">Diplomatic & Collaborative (Review Meetings)</option>
                        <option value="technical">Technical & Precise (Architecture Discussions)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. VIRTUAL CAMERA */}
              {activeTab === 'virtual_cam' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Virtual Camera Driver Configuration
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#9BAEAA] mb-1">
                        Video Pipeline Driver
                      </label>
                      <select
                        value={camConfig.virtualCamDriver}
                        onChange={(e) =>
                          setCamConfig({
                            ...camConfig,
                            virtualCamDriver: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0D2528] border border-[#123136] text-[#F1F5F3] focus:outline-hidden focus:border-[#1F8F68]"
                      >
                        <option value="DirectShow">DirectShow (Windows Kernel Streaming - Recommended)</option>
                        <option value="v4l2loopback">v4l2loopback (Linux Video Loopback)</option>
                        <option value="OBS Virtual Camera">OBS Virtual Camera Driver</option>
                        <option value="Built-in WebRTC">Built-in WebRTC Loopback</option>
                      </select>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0D2528] border border-[#123136] text-[#9BAEAA]">
                      <span className="font-semibold text-[#F1F5F3] block mb-1">
                        Compositor Synchronization Rule
                      </span>
                      Local Preview and Virtual Camera stream use the exact same compositor state. When a message fades locally, it simultaneously fades out of the virtual camera feed.
                    </div>
                  </div>
                </div>
              )}

              {/* 6. APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Appearance & Theme
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          High Contrast Accessibility Mode
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          Increases border thickness and font contrast for bright room environments
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>

                    <div className="p-3 rounded-lg bg-[#0D2528] border border-[#123136] text-[#9BAEAA]">
                      <span className="font-semibold text-[#F1F5F3] block mb-1">
                        Color Palette
                      </span>
                      Configured with Dark Navy (`#07151D`) & Dark Green (`#1F8F68`) design tokens according to enterprise desktop standards.
                    </div>
                  </div>
                </div>
              )}

              {/* 7. PRIVACY */}
              {activeTab === 'privacy' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Privacy & Data Safeguards
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-lg bg-[#0D2528] border border-[#123136] cursor-pointer">
                      <div>
                        <span className="font-semibold text-[#F1F5F3] block">
                          Local-Only Computer Vision Processing
                        </span>
                        <span className="text-[11px] text-[#9BAEAA]">
                          MediaPipe hand landmark calculations execute 100% locally in browser memory. Video never leaves the device.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={localProcessingOnly}
                        onChange={(e) => setLocalProcessingOnly(e.target.checked)}
                        className="accent-[#1F8F68] w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* 8. NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Notifications & Toast Alerts
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#0D2528] border border-[#123136]">
                      <span className="font-semibold text-[#F1F5F3] block">
                        Subtle Event Toasts
                      </span>
                      <span className="text-[11px] text-[#9BAEAA] block mt-0.5">
                        Non-blocking alerts appear in the lower corner when gestures confirm or virtual camera connects.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. STORAGE */}
              {activeTab === 'storage' && (
                <div className="space-y-4 text-xs">
                  <h3 className="text-sm font-bold text-[#F1F5F3] border-b border-[#123136] pb-2">
                    Storage & Cache
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#0D2528] border border-[#123136]">
                      <span className="font-semibold text-[#F1F5F3] block">
                        Local Configuration Storage
                      </span>
                      <span className="text-[11px] text-[#9BAEAA] block mt-0.5">
                        User profiles and custom gestures are persisted locally in client-side storage.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button Row */}
              <div className="flex items-center justify-between pt-4 border-t border-[#123136]">
                {isSaved ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#2AA879] font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Settings applied successfully</span>
                  </div>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1F8F68] hover:bg-[#2AA879] text-[#F1F5F3] text-xs font-semibold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
