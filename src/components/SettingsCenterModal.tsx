import React, { useState } from 'react';
import { AppTheme, CameraSettings, UserProfile } from '../types';
import {
  Settings,
  Video,
  Hand,
  Bot,
  Radio,
  Eye,
  Shield,
  Bell,
  HardDrive,
  X,
  Check,
  RotateCcw,
  Sliders,
  Volume2,
  Lock,
} from 'lucide-react';

interface SettingsCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  cameraSettings: CameraSettings;
  onUpdateCameraSettings: (settings: CameraSettings) => void;
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsCenterModal: React.FC<SettingsCenterModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
  cameraSettings,
  onUpdateCameraSettings,
  userProfile,
  onUpdateProfile,
  soundEnabled,
  onToggleSound,
}) => {
  const [activeSection, setActiveSection] = useState<
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

  const [localCam, setLocalCam] = useState<CameraSettings>(cameraSettings);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const [autoStartTracking, setAutoStartTracking] = useState(true);
  const [audioVolume, setAudioVolume] = useState(80);
  const [gestureCooldown, setGestureCooldown] = useState(2.0);
  const [consensusFrames, setConsensusFrames] = useState(7);
  const [captionDuration, setCaptionDuration] = useState(3.5);

  if (!isOpen) return null;
  const isHighContrast = theme === 'high-contrast-light';

  const handleSave = () => {
    onUpdateCameraSettings(localCam);
    onUpdateProfile(localProfile);
    onClose();
  };

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'camera', label: 'Camera & Vision', icon: Video },
    { id: 'gestures', label: 'Gesture Recognition', icon: Hand },
    { id: 'ai', label: 'AI Intelligence', icon: Bot },
    { id: 'virtual_cam', label: 'Virtual Camera', icon: Radio },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications & Audio', icon: Bell },
    { id: 'storage', label: 'Storage & Backup', icon: HardDrive },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div
        className={`w-full max-w-4xl h-[620px] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isHighContrast
            ? 'bg-white border-2 border-slate-950 text-slate-950'
            : 'bg-[#0E131F] border border-slate-800 text-white'
        }`}
      >
        {/* Modal Header */}
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
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider">
                System Preferences &amp; Settings Center
              </h2>
              <p
                className={`text-xs ${
                  isHighContrast ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                Configure real-time computer vision, virtual webcam drivers, and AI reasoning
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

        {/* Body: Left Navigation & Right Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Sidebar */}
          <aside
            className={`w-60 border-r p-3 space-y-1 shrink-0 overflow-y-auto ${
              isHighContrast
                ? 'bg-slate-50 border-r-2 border-slate-950'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    isActive
                      ? isHighContrast
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : isHighContrast
                      ? 'text-slate-700 hover:bg-slate-200 hover:text-slate-950'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Right Main Content Panel */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            {/* 1. GENERAL */}
            {activeSection === 'general' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    General Preferences
                  </h3>
                  <p className="text-xs text-slate-400">
                    Control meeting client discovery and automated tracking activation
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Auto-Start Gesture Detection</div>
                      <div className="text-[11px] text-slate-400">
                        Begin 3D hand tracking immediately upon conference start
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoStartTracking}
                      onChange={(e) => setAutoStartTracking(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Default Meeting Workspace</div>
                      <div className="text-[11px] text-slate-400">
                        Preferred layout when joining a new session
                      </div>
                    </div>
                    <select
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white"
                      defaultValue="solo_focus"
                    >
                      <option value="solo_focus">Solo Focus (Speaker Priority)</option>
                      <option value="meeting_grid">Participant Grid (4 Attendees)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CAMERA */}
            {activeSection === 'camera' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Camera &amp; Vision Input
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fine-tune OpenCV video capture stream and landmark wireframe overlay
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Capture Resolution</div>
                      <div className="text-[11px] text-slate-400">
                        Higher resolutions improve distant landmark precision
                      </div>
                    </div>
                    <div className="flex rounded-lg border border-slate-700 overflow-hidden text-xs">
                      {(['720p', '1080p', '4k'] as const).map((res) => (
                        <button
                          key={res}
                          onClick={() => setLocalCam({ ...localCam, resolution: res })}
                          className={`px-3 py-1 font-bold ${
                            localCam.resolution === res
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Horizontal Mirror Mode</div>
                      <div className="text-[11px] text-slate-400">
                        Flip video preview horizontally for natural selfie orientation
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localCam.mirror}
                      onChange={(e) => setLocalCam({ ...localCam, mirror: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Show 3D Hand Landmarks Wireframe</div>
                      <div className="text-[11px] text-slate-400">
                        Display cyan/emerald 21-joint skeleton on local preview
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localCam.showLandmarks}
                      onChange={(e) => setLocalCam({ ...localCam, showLandmarks: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. GESTURE RECOGNITION */}
            {activeSection === 'gestures' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Gesture Recognition &amp; Stabilization
                  </h3>
                  <p className="text-xs text-slate-400">
                    Eliminate false positives with multi-frame consensus filtering
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-bold">Consensus Buffer Frames</div>
                        <div className="text-[11px] text-slate-400">
                          Number of consecutive matching classifications required
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {consensusFrames} / 10 frames
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={10}
                      value={consensusFrames}
                      onChange={(e) => setConsensusFrames(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs font-bold">Trigger Cooldown Window</div>
                        <div className="text-[11px] text-slate-400">
                          Minimum delay before the same gesture can fire repeatedly
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {gestureCooldown.toFixed(1)} seconds
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={5.0}
                      step={0.5}
                      value={gestureCooldown}
                      onChange={(e) => setGestureCooldown(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. AI ASSISTANT */}
            {activeSection === 'ai' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Gemini AI Assistant &amp; Intelligence
                  </h3>
                  <p className="text-xs text-slate-400">
                    Contextual macro polish, tone enhancement, and live meeting summarization
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="text-xs font-bold mb-1">Active AI Model</div>
                    <div className="text-[11px] text-slate-400 mb-2">
                      Powered by Google Gemini 2.5 Flash for ultra-fast server-side reasoning
                    </div>
                    <div className="text-xs font-mono px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-emerald-400 font-bold inline-block">
                      gemini-2.5-flash (Online &amp; Connected)
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="text-xs font-bold mb-1">Default AI Formulation Tone</div>
                    <select className="w-full text-xs p-2 rounded-lg bg-slate-800 border border-slate-700 text-white">
                      <option>Executive, polite, and concise</option>
                      <option>Collaborative engineering team sync</option>
                      <option>Academic &amp; formal research discussion</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. VIRTUAL CAMERA */}
            {activeSection === 'virtual_cam' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Virtual Camera Driver
                  </h3>
                  <p className="text-xs text-slate-400">
                    Broadcast synthesized lower-thirds directly to Zoom, Teams, or Meet
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div className="text-xs font-bold mb-1">Driver Architecture</div>
                    <div className="text-[11px] text-slate-400 mb-3">
                      Select how outgoing video frames are piped to Windows conferencing clients
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(['DirectShow', 'OBS Virtual Camera', 'v4l2loopback', 'Built-in WebRTC'] as const).map(
                        (driver) => (
                          <button
                            key={driver}
                            onClick={() => setLocalCam({ ...localCam, virtualCamDriver: driver })}
                            className={`p-2.5 rounded-lg border text-left font-bold ${
                              localCam.virtualCamDriver === driver
                                ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                                : 'bg-slate-800/60 border-slate-700 text-slate-400'
                            }`}
                          >
                            {driver}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. APPEARANCE */}
            {activeSection === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Appearance &amp; High-Contrast Theming
                  </h3>
                  <p className="text-xs text-slate-400">
                    Theme options and WCAG AA accessibility contrast settings
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Theme Mode</div>
                      <div className="text-[11px] text-slate-400">
                        Choose between Professional Dark or High-Contrast Light
                      </div>
                    </div>
                    <button
                      onClick={onToggleTheme}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    >
                      {theme === 'dark' ? 'Switch to High-Contrast Light' : 'Switch to Dark Mode'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. PRIVACY */}
            {activeSection === 'privacy' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Privacy &amp; Security Shield
                  </h3>
                  <p className="text-xs text-slate-400">
                    Strict zero-cloud camera streaming guarantees
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20 text-emerald-300 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-2 font-black text-emerald-400">
                    <Shield className="w-4 h-4" />
                    <span>100% On-Device Computer Vision Guarantee</span>
                  </div>
                  <p>
                    All video processing, 21-point landmark extraction, and gesture classifications occur
                    entirely in local memory on your CPU/GPU via WebAssembly &amp; OpenCV. No video feeds or
                    frames are ever recorded or transmitted to external servers.
                  </p>
                </div>
              </div>
            )}

            {/* 8. NOTIFICATIONS */}
            {activeSection === 'notifications' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Audio Feedback &amp; Notifications
                  </h3>
                  <p className="text-xs text-slate-400">
                    Non-intrusive harmonic chimes when gestures stabilize
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                    <div>
                      <div className="text-xs font-bold">Gesture Confirmation Chime</div>
                      <div className="text-[11px] text-slate-400">
                        Plays a discreet 880Hz confirmation tone on trigger
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={onToggleSound}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 9. STORAGE */}
            {activeSection === 'storage' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                    Storage &amp; Custom Profiles
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage persistent local storage backups and custom gesture templates
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2 text-xs">
                  <div className="font-bold">Local Storage Status</div>
                  <div className="text-[11px] text-slate-400">
                    Stored items: Custom Mappings, Introduction Profile, Saved Preferences
                  </div>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-950 hover:bg-red-900 text-red-300 border border-red-800"
                    >
                      Reset All Settings to Factory Defaults
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Modal Footer */}
        <div
          className={`h-16 px-6 flex items-center justify-between border-t shrink-0 ${
            isHighContrast
              ? 'bg-slate-100 border-t-2 border-slate-950'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all ${
              isHighContrast
                ? 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-950'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
