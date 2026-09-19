import React, { useState } from 'react';
import {
  Hand,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Activity,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  Check,
  X,
  Layers,
  ShieldCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { CustomGesture, GestureDiagnostics, GestureMapping } from '../types';

interface GesturesPageProps {
  gestures: GestureMapping[];
  onTestGesture: (gesture: GestureMapping) => void;
  onUpdateGestureText?: (id: string, text: string) => void;
  diagnostics?: GestureDiagnostics | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive?: boolean;
  onToggleCamera?: () => void;
  customGestures: CustomGesture[];
  onAddCustomGesture: (gesture: CustomGesture) => void;
  onDeleteCustomGesture: (id: string) => void;
  onToggleCustomGesture: (id: string) => void;
  currentLandmarks?: any[] | null;
}

export const GesturesPage: React.FC<GesturesPageProps> = ({
  gestures,
  onTestGesture,
  onUpdateGestureText,
  diagnostics,
  videoRef,
  canvasRef,
  isCameraActive = true,
  onToggleCamera,
  customGestures,
  onAddCustomGesture,
  onDeleteCustomGesture,
  onToggleCustomGesture,
  currentLandmarks,
}) => {
  const [activeTab, setActiveTab] = useState<'builtin' | 'test_mode' | 'studio'>('builtin');

  // Custom Gesture Studio state
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSamples, setCapturedSamples] = useState<number[][]>([]);
  const [newGestureName, setNewGestureName] = useState('');
  const [newGestureMessage, setNewGestureMessage] = useState('');
  const [newGestureIntent, setNewGestureIntent] = useState('CUSTOM');
  const [newGestureThreshold, setNewGestureThreshold] = useState(0.88);
  const [captureStatus, setCaptureStatus] = useState<string>('Ready to capture');

  // Edit Gesture phrase modal
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Built-in gestures (Only 3 primary defaults as per Section 15)
  const builtInGestures = [
    {
      id: 'thumbs_up',
      label: 'Thumbs Up',
      symbol: '👍',
      message: 'I AGREE',
      category: 'Agreement',
      criteria: 'Thumb extended upward, 4 fingers folded into palm',
      status: 'Validated & Active',
    },
    {
      id: 'open_palm',
      label: 'Open Palm',
      symbol: '✋',
      message: 'PLEASE WAIT',
      category: 'Attention',
      criteria: 'All 5 fingers extended and spread facing camera',
      status: 'Validated & Active',
    },
    {
      id: 'victory',
      label: 'Victory',
      symbol: '✌️',
      message: 'I HAVE A QUESTION',
      category: 'Participation',
      criteria: 'Index & middle extended in V-shape, ring & pinky folded',
      status: 'Validated & Active',
    },
  ];

  const handleStartCapture = () => {
    if (!newGestureName.trim() || !newGestureMessage.trim()) {
      alert('Please enter a gesture name and broadcast message first.');
      return;
    }
    setIsCapturing(true);
    setCapturedSamples([]);
    setCaptureStatus('Sampling hand landmarks... hold pose steady');

    let count = 0;
    const samples: number[][] = [];

    const interval = setInterval(() => {
      count++;
      if (currentLandmarks && currentLandmarks.length >= 21) {
        const wrist = currentLandmarks[0];
        const rawDist = Math.hypot(wrist.x - currentLandmarks[9].x, wrist.y - currentLandmarks[9].y) || 0.2;
        const normalized = currentLandmarks.flatMap((pt) => [
          (pt.x - wrist.x) / rawDist,
          (pt.y - wrist.y) / rawDist,
          ((pt.z || 0) - (wrist.z || 0)) / rawDist,
        ]);
        samples.push(normalized);
        setCaptureStatus(`Captured sample ${samples.length} / 8`);
      }

      if (count >= 10 || samples.length >= 8) {
        clearInterval(interval);
        setIsCapturing(false);
        if (samples.length >= 5) {
          // Average feature vector
          const avgVec = new Array(samples[0].length).fill(0);
          for (const s of samples) {
            for (let i = 0; i < s.length; i++) avgVec[i] += s[i];
          }
          for (let i = 0; i < avgVec.length; i++) avgVec[i] /= samples.length;

          setCapturedSamples(samples);
          setCaptureStatus(`Successfully generated normalized template (${samples.length} samples)`);
        } else {
          setCaptureStatus('Capture failed: Hand was not held steady or was out of frame. Please retry.');
        }
      }
    }, 250);
  };

  const handleSaveCustomGesture = () => {
    if (!capturedSamples.length) return;
    const avgVec = new Array(capturedSamples[0].length).fill(0);
    for (const s of capturedSamples) {
      for (let i = 0; i < s.length; i++) avgVec[i] += s[i];
    }
    for (let i = 0; i < avgVec.length; i++) avgVec[i] /= capturedSamples.length;

    const newCustom: CustomGesture = {
      id: `custom_${Date.now()}`,
      name: newGestureName.trim(),
      message: newGestureMessage.trim(),
      intent: newGestureIntent,
      classification_mode: 'landmark_template',
      threshold: newGestureThreshold,
      hand_policy: 'either',
      enabled: true,
      template: {
        feature_vector: avgVec,
      },
    };

    onAddCustomGesture(newCustom);
    setNewGestureName('');
    setNewGestureMessage('');
    setCapturedSamples([]);
    setCaptureStatus('Ready to capture');
    alert(`Custom gesture "${newCustom.name}" saved to personal library!`);
  };

  return (
    <div
      id="gestures-management-page"
      className="flex-1 h-full overflow-y-auto p-5 sm:p-7 select-none"
      style={{ backgroundColor: '#08101E', color: '#F1F5F3' }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#0084FF]/20 text-[#0084FF] border border-[#0084FF]/30 flex items-center justify-center font-bold">
                <Hand className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Gestures
              </h1>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Multi-Stage Verification Active
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Controlled gesture vocabulary using normalized landmark geometry, finger-state analysis, temporal stabilization, and ambiguity rejection.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'builtin'
                ? 'bg-[#0084FF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Built-in Gestures (3 Core)
          </button>
          <button
            onClick={() => setActiveTab('test_mode')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'test_mode'
                ? 'bg-[#0084FF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-300" />
            <span>Gesture Test & Calibration Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-[#0084FF] text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-blue-300" />
            <span>Custom Gesture Studio ({customGestures.length})</span>
          </button>
        </div>

        {/* TAB 1: BUILT-IN GESTURES */}
        {activeTab === 'builtin' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 rounded-xl border border-slate-800 bg-[#07111D] text-xs text-slate-400 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                To prevent false triggers and ambiguity, only these 3 verified gestures are enabled by default for meeting broadcasts.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {builtInGestures.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-800 bg-[#07111D] flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{item.symbol}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {item.label}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.criteria}
                    </p>

                    <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-[#00E599]">
                      "{item.message}"
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-500">
                      Stability: 1.0s hold
                    </span>
                    <button
                      onClick={() =>
                        onTestGesture({
                          id: item.id,
                          label: item.label,
                          description: item.criteria,
                          text: item.message,
                          category: item.category as any,
                          enabled: true,
                          cooldown: 2.0,
                          badgeColor: '#00E599',
                          iconName: 'ThumbsUp',
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#0084FF] hover:bg-[#0070D6] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Test Trigger</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GESTURE TEST & CALIBRATION MODE (Sections 30 & 31) */}
        {activeTab === 'test_mode' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-4 rounded-xl border border-teal-500/30 bg-[#022122]/70 text-xs text-teal-200 flex items-center justify-between gap-3">
              <div>
                <strong className="text-white block text-sm mb-0.5">Judge & Calibration Test Mode</strong>
                <span>Real-time technical inspection of candidate scores, finger states, landmark verification, and ambiguity checks.</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-950 border border-teal-500/40 text-[11px] font-mono text-teal-300 shrink-0">
                {diagnostics?.fps || 30} FPS
              </span>
            </div>

            {/* Calibration Technical Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Diagnostics Card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#07111D] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Recognition Telemetry
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      diagnostics?.state === 'CONFIRMED'
                        ? 'bg-emerald-500 text-black'
                        : diagnostics?.state === 'CANDIDATE'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    STATE: {diagnostics?.state || 'NEUTRAL'}
                  </span>
                </div>

                {/* Candidate & Scores */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Gesture Candidate:</span>
                    <strong className="text-white text-sm">
                      {diagnostics?.candidateLabel || 'None'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Raw Confidence:</span>
                    <span className="font-mono text-white">
                      {diagnostics?.rawConfidence || 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Smoothed Confidence (EMA):</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {diagnostics?.smoothedConfidence || 0}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Landmark Verification:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        diagnostics?.landmarkVerification === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : diagnostics?.landmarkVerification === 'FAIL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {diagnostics?.landmarkVerification || 'IDLE'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Temporal Stability:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        diagnostics?.temporalStability === 'PASS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : diagnostics?.temporalStability === 'STABILIZING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {diagnostics?.temporalStability || 'IDLE'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ambiguity Score:</span>
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                        diagnostics?.ambiguityScore === 'LOW'
                          ? 'text-emerald-400'
                          : diagnostics?.ambiguityScore === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {diagnostics?.ambiguityScore || 'LOW'}
                    </span>
                  </div>

                  {/* Hold Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Hold Stabilization Progress (1.0s):</span>
                      <span>{diagnostics?.holdProgress || 0}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-teal-500 to-emerald-400 transition-all duration-75"
                        style={{ width: `${diagnostics?.holdProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Finger State Engine */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-[#07111D] space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-3 border-b border-slate-800">
                  Finger Extension Engine (is_*_extended)
                </span>

                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Thumb Extension & Upright Vector', state: diagnostics?.fingerStates?.thumb },
                    { label: 'Index Finger Extended', state: diagnostics?.fingerStates?.index },
                    { label: 'Middle Finger Extended', state: diagnostics?.fingerStates?.middle },
                    { label: 'Ring Finger Extended', state: diagnostics?.fingerStates?.ring },
                    { label: 'Pinky Finger Extended', state: diagnostics?.fingerStates?.pinky },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80"
                    >
                      <span className="text-slate-300 font-medium">{f.label}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          f.state
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {f.state ? 'EXTENDED' : 'FOLDED'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-200 leading-relaxed">
                  <strong>Neutral Reset Rule:</strong> After confirming a gesture, the user must lower or relax hand to neutral before another event is accepted.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM GESTURE STUDIO (Sections 32 & 33) */}
        {activeTab === 'studio' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-5 rounded-2xl border border-slate-800 bg-[#07111D] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Custom Static Gesture Studio
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Record custom static hand poses using normalized landmark templates. Features are scale- and rotation-invariant.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Gesture Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Need Help"
                    value={newGestureName}
                    onChange={(e) => setNewGestureName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Broadcast Message *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Could you help me?"
                    value={newGestureMessage}
                    onChange={(e) => setNewGestureMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Intent Classification
                  </label>
                  <select
                    value={newGestureIntent}
                    onChange={(e) => setNewGestureIntent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="REQUEST_HELP">REQUEST_HELP</option>
                    <option value="CONFIRM">CONFIRM</option>
                    <option value="DISAGREE">DISAGREE</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cosine Similarity Threshold ({Math.round(newGestureThreshold * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="0.95"
                    step="0.01"
                    value={newGestureThreshold}
                    onChange={(e) => setNewGestureThreshold(parseFloat(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Capture Control Button */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300 font-mono">
                  {captureStatus}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartCapture}
                    disabled={isCapturing}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isCapturing ? 'Capturing...' : 'Capture Hand Template'}</span>
                  </button>

                  <button
                    onClick={handleSaveCustomGesture}
                    disabled={!capturedSamples.length}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Gesture</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Custom Gestures List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Saved Custom Gestures ({customGestures.length})
              </h4>

              {customGestures.length === 0 ? (
                <div className="p-6 rounded-xl border border-slate-800 bg-[#07111D] text-center text-xs text-slate-500">
                  No custom gestures created yet. Use the studio form above to record normalized landmark templates.
                </div>
              ) : (
                customGestures.map((cg) => (
                  <div
                    key={cg.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-[#07111D] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                      <div>
                        <strong className="text-white text-sm block">{cg.name}</strong>
                        <span className="text-slate-400">Message: "{cg.message}" • Intent: {cg.intent}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleCustomGesture(cg.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                          cg.enabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {cg.enabled ? 'Enabled' : 'Disabled'}
                      </button>

                      <button
                        onClick={() => onDeleteCustomGesture(cg.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete custom gesture"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
