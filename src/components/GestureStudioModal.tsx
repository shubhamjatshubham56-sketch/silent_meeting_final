import React, { useState } from 'react';
import {
  X,
  Sparkles,
  UserCheck,
  Settings,
  Download,
  Upload,
  RotateCcw,
  Check,
  Wand2,
  Shield,
  Eye,
  Sun,
  Moon,
  Sliders,
  Crosshair,
  Video,
  Play,
  Save,
  Radio,
  Activity,
} from 'lucide-react';
import { GestureMapping, UserProfile, AppTheme } from '../types';
import confetti from 'canvas-confetti';

interface GestureStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  gestures: GestureMapping[];
  onUpdateGestures: (newGestures: GestureMapping[]) => void;
  profile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onBroadcastMessage: (text: string, gestureLabel: string, badgeColor: string) => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
}

export const GestureStudioModal: React.FC<GestureStudioModalProps> = ({
  isOpen,
  onClose,
  gestures,
  onUpdateGestures,
  profile,
  onUpdateProfile,
  onBroadcastMessage,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'calibration' | 'gestures' | 'profile' | 'ai' | 'vision'>('calibration');
  const [localGestures, setLocalGestures] = useState<GestureMapping[]>(gestures);
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  // Custom Gesture CV Calibration State
  const [calibName, setCalibName] = useState('Need Help');
  const [calibIntent, setCalibIntent] = useState('Request Help');
  const [calibMessage, setCalibMessage] = useState('Could you help me?');
  const [calibCategory, setCalibCategory] = useState<'Custom' | 'Attention' | 'Participation' | 'Status'>('Custom');
  const [calibSamples, setCalibSamples] = useState(23);
  const [calibStability, setCalibStability] = useState<'Good' | 'Calibrating' | 'Excellent'>('Good');
  const [isCapturing, setIsCapturing] = useState(false);
  const [calibSuccess, setCalibSuccess] = useState(false);

  const isHighContrast = theme === 'high-contrast-light';

  // AI Phrase Polisher State
  const [aiInputPhrase, setAiInputPhrase] = useState('Need another minute to review this slide');
  const [aiTone, setAiTone] = useState('Executive, polite, and concise');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ enhanced: string; variations: string[] } | null>(null);
  const [selectedGestureTarget, setSelectedGestureTarget] = useState('open_palm');

  if (!isOpen) return null;

  const handleGestureTextChange = (id: string, newText: string) => {
    const updated = localGestures.map((g) => (g.id === id ? { ...g, text: newText } : g));
    setLocalGestures(updated);
  };

  const handleGestureToggle = (id: string) => {
    const updated = localGestures.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g));
    setLocalGestures(updated);
  };

  const handleSaveAndApply = () => {
    onUpdateGestures(localGestures);
    onUpdateProfile(localProfile);
    onClose();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localGestures, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'custom_gestures.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const compileIntro = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return localProfile.template
      .replace('{name}', localProfile.name)
      .replace('{job_title}', localProfile.job_title)
      .replace('{team}', localProfile.team)
      .replace('{status}', localProfile.status)
      .replace('{time}', timeStr);
  };

  const handleTestIntroBroadcast = () => {
    const compiled = compileIntro();
    onBroadcastMessage(compiled, 'MASTER MACRO: INTRO PROFILE', '#EC4899');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // AI Gemini Call
  const handleEnhanceWithGemini = async () => {
    if (!aiInputPhrase.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/gemini/enhance-phrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phrase: aiInputPhrase,
          tone: aiTone,
        }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('AI refinement error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIPhraseToGesture = (phrase: string) => {
    handleGestureTextChange(selectedGestureTarget, phrase);
    setActiveTab('gestures');
  };

  const handleStartCapture = () => {
    setIsCapturing(true);
    setCalibStability('Calibrating');
    let count = calibSamples;
    const interval = setInterval(() => {
      count += 1;
      setCalibSamples(count);
      if (count >= 30) {
        clearInterval(interval);
        setIsCapturing(false);
        setCalibStability('Excellent');
      }
    }, 120);
  };

  const handleTestCustomGesture = () => {
    onBroadcastMessage(calibMessage, calibName.toUpperCase(), '#F59E0B');
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  const handleSaveCustomGesture = () => {
    const id = calibName.toLowerCase().replace(/\s+/g, '_');
    const newGesture: GestureMapping = {
      id,
      label: calibName,
      text: calibMessage,
      cooldown: 2.0,
      enabled: true,
      badgeColor: '#F59E0B',
      category: calibCategory,
      iconName: 'Sparkles',
      description: `Custom calibrated intent: ${calibIntent}`,
    };
    const exists = localGestures.some((g) => g.id === id);
    let updated: GestureMapping[];
    if (exists) {
      updated = localGestures.map((g) => (g.id === id ? newGesture : g));
    } else {
      updated = [...localGestures, newGesture];
    }
    setLocalGestures(updated);
    setCalibSuccess(true);
    setTimeout(() => setCalibSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div
        className={`w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors ${
          isHighContrast
            ? 'bg-white border-2 border-slate-950 text-slate-950'
            : 'bg-slate-900 border border-slate-700/80 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`h-14 px-6 flex items-center justify-between transition-colors ${
            isHighContrast
              ? 'bg-slate-100 border-b-2 border-slate-950 text-slate-950'
              : 'border-b border-slate-800 bg-slate-950 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className={`w-5 h-5 ${isHighContrast ? 'text-blue-700' : 'text-blue-400'}`} />
            <div>
              <h2 className="text-sm font-black tracking-wide">
                Custom Gesture Studio &amp; CV Calibration
              </h2>
              <p className={`text-[11px] font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                Calibrate 3D landmark signatures, macro bindings, and meeting profiles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isHighContrast
                ? 'hover:bg-slate-200 text-slate-900'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex px-6 border-b transition-colors overflow-x-auto ${
            isHighContrast
              ? 'bg-slate-50 border-b-2 border-slate-900'
              : 'border-slate-800 bg-slate-950/60'
          }`}
        >
          <button
            onClick={() => setActiveTab('calibration')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'calibration'
                ? isHighContrast
                  ? 'border-blue-700 text-blue-900 font-black'
                  : 'border-blue-500 text-blue-400'
                : isHighContrast
                ? 'border-transparent text-slate-700 hover:text-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            CV Calibration Studio
          </button>
          <button
            onClick={() => setActiveTab('gestures')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === 'gestures'
                ? isHighContrast
                  ? 'border-blue-700 text-blue-900 font-black'
                  : 'border-blue-500 text-blue-400'
                : isHighContrast
                ? 'border-transparent text-slate-700 hover:text-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Gesture Mappings (JSON)
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? isHighContrast
                  ? 'border-purple-700 text-purple-900 font-black'
                  : 'border-purple-500 text-purple-400'
                : isHighContrast
                ? 'border-transparent text-slate-700 hover:text-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Intro Profile &amp; Master Macro
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ai'
                ? isHighContrast
                  ? 'border-emerald-700 text-emerald-900 font-black'
                  : 'border-emerald-500 text-emerald-400'
                : isHighContrast
                ? 'border-transparent text-slate-700 hover:text-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Phrase Polisher
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'vision'
                ? isHighContrast
                  ? 'border-amber-700 text-amber-900 font-black'
                  : 'border-amber-500 text-amber-400'
                : isHighContrast
                ? 'border-transparent text-slate-700 hover:text-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Vision &amp; Accessibility
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 0: CV Calibration Studio */}
          {activeTab === 'calibration' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-black ${isHighContrast ? 'text-slate-950' : 'text-slate-200'}`}>
                    Custom Gesture Computer-Vision Calibration Studio
                  </h3>
                  <p className={`text-xs ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                    Record custom hand poses, calibrate 21 3D joint landmark distances, and map to meeting intent.
                  </p>
                </div>
                {calibSuccess && (
                  <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500 text-black font-black flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" /> Saved to Active Lexicon!
                  </span>
                )}
              </div>

              {/* 2-Column Professional CV Calibration Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {/* Left: Live Camera Landmark Calibration Canvas */}
                <div
                  className={`rounded-2xl p-4 border flex flex-col justify-between ${
                    isHighContrast
                      ? 'bg-slate-50 border-2 border-slate-950 text-slate-950'
                      : 'bg-slate-950 border border-slate-800 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-blue-400" />
                      Live Camera &amp; Joint Wireframe
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800">
                      30 FPS • 21 Landmarks
                    </span>
                  </div>

                  {/* Calibration Viewport */}
                  <div className="relative w-full aspect-video rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-800">
                    {/* Simulated hand skeleton & bounding box */}
                    <div className="relative w-36 h-48 border-2 border-dashed border-blue-500/60 rounded-xl flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center text-4xl select-none">
                        ✋
                      </div>
                      <div className="absolute top-2 left-2 text-[9px] font-mono font-bold text-blue-400 bg-black/60 px-1.5 py-0.5 rounded">
                        CONF: 94%
                      </div>
                      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-emerald-400 bg-black/60 px-1.5 py-0.5 rounded">
                        SAMPLES: {calibSamples}
                      </div>
                    </div>

                    {isCapturing && (
                      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                        <Activity className="w-8 h-8 text-blue-400 animate-pulse mb-2" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Capturing Pose Signatures...
                        </span>
                        <span className="text-[11px] font-mono text-blue-300 mt-1">
                          Frame {calibSamples} / 30
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Joint Landmark Telemetry */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">THUMB:</span>
                      <span className="font-bold text-emerald-400">98% EXTENDED</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">INDEX:</span>
                      <span className="font-bold text-emerald-400">95% EXTENDED</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block">PALM ANGLE:</span>
                      <span className="font-bold text-blue-400">+12° NORMAL</span>
                    </div>
                  </div>
                </div>

                {/* Right: Gesture Configuration */}
                <div
                  className={`rounded-2xl p-4 border flex flex-col justify-between ${
                    isHighContrast
                      ? 'bg-white border-2 border-slate-950 text-slate-950'
                      : 'bg-slate-950/80 border border-slate-800 text-white'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Gesture Configuration
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Gesture Name:
                      </label>
                      <input
                        type="text"
                        value={calibName}
                        onChange={(e) => setCalibName(e.target.value)}
                        className={`w-full text-xs px-3 py-1.5 rounded-lg border outline-none font-bold ${
                          isHighContrast
                            ? 'bg-white border-2 border-slate-950 text-slate-950'
                            : 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Recognized Intent:
                      </label>
                      <input
                        type="text"
                        value={calibIntent}
                        onChange={(e) => setCalibIntent(e.target.value)}
                        className={`w-full text-xs px-3 py-1.5 rounded-lg border outline-none ${
                          isHighContrast
                            ? 'bg-white border-2 border-slate-950 text-slate-950'
                            : 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Broadcast Output Message:
                      </label>
                      <input
                        type="text"
                        value={calibMessage}
                        onChange={(e) => setCalibMessage(e.target.value)}
                        className={`w-full text-xs px-3 py-1.5 rounded-lg border outline-none font-semibold ${
                          isHighContrast
                            ? 'bg-white border-2 border-slate-950 text-slate-950'
                            : 'bg-slate-900 border-slate-700 text-white focus:border-blue-500'
                        }`}
                      />
                    </div>

                    {/* Calibration Quality Metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold">Samples Recorded</span>
                        <span className="text-sm font-mono font-black text-blue-400">
                          {calibSamples} frames
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold">Stability Score</span>
                        <span className="text-sm font-mono font-black text-emerald-400">
                          {calibStability} (92%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Calibration Action Buttons: [ Start Capture ] [ Test ] [ Save ] */}
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={handleStartCapture}
                      disabled={isCapturing}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        isHighContrast
                          ? 'bg-slate-950 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                      }`}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>{isCapturing ? 'Capturing...' : 'Start Capture'}</span>
                    </button>

                    <button
                      onClick={handleTestCustomGesture}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Test</span>
                    </button>

                    <button
                      onClick={handleSaveCustomGesture}
                      className="py-2 px-4 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Gesture Mappings */}
          {activeTab === 'gestures' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-black ${isHighContrast ? 'text-slate-950' : 'text-slate-200'}`}>
                    Real-Time Gesture Text Bindings
                  </h3>
                  <p className={`text-xs ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                    Linked to{' '}
                    <code className={`font-mono font-bold ${isHighContrast ? 'text-blue-900' : 'text-blue-400'}`}>
                      custom_gestures.json
                    </code>
                    . Changes dynamically take effect in both the Python desktop app and web HUD.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadJSON}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                      isHighContrast
                        ? 'bg-white hover:bg-slate-100 text-slate-950 border-2 border-slate-950 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>
                </div>
              </div>

              <div
                className={`rounded-xl overflow-hidden border ${
                  isHighContrast
                    ? 'border-2 border-slate-950 bg-white'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className={`border-b uppercase tracking-wider text-[10px] font-black ${
                        isHighContrast
                          ? 'border-b-2 border-slate-950 bg-slate-100 text-slate-950'
                          : 'border-slate-800 bg-slate-900/80 text-slate-400'
                      }`}
                    >
                      <th className="py-2.5 px-4">Gesture</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-4">Output Text / Macro Binding</th>
                      <th className="py-2.5 px-3">Cooldown</th>
                      <th className="py-2.5 px-3 text-center">Active</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isHighContrast ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
                    {localGestures.map((g) => (
                      <tr
                        key={g.id}
                        className={`transition-colors ${
                          isHighContrast ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold">
                          <div className="flex items-center gap-2">
                            <span
                              style={{ backgroundColor: g.badgeColor }}
                              className="h-3 w-3 rounded-full flex-shrink-0 border border-black/30"
                            />
                            <div>
                              <div className={isHighContrast ? 'text-slate-950' : 'text-slate-200'}>{g.label}</div>
                              <div
                                className={`text-[10px] font-normal ${
                                  isHighContrast ? 'text-slate-600' : 'text-slate-500'
                                }`}
                              >
                                {g.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isHighContrast
                                ? 'bg-slate-100 border-slate-900 text-slate-950'
                                : 'bg-slate-800 border-slate-700 text-slate-300'
                            }`}
                          >
                            {g.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={g.text}
                            onChange={(e) => handleGestureTextChange(g.id, e.target.value)}
                            className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none transition-colors ${
                              isHighContrast
                                ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-blue-700'
                                : 'bg-slate-900 border border-slate-700/80 text-slate-100 focus:border-blue-500'
                            }`}
                          />
                        </td>
                        <td
                          className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap font-bold ${
                            isHighContrast ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {g.cooldown}s
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={g.enabled}
                            onChange={() => handleGestureToggle(g.id)}
                            className="h-4 w-4 rounded border-2 border-slate-900 text-blue-700 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Intro Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <h3 className={`text-sm font-black ${isHighContrast ? 'text-slate-950' : 'text-slate-200'}`}>
                  Intro Profile &amp; Master Macro
                </h3>
                <p className={`text-xs ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                  Save your identity and meeting status. Triggering the master gesture broadcasts this introduction block immediately.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={localProfile.name}
                    onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-purple-700'
                        : 'bg-slate-950 border border-slate-700 text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={localProfile.job_title}
                    onChange={(e) => setLocalProfile({ ...localProfile, job_title: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-purple-700'
                        : 'bg-slate-950 border border-slate-700 text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Team / Department
                  </label>
                  <input
                    type="text"
                    value={localProfile.team}
                    onChange={(e) => setLocalProfile({ ...localProfile, team: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-purple-700'
                        : 'bg-slate-950 border border-slate-700 text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Current Meeting Status
                  </label>
                  <input
                    type="text"
                    value={localProfile.status}
                    onChange={(e) => setLocalProfile({ ...localProfile, status: e.target.value })}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-purple-700'
                        : 'bg-slate-950 border border-slate-700 text-white focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                  Designated Master Gesture Trigger
                </label>
                <select
                  value={localProfile.master_gesture}
                  onChange={(e) => setLocalProfile({ ...localProfile, master_gesture: e.target.value })}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-bold focus:outline-none ${
                    isHighContrast
                      ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-purple-700'
                      : 'bg-slate-950 border border-slate-700 text-white focus:border-purple-500'
                  }`}
                >
                  {localGestures.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label} ({g.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                  Compiled Introduction Macro Template
                </label>
                <textarea
                  rows={2}
                  value={localProfile.template}
                  onChange={(e) => setLocalProfile({ ...localProfile, template: e.target.value })}
                  className={`w-full rounded-lg p-3 text-xs focus:outline-none font-mono font-bold ${
                    isHighContrast
                      ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-purple-700'
                      : 'bg-slate-950 border border-slate-700 text-white focus:border-purple-500'
                  }`}
                />
                <p className={`text-[11px] mt-1 font-semibold ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                  Interpolation tokens: <code>&#123;name&#125;</code>, <code>&#123;job_title&#125;</code>, <code>&#123;team&#125;</code>, <code>&#123;status&#125;</code>, <code>&#123;time&#125;</code>
                </p>
              </div>

              {/* Live Card Output Preview */}
              <div
                className={`p-4 rounded-xl space-y-2 border-2 transition-colors ${
                  isHighContrast
                    ? 'bg-purple-50 border-purple-900 text-slate-950'
                    : 'bg-slate-950 border-purple-800/60 text-white'
                }`}
              >
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    isHighContrast ? 'text-purple-950' : 'text-purple-400'
                  }`}
                >
                  Live Broadcast Card Preview
                </span>
                <p className="text-base font-black">"{compileIntro()}"</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleTestIntroBroadcast}
                    className={`text-xs px-3.5 py-1.5 rounded-lg text-white font-black transition-all shadow-md flex items-center gap-1.5 ${
                      isHighContrast
                        ? 'bg-purple-700 hover:bg-purple-800 border border-purple-950'
                        : 'bg-purple-600 hover:bg-purple-500'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Broadcast Intro Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Gemini Phrase Polisher */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div
                className={`border-2 rounded-xl p-4 transition-colors ${
                  isHighContrast
                    ? 'bg-emerald-50 border-emerald-900 text-slate-950'
                    : 'bg-gradient-to-r from-blue-950/40 via-emerald-950/40 to-slate-900 border-emerald-800/40 text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className={`w-4 h-4 ${isHighContrast ? 'text-emerald-800' : 'text-emerald-400'}`} />
                  <h4
                    className={`text-xs font-black uppercase tracking-wide ${
                      isHighContrast ? 'text-emerald-950' : 'text-emerald-300'
                    }`}
                  >
                    Gemini Intelligence Meeting Polisher
                  </h4>
                </div>
                <p className={`text-xs font-medium ${isHighContrast ? 'text-slate-800' : 'text-slate-300'}`}>
                  Transform raw or colloquial notes into articulate, boardroom-ready phrases designed specifically for silent overlay displays.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Raw Gesture Intention
                  </label>
                  <input
                    type="text"
                    value={aiInputPhrase}
                    onChange={(e) => setAiInputPhrase(e.target.value)}
                    placeholder="e.g. Stop talking for a sec, I want to clarify"
                    className={`w-full rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-emerald-700'
                        : 'bg-slate-950 border border-slate-700 text-white focus:border-emerald-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Desired Tone
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-bold focus:outline-none ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950 focus:border-emerald-700'
                        : 'bg-slate-950 border border-slate-700 text-white focus:border-emerald-500'
                    }`}
                  >
                    <option value="Executive, polite, and concise">Executive, polite, and concise</option>
                    <option value="Friendly, warm, and collaborative">Friendly, warm, and collaborative</option>
                    <option value="Direct, brief, and assertive">Direct, brief, and assertive</option>
                    <option value="Technical architecture focus">Technical architecture focus</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className={`text-xs font-bold ${isHighContrast ? 'text-slate-800' : 'text-slate-400'}`}>
                    Target Gesture to Update:
                  </label>
                  <select
                    value={selectedGestureTarget}
                    onChange={(e) => setSelectedGestureTarget(e.target.value)}
                    className={`rounded px-2.5 py-1 text-xs font-bold ${
                      isHighContrast
                        ? 'bg-white border-2 border-slate-900 text-slate-950'
                        : 'bg-slate-950 border border-slate-700 text-slate-200'
                    }`}
                  >
                    {localGestures.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleEnhanceWithGemini}
                  disabled={aiLoading}
                  className={`text-xs px-4 py-2 rounded-lg text-white font-black flex items-center gap-2 shadow-md transition-all disabled:opacity-50 ${
                    isHighContrast
                      ? 'bg-emerald-700 hover:bg-emerald-800 border border-emerald-950'
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  {aiLoading ? 'Refining with Gemini...' : 'Polish Phrase with AI'}
                </button>
              </div>

              {aiResult && (
                <div
                  className={`rounded-xl p-4 space-y-3 border-2 ${
                    isHighContrast
                      ? 'bg-white border-emerald-900 text-slate-950'
                      : 'bg-slate-950 border-emerald-700/60 text-white'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isHighContrast ? 'text-emerald-900' : 'text-emerald-400'
                      }`}
                    >
                      Recommended Primary HUD Output:
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-black">"{aiResult.enhanced}"</p>
                      <button
                        onClick={() => applyAIPhraseToGesture(aiResult.enhanced)}
                        className={`text-xs px-3 py-1 text-white rounded font-bold flex items-center gap-1 ${
                          isHighContrast ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-emerald-700 hover:bg-emerald-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" /> Apply
                      </button>
                    </div>
                  </div>

                  {aiResult.variations && aiResult.variations.length > 0 && (
                    <div className={`pt-2 border-t ${isHighContrast ? 'border-slate-300' : 'border-slate-800'}`}>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider block mb-1.5 ${
                          isHighContrast ? 'text-slate-700' : 'text-slate-400'
                        }`}
                      >
                        Alternative Variations:
                      </span>
                      <div className="space-y-1.5">
                        {aiResult.variations.map((v, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${
                              isHighContrast
                                ? 'bg-slate-50 border-slate-300 text-slate-950'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="font-semibold">"{v}"</span>
                            <button
                              onClick={() => applyAIPhraseToGesture(v)}
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                isHighContrast
                                  ? 'bg-emerald-100 text-emerald-950 border border-emerald-800'
                                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                              }`}
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Vision & Accessibility */}
          {activeTab === 'vision' && (
            <div className="space-y-5">
              <div>
                <h3 className={`text-sm font-black ${isHighContrast ? 'text-slate-950' : 'text-slate-200'}`}>
                  Vision Engine &amp; Accessibility Settings
                </h3>
                <p className={`text-xs ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                  Fine-tune high-contrast display modes, text accessibility, and MediaPipe stabilization parameters.
                </p>
              </div>

              {/* Theme & High-Contrast Mode Card */}
              <div
                className={`p-4 rounded-xl border-2 space-y-3 transition-colors ${
                  isHighContrast
                    ? 'bg-amber-50 border-amber-900 text-slate-950'
                    : 'bg-slate-950 border-amber-700/60 text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isHighContrast ? (
                      <Sun className="w-5 h-5 text-amber-700" />
                    ) : (
                      <Moon className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide">
                        High-Contrast Mode (Theme Switcher)
                      </div>
                      <div className={`text-[11px] font-medium ${isHighContrast ? 'text-slate-800' : 'text-slate-400'}`}>
                        Switch between sleek Dark Mode and WCAG AAA compliant High-Contrast Light Mode.
                      </div>
                    </div>
                  </div>

                  {onToggleTheme && (
                    <button
                      onClick={onToggleTheme}
                      className={`text-xs px-4 py-2 rounded-lg font-black transition-all flex items-center gap-1.5 shadow-md ${
                        isHighContrast
                          ? 'bg-slate-950 text-white hover:bg-slate-800 border-2 border-slate-950'
                          : 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-black'
                      }`}
                    >
                      {isHighContrast ? (
                        <>
                          <Moon className="w-4 h-4 text-amber-400" /> Switch to Dark Theme
                        </>
                      ) : (
                        <>
                          <Sun className="w-4 h-4 text-slate-950" /> Enable High-Contrast Light
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div
                  className={`pt-2 border-t flex items-center justify-between text-xs font-bold ${
                    isHighContrast ? 'border-amber-300 text-slate-800' : 'border-slate-800 text-slate-400'
                  }`}
                >
                  <span>Current Theme State:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-black border ${
                      isHighContrast
                        ? 'bg-amber-200 text-amber-950 border-amber-900'
                        : 'bg-slate-900 text-emerald-400 border-slate-700'
                    }`}
                  >
                    {isHighContrast ? 'HIGH-CONTRAST LIGHT MODE ACTIVE' : 'DARK MODE ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Engine Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 p-4 rounded-xl ${
                    isHighContrast ? 'bg-white border-slate-900 text-slate-950' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`text-xs font-black mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Target Video Frame Rate
                  </div>
                  <div
                    className={`text-xl font-black font-mono ${
                      isHighContrast ? 'text-emerald-800' : 'text-emerald-400'
                    }`}
                  >
                    30+ FPS
                  </div>
                  <div className={`text-[11px] mt-1 font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                    DirectShow / AVFoundation 720p 30fps with 1-frame ring buffer
                  </div>
                </div>

                <div
                  className={`border-2 p-4 rounded-xl ${
                    isHighContrast ? 'bg-white border-slate-900 text-slate-950' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`text-xs font-black mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Stabilization Window Size
                  </div>
                  <div
                    className={`text-xl font-black font-mono ${isHighContrast ? 'text-blue-800' : 'text-blue-400'}`}
                  >
                    10 Frames
                  </div>
                  <div className={`text-[11px] mt-1 font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                    Requires 70% consensus ratio across recent frames before trigger
                  </div>
                </div>

                <div
                  className={`border-2 p-4 rounded-xl ${
                    isHighContrast ? 'bg-white border-slate-900 text-slate-950' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`text-xs font-black mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Trigger Cooldown Buffer
                  </div>
                  <div
                    className={`text-xl font-black font-mono ${
                      isHighContrast ? 'text-purple-800' : 'text-purple-400'
                    }`}
                  >
                    2.0s - 3.0s
                  </div>
                  <div className={`text-[11px] mt-1 font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                    Prevents rapid-fire refiring of identical gestures
                  </div>
                </div>

                <div
                  className={`border-2 p-4 rounded-xl ${
                    isHighContrast ? 'bg-white border-slate-900 text-slate-950' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className={`text-xs font-black mb-1 ${isHighContrast ? 'text-slate-900' : 'text-slate-300'}`}>
                    Hand Landmark Model
                  </div>
                  <div
                    className={`text-xl font-black font-mono ${isHighContrast ? 'text-amber-800' : 'text-amber-400'}`}
                  >
                    MediaPipe 3D
                  </div>
                  <div className={`text-[11px] mt-1 font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-500'}`}>
                    21 3D joint coordinate tracking with rotation invariance
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div
          className={`h-14 px-6 flex items-center justify-between border-t transition-colors ${
            isHighContrast
              ? 'bg-slate-100 border-t-2 border-slate-950 text-slate-950'
              : 'border-slate-800 bg-slate-950 text-white'
          }`}
        >
          <button
            onClick={onClose}
            className={`text-xs px-4 py-2 rounded-lg font-bold transition-colors ${
              isHighContrast ? 'text-slate-700 hover:text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleSaveAndApply}
            className={`text-xs px-5 py-2 rounded-lg text-white font-black transition-all shadow-md flex items-center gap-1.5 ${
              isHighContrast
                ? 'bg-blue-700 hover:bg-blue-800 border-2 border-blue-950'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            <Check className="w-4 h-4" /> Save &amp; Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
