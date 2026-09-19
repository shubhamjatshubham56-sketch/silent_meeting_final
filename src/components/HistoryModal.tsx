import React, { useState } from 'react';
import {
  X,
  Clock,
  Search,
  Trash2,
  Copy,
  Check,
  Filter,
  Download,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { TranslationItem } from './RecognizedTextCard';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TranslationItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'high'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gesture.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'high') {
      return item.confidence >= 0.9;
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportCSV = () => {
    const header = 'Message,Gesture,Confidence,Timestamp\n';
    const rows = history
      .map(
        (h) =>
          `"${h.message.replace(/"/g, '""')}","${h.gesture}",${Math.round(h.confidence * 100)}%,"${h.timestamp}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silent-meeting-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Translation History</h3>
              <p className="text-xs text-slate-500">
                Full chronological log of detected meeting communications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              title="Export CSV"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search translated gestures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-purple-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'today', 'high'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                  filterTab === tab
                    ? 'bg-white text-purple-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'high' ? '>90% Conf' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No matching translations</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or filter tab</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-200 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {item.gesture === 'ok_sign'
                      ? '👌'
                      : item.gesture === 'pointing_up'
                      ? '☝️'
                      : item.gesture === 'open_palm'
                      ? '✋'
                      : item.gesture === 'thumbs_up'
                      ? '👍'
                      : item.gesture === 'thumbs_down'
                      ? '👎'
                      : '🙏'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {item.timestamp}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-600 font-semibold border border-purple-100">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(item.message, item.id)}
                    title="Copy message"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    title="Delete item"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-150 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={onClearHistory}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 hover:underline"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
