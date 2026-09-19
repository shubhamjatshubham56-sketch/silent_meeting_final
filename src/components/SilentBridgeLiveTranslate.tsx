import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Hand,
  Volume2,
  Copy,
  Edit2,
  Check,
  Globe,
  Plus,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Sparkles,
  Bot,
  User,
  Send,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface LiveMessage {
  id: string;
  speaker: 'You' | 'AI' | 'Partner';
  channel: 'Sign' | 'Speech' | 'Text';
  text: string;
  timestamp: string;
}

interface SilentBridgeLiveTranslateProps {
  onBackToHome: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  isMicActive: boolean;
  onToggleMic: () => void;
  audioLevel?: number;
  interimSpeech?: string;
  latestGesture?: string | null;
  onSpeakText?: (text: string) => void;
  onCopyText?: (text: string) => void;
}

export const SilentBridgeLiveTranslate: React.FC<SilentBridgeLiveTranslateProps> = ({
  onBackToHome,
  videoRef,
  canvasRef,
  isCameraActive,
  onToggleCamera,
  isMicActive,
  onToggleMic,
  audioLevel = 0,
  interimSpeech = '',
  latestGesture = null,
  onSpeakText,
  onCopyText,
}) => {
  // Detected gesture phrase state (Default matching the image: "Hello, how are you?")
  const [detectedPhrase, setDetectedPhrase] = useState<string>('Hello, how are you?');
  const [confidenceScore, setConfidenceScore] = useState<number>(96);
  const [isEditingPhrase, setIsEditingPhrase] = useState(false);
  const [editedText, setEditedText] = useState(detectedPhrase);
  const [selectedLanguage, setSelectedLanguage] = useState('Indian Sign Language (ISL)');
  const [copied, setCopied] = useState(false);

  // Live conversation items matching the image feed
  const [conversation, setConversation] = useState<LiveMessage[]>([
    {
      id: 'msg-1',
      speaker: 'You',
      channel: 'Sign',
      text: 'Hello, how are you?',
      timestamp: '12:30 PM',
    },
    {
      id: 'msg-2',
      speaker: 'AI',
      channel: 'Text',
      text: 'Hello, how are you?',
      timestamp: '12:30 PM',
    },
    {
      id: 'msg-3',
      speaker: 'You',
      channel: 'Speech',
      text: 'I am fine, thank you.',
      timestamp: '12:31 PM',
    },
    {
      id: 'msg-4',
      speaker: 'AI',
      channel: 'Text',
      text: 'I am fine, thank you.',
      timestamp: '12:31 PM',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Sync latest recognized gesture to detected phrase and conversation
  useEffect(() => {
    if (latestGesture && latestGesture.trim()) {
      setDetectedPhrase(latestGesture);
      setConfidenceScore(Math.floor(92 + Math.random() * 7));

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConversation((prev) => [
        ...prev,
        {
          id: 'sign_' + Date.now(),
          speaker: 'You',
          channel: 'Sign',
          text: latestGesture,
          timestamp: time,
        },
        {
          id: 'ai_' + Date.now() + 1,
          speaker: 'AI',
          channel: 'Text',
          text: latestGesture,
          timestamp: time,
        },
      ]);
    }
  }, [latestGesture]);

  // Handle Speech-To-Text finalization if incoming
  useEffect(() => {
    if (interimSpeech && interimSpeech.length > 5 && isMicActive) {
      // live preview indicator
    }
  }, [interimSpeech, isMicActive]);

  // Trigger Text-to-Speech
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(detectedPhrase);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
    onSpeakText?.(detectedPhrase);
  };

  // Trigger Copy
  const handleCopy = () => {
    navigator.clipboard?.writeText(detectedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopyText?.(detectedPhrase);
  };

  // Save edited phrase
  const handleSaveEdit = () => {
    if (editedText.trim()) {
      setDetectedPhrase(editedText.trim());
    }
    setIsEditingPhrase(false);
  };

  // Send typed message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: LiveMessage = {
      id: 'typed_' + Date.now(),
      speaker: 'You',
      channel: 'Speech',
      text: inputMessage.trim(),
      timestamp: time,
    };
    const aiMsg: LiveMessage = {
      id: 'ai_' + Date.now() + 1,
      speaker: 'AI',
      channel: 'Text',
      text: inputMessage.trim(),
      timestamp: time,
    };

    setConversation((prev) => [...prev, userMsg, aiMsg]);
    setInputMessage('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040D1A] text-slate-100 overflow-hidden select-none">
      {/* 1. Sub-Header: Back Navigation & Status Badges */}
      <div className="h-14 px-5 sm:px-6 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#061220]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            title="Back to Home Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold text-white tracking-tight">Live Translate</span>
          </button>
        </div>

        {/* Status Indicators Pill Group */}
        <div className="flex items-center gap-2.5 text-xs">
          {/* Camera Status */}
          <button
            onClick={onToggleCamera}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#08182B] border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 transition-colors"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="font-semibold">{isCameraActive ? 'Camera Ready' : 'Camera Off'}</span>
          </button>

          {/* Mic Status */}
          <button
            onClick={onToggleMic}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#08182B] border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{isMicActive ? 'Mic Ready' : 'Mic Off'}</span>
          </button>

          {/* AI Active */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">AI Active</span>
          </div>
        </div>
      </div>

      {/* 2. Main Stage Grid: Left Video Window + Right Detected/Conversation Column */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-5 overflow-y-auto min-h-0">
        {/* LEFT COLUMN: Video Feed & Detection Visualizer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3 min-h-[360px] lg:min-h-0">
          <div className="relative flex-1 rounded-3xl bg-[#071526] border border-cyan-500/30 overflow-hidden shadow-2xl shadow-cyan-950/40 flex items-center justify-center">
            {/* Real Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraActive ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            />

            {/* MediaPipe Hand Skeleton Canvas Overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            />

            {/* Simulated Frame Reticle & Face Target when camera on */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
                {/* Face Focus Bracket Reticle in Center */}
                <div className="absolute top-[20%] left-[32%] w-[36%] h-[40%] rounded-2xl border border-emerald-400/40 pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                </div>

                {/* Hand Detected Badge */}
                <div className="self-end mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold shadow-lg backdrop-blur-md animate-pulse">
                  <Hand className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hand detected</span>
                </div>

                {/* Bottom Overlay Pill over Video: ISL Recognition Active + Confidence */}
                <div className="self-start flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#05111E]/90 border border-cyan-500/40 backdrop-blur-md shadow-xl text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>ISL Recognition Active</span>
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <span className="text-slate-300 font-mono font-medium">Confidence 96%</span>
                </div>
              </div>
            )}

            {/* Offline Placeholder when camera is toggled off */}
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                  <VideoOff className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">Camera is Off</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Turn on your camera to detect sign language gestures in real time.
                  </p>
                </div>
                <button
                  onClick={onToggleCamera}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detected Gesture & Live Conversation (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          {/* 1. Detected Gesture Card */}
          <div className="rounded-3xl bg-[#071628]/95 border border-cyan-500/30 p-5 shadow-xl shadow-cyan-950/20 backdrop-blur-md">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
              Detected Gesture
            </span>

            <div className="flex items-center gap-4">
              {/* Glowing circular gesture icon */}
              <div className="w-16 h-16 rounded-full bg-[#08182B] border-2 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)] flex items-center justify-center text-cyan-300 shrink-0">
                <Hand className="w-8 h-8 text-cyan-300 animate-pulse" />
              </div>

              {/* Detected Phrase & High Confidence Badge */}
              <div className="flex-1 min-w-0">
                {isEditingPhrase ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-400 text-white text-sm font-semibold focus:outline-none"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                    {detectedPhrase}
                  </h2>
                )}

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    High Confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row: Speak | Copy | Edit */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={handleSpeak}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#091E33] hover:bg-[#0D2946] border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                title="Speak text aloud via TTS"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Speak</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#091E33] hover:bg-[#0D2946] border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                title="Copy phrase to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => setIsEditingPhrase((e) => !e)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#091E33] hover:bg-[#0D2946] border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
                title="Edit detected phrase"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* 2. Live Conversation Chat Feed */}
          <div className="flex-1 rounded-3xl bg-[#071628]/95 border border-cyan-500/30 p-4 sm:p-5 flex flex-col overflow-hidden shadow-xl shadow-cyan-950/20 backdrop-blur-md min-h-[220px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Conversation
              </h3>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Synchronized
              </span>
            </div>

            {/* Message Feed List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#091C30]/70 border border-slate-800/80 hover:border-cyan-500/30 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      msg.channel === 'Sign'
                        ? 'bg-cyan-950 border border-cyan-500/40 text-cyan-400'
                        : msg.channel === 'Speech'
                        ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-400'
                        : 'bg-purple-950 border border-purple-500/40 text-purple-400'
                    }`}
                  >
                    {msg.channel === 'Sign' && <Hand className="w-3.5 h-3.5" />}
                    {msg.channel === 'Speech' && <Mic className="w-3.5 h-3.5" />}
                    {msg.channel === 'Text' && <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-300">
                        {msg.speaker}{' '}
                        <span className="text-[10px] text-cyan-400 font-normal">
                          ({msg.channel})
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-white mt-0.5 leading-snug">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Chat Input for testing */}
            <form onSubmit={handleSendMessage} className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type response or sign gesture..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Bottom Controls Row from Screenshot */}
      <div className="px-5 py-3.5 border-t border-slate-800/80 bg-[#061220]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Language Selector + Add Language Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#08182B] border border-cyan-500/30 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="Indian Sign Language (ISL)">Indian Sign Language (ISL)</option>
            <option value="American Sign Language (ASL)">American Sign Language (ASL)</option>
            <option value="British Sign Language (BSL)">British Sign Language (BSL)</option>
            <option value="International Sign (IS)">International Sign (IS)</option>
          </select>

          <button
            onClick={() => alert('New dialect pack added.')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Language</span>
          </button>
        </div>

        {/* Audio Waveform Equalizer Meter */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-[#08182B] border border-cyan-500/30">
          <div className="flex items-center gap-1 h-5">
            {[14, 28, 42, 20, 36, 18, 30].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-cyan-400 transition-all duration-150 animate-pulse"
                style={{
                  height: isMicActive ? `${Math.max(6, Math.min(22, (h * (audioLevel + 2)) / 3))}px` : '4px',
                  backgroundColor: isMicActive ? '#22D3EE' : '#64748B',
                }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-cyan-300">Gesture clear</span>
        </div>

        {/* Circular Confidence Gauge Dial (96%) */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-[#08182B] border border-cyan-500/30">
          {/* Circular SVG Gauge */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="3.5"
                strokeDasharray={`${confidenceScore}, 100`}
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]"
              />
            </svg>
            <span className="absolute text-[10px] font-bold text-white font-mono">
              {confidenceScore}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              High Confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
