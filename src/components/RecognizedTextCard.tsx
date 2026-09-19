import React, { useState } from 'react';
import {
  Type,
  Copy,
  Volume2,
  Trash2,
  Check,
  ChevronDown,
  Sparkles,
  Clock,
  History,
  AlertCircle,
} from 'lucide-react';

export interface TranslationItem {
  id: string;
  message: string;
  gesture: string;
  confidence: number;
  timestamp: string;
}

interface RecognizedTextCardProps {
  currentText: string;
  currentConfidence: number;
  currentTimestamp: string;
  recentTranslations: TranslationItem[];
  onClearAll: () => void;
  onDeleteItem: (id: string) => void;
  onSpeakText: (text: string) => void;
  onCopyText: (text: string) => void;
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
}

export const RecognizedTextCard: React.FC<RecognizedTextCardProps> = ({
  currentText,
  currentConfidence,
  currentTimestamp,
  recentTranslations,
  onClearAll,
  onDeleteItem,
  onSpeakText,
  onCopyText,
  selectedLanguage = 'English',
  onSelectLanguage,
}) => {
  const [copied, setCopied] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    onCopyText(currentText);
    setTimeout(() => setCopied(false), 2000);
  };

  const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese'];
  const confPct = Math.min(100, Math.max(0, Math.round(currentConfidence * 100)));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden h-full">
      {/* 1. Card Header: Title & Language Selector */}
      <div className="px-5 py-3.5 border-b border-slate-150 flex items-center justify-between flex-shrink-0 bg-white/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Type className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            Recognized Text
          </h2>
        </div>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/70 transition-all"
          >
            <span>{selectedLanguage}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    if (onSelectLanguage) onSelectLanguage(lang);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-purple-50 transition-colors ${
                    selectedLanguage === lang ? 'text-purple-600 font-semibold' : 'text-slate-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Big Main Display: Large Recognized Text with Actions */}
      <div className="p-5 flex-shrink-0 relative">
        {/* Top right timestamp & action buttons */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {currentTimestamp || '11:24:36 AM'}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              title="Copy text"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onSpeakText(currentText)}
              title="Speak aloud"
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Large Text Display matching Image */}
        <div className="min-h-[90px] flex items-center justify-center text-center relative py-2">
          {currentText ? (
            <div className="relative inline-block">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 animate-in fade-in zoom-in-95 duration-200">
                {currentText}
              </h1>
              {/* Sparkle subtle accents around text */}
              <Sparkles className="w-3.5 h-3.5 text-purple-400 absolute -top-2 -right-4 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-1 -left-3" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm font-semibold">Waiting for gesture...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Show a hand gesture to the camera</p>
            </div>
          )}
        </div>

        {/* 3. Confidence Level Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>Confidence Level</span>
            <span className="text-purple-600 font-bold">{confPct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden ring-1 ring-slate-200/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transition-all duration-300"
              style={{ width: `${confPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Recent Translations Section matching Image */}
      <div className="flex-1 flex flex-col border-t border-slate-150 min-h-0 bg-slate-50/40">
        <div className="px-5 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Recent Translations</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {recentTranslations.length} total
          </span>
        </div>

        {/* Scrollable Translation List */}
        <div className="flex-1 overflow-y-auto px-5 py-1 space-y-2 min-h-[160px] max-h-[260px]">
          {recentTranslations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400">
              <AlertCircle className="w-5 h-5 text-slate-300 mb-1.5" />
              <p className="text-xs font-medium">No translations yet</p>
              <p className="text-[10px] text-slate-400">Recognized gestures will appear here</p>
            </div>
          ) : (
            recentTranslations.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between py-2 px-2.5 rounded-xl hover:bg-white hover:shadow-xs transition-all border border-transparent hover:border-slate-200/70"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {item.message}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-medium text-slate-400">
                    {item.timestamp}
                  </span>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete entry"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 5. Clear All Button matching Reference UI */}
        <div className="p-3 border-t border-slate-150 flex items-center justify-center flex-shrink-0 bg-white/70">
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all group"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-rose-500" />
            <span>Clear All</span>
            <Sparkles className="w-3 h-3 text-rose-300 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
};
