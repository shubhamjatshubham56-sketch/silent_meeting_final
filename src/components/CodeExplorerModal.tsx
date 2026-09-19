import React, { useState } from 'react';
import { X, Code, Copy, Check, Download, Terminal, Folder, FileCode } from 'lucide-react';
import { PYTHON_SOURCE_FILES } from '../data/defaultConfig';
import { AppTheme } from '../types';
import JSZip from 'jszip';

interface CodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: AppTheme;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({ isOpen, onClose, theme = 'dark' }) => {
  const [selectedFile, setSelectedFile] = useState<string>('gesture_engine.py');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const isHighContrast = theme === 'high-contrast-light';

  if (!isOpen) return null;

  const currentFileData = PYTHON_SOURCE_FILES[selectedFile] || {
    filename: selectedFile,
    description: '',
    code: '# File not found',
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentFileData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('silent_meeting_assistant');

      Object.entries(PYTHON_SOURCE_FILES).forEach(([name, item]) => {
        folder?.file(name, item.code);
      });

      // Also generate default JSON files in zip
      folder?.file(
        'custom_gestures.json',
        JSON.stringify(
          {
            thumbs_up: { label: 'Thumbs Up', text: 'I agree / Yes 👍', enabled: true, cooldown: 2.0 },
            open_palm: { label: 'Open Palm', text: 'Please wait / Stop ✋', enabled: true, cooldown: 2.5 },
            peace_sign: { label: 'Peace Sign', text: 'I have a question ✌️', enabled: true, cooldown: 2.0 },
            ok_sign: { label: 'OK Sign', text: 'Understood / Sounds good 👌', enabled: true, cooldown: 2.0 },
            pointing_up: { label: 'Pointing Up', text: 'Please check the screen / slides ☝️', enabled: true, cooldown: 2.0 },
            fist: { label: 'Closed Fist', text: 'Muted / In active listening ✊', enabled: true, cooldown: 2.5 },
            call_me: { label: 'Call Me', text: 'MASTER_MACRO:INTRO_PROFILE', enabled: true, cooldown: 3.0 },
          },
          null,
          4
        )
      );

      folder?.file(
        'profile.json',
        JSON.stringify(
          {
            name: 'Alex Morgan',
            job_title: 'Staff AI Systems Architect',
            status: 'Available / On Silent Mode',
            team: 'Engineering & Innovation',
            template: "👋 Hello everyone! I'm {name}, {job_title} ({team}). Status: {status}.",
            master_gesture: 'call_me',
          },
          null,
          4
        )
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'silent_meeting_assistant.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error creating zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div
        className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[88vh] transition-colors ${
          isHighContrast
            ? 'bg-white border-2 border-slate-950 text-slate-950'
            : 'bg-slate-900 border border-slate-700/80 text-white'
        }`}
      >
        {/* Header */}
        <div
          className={`h-14 px-6 flex items-center justify-between transition-colors ${
            isHighContrast
              ? 'bg-slate-100 border-b-2 border-slate-950 text-slate-950'
              : 'border-b border-slate-800 bg-slate-950 text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Code className={`w-5 h-5 ${isHighContrast ? 'text-indigo-800' : 'text-indigo-400'}`} />
            <div>
              <h2 className="text-sm font-black tracking-wide">
                Modular Python Project Architecture &amp; Code Hub
              </h2>
              <p className={`text-[11px] font-medium ${isHighContrast ? 'text-slate-700' : 'text-slate-400'}`}>
                Production-ready Python, OpenCV, MediaPipe Hands &amp; PyQt6 codebase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className={`text-xs px-3.5 py-1.5 rounded-lg text-white font-black flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 ${
                isHighContrast
                  ? 'bg-emerald-700 hover:bg-emerald-800 border-2 border-emerald-950'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              {isZipping ? 'Packaging ZIP...' : 'Download Project (ZIP)'}
            </button>
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
        </div>

        {/* Code View Grid */}
        <div className="flex-1 grid grid-cols-12 overflow-hidden">
          {/* File Explorer Sidebar */}
          <div
            className={`col-span-3 p-3 flex flex-col justify-between overflow-y-auto transition-colors ${
              isHighContrast
                ? 'border-r-2 border-slate-950 bg-slate-50 text-slate-950'
                : 'border-r border-slate-800 bg-slate-950/70 text-slate-300'
            }`}
          >
            <div className="space-y-1">
              <div
                className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isHighContrast ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                <Folder className={`w-3.5 h-3.5 ${isHighContrast ? 'text-blue-700' : 'text-blue-400'}`} />
                silent_meeting_assistant/
              </div>

              {Object.keys(PYTHON_SOURCE_FILES).map((fileName) => {
                const isPy = fileName.endsWith('.py');
                const isSelected = selectedFile === fileName;
                return (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFile(fileName)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md flex items-center gap-2 transition-all font-mono ${
                      isSelected
                        ? isHighContrast
                          ? 'bg-blue-100 text-blue-950 border-2 border-blue-900 font-black shadow-sm'
                          : 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                        : isHighContrast
                        ? 'text-slate-800 hover:bg-slate-200 font-bold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <FileCode
                      className={`w-3.5 h-3.5 ${
                        isPy
                          ? isHighContrast
                            ? 'text-blue-800'
                            : 'text-blue-400'
                          : isHighContrast
                          ? 'text-amber-800'
                          : 'text-amber-400'
                      }`}
                    />
                    <span className="truncate">{fileName}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Terminal Guide */}
            <div
              className={`rounded-lg p-3 text-[11px] space-y-1.5 border transition-colors ${
                isHighContrast
                  ? 'bg-white border-2 border-slate-950 text-slate-950 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div
                className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
                  isHighContrast ? 'text-emerald-800' : 'text-emerald-400'
                }`}
              >
                <Terminal className="w-3 h-3" /> Quickstart Command
              </div>
              <p className={`text-[10px] font-bold ${isHighContrast ? 'text-slate-800' : 'text-slate-400'}`}>
                Run the core engine:
              </p>
              <div
                className={`p-1.5 rounded font-mono text-[10px] select-all font-bold ${
                  isHighContrast
                    ? 'bg-slate-100 text-slate-950 border border-slate-950'
                    : 'bg-black text-emerald-300'
                }`}
              >
                python gesture_engine.py
              </div>
              <p className={`text-[10px] font-bold ${isHighContrast ? 'text-slate-800' : 'text-slate-400'}`}>
                Run full floating app:
              </p>
              <div
                className={`p-1.5 rounded font-mono text-[10px] select-all font-bold ${
                  isHighContrast
                    ? 'bg-slate-100 text-slate-950 border border-slate-950'
                    : 'bg-black text-emerald-300'
                }`}
              >
                python main.py
              </div>
            </div>
          </div>

          {/* Main Code Editor / Preview Pane */}
          <div
            className={`col-span-9 flex flex-col overflow-hidden transition-colors ${
              isHighContrast ? 'bg-slate-900 text-slate-100' : 'bg-[#0A0D14] text-slate-300'
            }`}
          >
            {/* File Info Bar */}
            <div
              className={`h-10 px-4 border-b flex items-center justify-between transition-colors ${
                isHighContrast
                  ? 'bg-slate-800/90 border-slate-700 text-white'
                  : 'border-slate-800 bg-slate-900/60 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black">{currentFileData.filename}</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">— {currentFileData.description}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1 transition-colors border ${
                  isHighContrast
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy File'}
              </button>
            </div>

            {/* Code Content Box */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-100 leading-relaxed select-text">
              <pre>
                <code>{currentFileData.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
