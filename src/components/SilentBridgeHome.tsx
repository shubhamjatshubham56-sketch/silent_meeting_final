import React, { useState } from 'react';
import {
  Hand,
  Brain,
  MessageSquare,
  Video,
  Mic,
  Sparkles,
  Bot,
  Users,
  Compass,
  Type,
  Contrast,
  Subtitles,
  Volume2,
  Globe,
  Sliders,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface SilentBridgeHomeProps {
  userName?: string;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  isAIActive: boolean;
  onNavigate: (page: string) => void;
  onStartLiveTranslation: () => void;
  onStartMeeting: () => void;
  onPracticeGestures: () => void;
  onStartConversation: () => void;
}

export const SilentBridgeHome: React.FC<SilentBridgeHomeProps> = ({
  userName = 'Shrim',
  isCameraActive,
  onToggleCamera,
  isMicActive,
  onToggleMic,
  isAIActive = true,
  onNavigate,
  onStartLiveTranslation,
  onStartMeeting,
  onPracticeGestures,
  onStartConversation,
}) => {
  const [isBridgeCardVisible, setIsBridgeCardVisible] = useState(true);

  // Quick Accessibility settings state
  const [textSize, setTextSize] = useState<'A' | 'A+' | 'A++'>('A+');
  const [highContrast, setHighContrast] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [speechOutput, setSpeechOutput] = useState(true);
  const [language, setLanguage] = useState<'English' | 'ISL'>('English');
  const [reduceMotion, setReduceMotion] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = userName.split(' ')[0] || 'Shrim';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 space-y-6 bg-[#040D1A] text-slate-100 select-none">
      {/* 1. Header Greeting & Poetic Quote */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {firstName}</span>
          </h1>
          <p className="text-sm text-cyan-200/70 font-medium mt-0.5">
            Ready to communicate?
          </p>
        </div>

        {/* Cursive / Italic Inspirational Quote Banner from Screenshot */}
        <div className="max-w-md lg:text-right">
          <p className="text-xs sm:text-sm text-slate-300 italic font-serif leading-relaxed drop-shadow-sm">
            "Technology is not replacing communication. It is removing the barrier between people."
          </p>
        </div>
      </div>

      {/* 2. Top Metric / Status Badges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* 1. AI Recognition */}
        <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#08182B]/80 border border-emerald-500/30 shadow-lg shadow-emerald-950/20 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300">AI Recognition</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 2. Camera */}
        <button
          onClick={onToggleCamera}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#08182B]/80 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-950/20 backdrop-blur-md text-left transition-colors cursor-pointer group"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isCameraActive
                ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900 border border-slate-700 text-slate-500'
            }`}
          >
            <Video className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300">Camera</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCameraActive ? 'bg-cyan-400' : 'bg-slate-500'
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCameraActive ? 'text-cyan-400' : 'text-slate-400'
                }`}
              >
                {isCameraActive ? 'READY' : 'OFF'}
              </span>
            </div>
          </div>
        </button>

        {/* 3. Microphone */}
        <button
          onClick={onToggleMic}
          className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#08182B]/80 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-950/20 backdrop-blur-md text-left transition-colors cursor-pointer group"
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
              isMicActive
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border border-slate-700 text-slate-500'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-300">Microphone</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMicActive ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isMicActive ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {isMicActive ? 'READY' : 'MUTED'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 3. Hero Card: Communication Bridge with Flow Wave */}
      {isBridgeCardVisible && (
        <div className="relative rounded-3xl bg-gradient-to-b from-[#07192C]/90 to-[#05111E]/95 border border-cyan-500/25 p-6 sm:p-7 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl overflow-hidden">
          {/* Subtle background glow highlights */}
          <div className="absolute -top-24 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Title & Close Action */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Communication Bridge</span>
            </h2>
            <button
              onClick={() => setIsBridgeCardVisible(false)}
              className="w-7 h-7 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Flow Visualizer (3 Nodes connected with glowing waves) */}
          <div className="relative z-10 max-w-4xl mx-auto py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center">
              {/* Connecting Wave SVG Line (Visible on md+ screens) */}
              <div className="hidden md:block absolute top-10 left-[18%] right-[18%] h-12 pointer-events-none -z-0">
                <svg
                  viewBox="0 0 600 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="bridgeFlowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <filter id="bridgeWaveGlow" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  {/* Glowing background wave */}
                  <path
                    d="M 10 30 Q 150 5 300 30 T 590 30"
                    stroke="url(#bridgeFlowGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.4"
                    filter="url(#bridgeWaveGlow)"
                  />
                  {/* Crisp wave with particle wave effect */}
                  <path
                    d="M 10 30 Q 150 5 300 30 T 590 30"
                    stroke="url(#bridgeFlowGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                  />
                </svg>
              </div>

              {/* NODE 1: Sign Language */}
              <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onPracticeGestures}>
                <div className="relative w-20 h-20 rounded-full bg-[#08182B] border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full bg-cyan-950/40" />
                  <Hand className="w-8 h-8 relative z-10 text-cyan-300" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-white tracking-tight">Sign Language</h3>
                <p className="text-xs text-cyan-200/70 mt-0.5">Your gestures</p>
              </div>

              {/* NODE 2: AI Vision */}
              <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartLiveTranslation}>
                <div className="relative w-20 h-20 rounded-full bg-[#08182B] border-2 border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full bg-emerald-950/40" />
                  <Brain className="w-8 h-8 relative z-10 text-emerald-300" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-white tracking-tight">AI Vision</h3>
                <p className="text-xs text-emerald-200/70 mt-0.5">Understands & Translates</p>
              </div>

              {/* NODE 3: Text ↔ Speech */}
              <div className="flex flex-col items-center text-center group cursor-pointer" onClick={onStartConversation}>
                <div className="relative w-20 h-20 rounded-full bg-[#08182B] border-2 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-1 rounded-full bg-purple-950/40" />
                  <MessageSquare className="w-8 h-8 relative z-10 text-purple-300" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-white tracking-tight">Text ↔ Speech</h3>
                <p className="text-xs text-purple-200/70 mt-0.5">Real-time communication</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Four Main Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Start Live Translation */}
        <button
          onClick={onStartLiveTranslation}
          className="group relative flex flex-col p-5 rounded-2xl bg-[#08182B]/80 hover:bg-[#0C223C] border border-cyan-500/30 hover:border-cyan-400/70 shadow-lg shadow-cyan-950/20 text-left transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mb-3 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-shadow">
            <Video className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
            Start Live Translation
          </h3>
          <p className="text-xs text-slate-400 mt-1">Sign → Text / Speech</p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
            <span>Launch Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CARD 2: Start Conversation */}
        <button
          onClick={onStartConversation}
          className="group relative flex flex-col p-5 rounded-2xl bg-[#08182B]/80 hover:bg-[#0C223C] border border-blue-500/30 hover:border-blue-400/70 shadow-lg shadow-blue-950/20 text-left transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-3 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.5)] transition-shadow">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
            Start Conversation
          </h3>
          <p className="text-xs text-slate-400 mt-1">Two-way Communication</p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-semibold">
            <span>Open Dialogue</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CARD 3: Start Meeting */}
        <button
          onClick={onStartMeeting}
          className="group relative flex flex-col p-5 rounded-2xl bg-[#08182B]/80 hover:bg-[#0C223C] border border-purple-500/30 hover:border-purple-400/70 shadow-lg shadow-purple-950/20 text-left transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center mb-3 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-shadow">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
            Start Meeting
          </h3>
          <p className="text-xs text-slate-400 mt-1">Join / Create Meeting</p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-semibold">
            <span>Enter Room</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* CARD 4: Practice Gestures */}
        <button
          onClick={onPracticeGestures}
          className="group relative flex flex-col p-5 rounded-2xl bg-[#08182B]/80 hover:bg-[#0C223C] border border-amber-500/30 hover:border-amber-400/70 shadow-lg shadow-amber-950/20 text-left transition-all hover:scale-[1.02] cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-shadow">
            <Hand className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
            Practice Gestures
          </h3>
          <p className="text-xs text-slate-400 mt-1">Learn & Improve</p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>Open Studio</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* 5. Quick Accessibility Footer Bar from Screenshot */}
      <div className="rounded-2xl bg-[#071526]/80 border border-slate-800/80 p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Accessibility
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {/* Text Size */}
          <button
            onClick={() => setTextSize((s) => (s === 'A' ? 'A+' : s === 'A+' ? 'A++' : 'A'))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-cyan-400" />
            <span>Text Size:</span>
            <span className="font-bold text-cyan-400">{textSize}</span>
          </button>

          {/* High Contrast */}
          <button
            onClick={() => setHighContrast((c) => !c)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              highContrast
                ? 'bg-blue-900/40 border-blue-500/60 text-white'
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Contrast className="w-3.5 h-3.5 text-blue-400" />
            <span>High-Contrast:</span>
            <span className={`font-bold ${highContrast ? 'text-blue-300' : 'text-slate-400'}`}>
              {highContrast ? 'On' : 'Off'}
            </span>
          </button>

          {/* Captions */}
          <button
            onClick={() => setCaptions((c) => !c)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              captions
                ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Captions:</span>
            <span className={`font-bold ${captions ? 'text-emerald-400' : 'text-slate-400'}`}>
              {captions ? 'On' : 'Off'}
            </span>
          </button>

          {/* Speech Output */}
          <button
            onClick={() => setSpeechOutput((s) => !s)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              speechOutput
                ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Speech Output:</span>
            <span className={`font-bold ${speechOutput ? 'text-cyan-400' : 'text-slate-400'}`}>
              {speechOutput ? 'On' : 'Off'}
            </span>
          </button>

          {/* Language */}
          <button
            onClick={() => setLanguage((l) => (l === 'English' ? 'ISL' : 'English'))}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Language:</span>
            <span className="font-bold text-purple-400">{language}</span>
          </button>

          {/* Reduce Motion */}
          <button
            onClick={() => setReduceMotion((m) => !m)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              reduceMotion
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Reduce Motion:</span>
            <span className="font-bold text-slate-400">{reduceMotion ? 'On' : 'Off'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
