import React from 'react';
import {
  X,
  Zap,
  Play,
  CheckCircle2,
  Sliders,
  Volume2,
  Info,
} from 'lucide-react';
import { QuickCommandItem } from './QuickCommandsRow';

interface CommandDetailModalProps {
  command: QuickCommandItem | null;
  onClose: () => void;
  onTestCommand: (cmd: QuickCommandItem) => void;
}

export const CommandDetailModal: React.FC<CommandDetailModalProps> = ({
  command,
  onClose,
  onTestCommand,
}) => {
  if (!command) return null;

  const getInstructions = (gesture: string) => {
    switch (gesture) {
      case 'ok_sign':
        return [
          'Bring your thumb and index finger together to form an "O" shape.',
          'Keep your middle, ring, and pinky fingers upright and extended.',
          'Hold the gesture steady inside the purple bounding box for 0.5s.',
        ];
      case 'pointing_up':
        return [
          'Extend your index finger vertically towards the ceiling.',
          'Curl your middle, ring, pinky fingers and thumb flat against your palm.',
          'Useful when signaling you have a question or wish to speak in the meeting.',
        ];
      case 'open_palm':
        return [
          'Face all five extended fingers flat towards the camera lens.',
          'Keep your palm steady or make a gentle wave to ask for a repeat.',
          'Signals clearly to the presenter without interrupting audio.',
        ];
      case 'folded_hands':
        return [
          'Place both hands together in front of your chest or hold a flat palm near chest.',
          'Conveys respectful gratitude, politeness, and thank you.',
        ];
      case 'thumbs_up':
        return [
          'Make a closed fist and point your thumb straight upward.',
          'Indicates agreement, approval, or positive confirmation.',
        ];
      case 'thumbs_down':
        return [
          'Make a closed fist and point your thumb downward.',
          'Indicates disagreement, objection, or dissenting feedback.',
        ];
      default:
        return [
          'Form the gesture clearly in front of the camera lens.',
          'Ensure adequate lighting and contrast with your background.',
        ];
    }
  };

  const steps = getInstructions(command.gesture);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl p-1.5 rounded-xl bg-purple-50">
              {command.icon}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">{command.label}</h3>
              <p className="text-xs text-purple-600 font-medium">Gesture: {command.gesture}</p>
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
        <div className="p-5 space-y-4 text-xs text-slate-700">
          {/* Recognized Output Message preview */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 block mb-1">
              Translated Output Banner
            </span>
            <p className="text-lg font-black text-slate-900">"{command.message}"</p>
          </div>

          {/* How to perform instructions */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 block">How to perform:</span>
            <ul className="space-y-1.5 pl-1">
              {steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block">Confidence Required</span>
              <span className="font-bold text-slate-800">
                {Math.round((command.confidenceThreshold || 0.8) * 100)}%
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block">Debounce Cooldown</span>
              <span className="font-bold text-slate-800">{command.cooldown || 1.5}s</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-150 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => {
              onTestCommand(command);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test This Command</span>
          </button>
        </div>
      </div>
    </div>
  );
};
