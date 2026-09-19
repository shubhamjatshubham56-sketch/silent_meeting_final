import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Zap,
  Sliders,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { QuickCommandItem } from './QuickCommandsRow';

interface CommandManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: QuickCommandItem[];
  onSaveCommands: (updated: QuickCommandItem[]) => void;
  onAddCommand: (cmd: Omit<QuickCommandItem, 'id'>) => void;
  onDeleteCommand: (id: string) => void;
  onUpdateCommand: (cmd: QuickCommandItem) => void;
}

export const CommandManagementModal: React.FC<CommandManagementModalProps> = ({
  isOpen,
  onClose,
  commands,
  onAddCommand,
  onDeleteCommand,
  onUpdateCommand,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Add form fields
  const [newLabel, setNewLabel] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newGesture, setNewGesture] = useState('ok_sign');
  const [newIcon, setNewIcon] = useState('✋');
  const [newThreshold, setNewThreshold] = useState(0.8);
  const [newCooldown, setNewCooldown] = useState(1.5);

  // Edit fields
  const [editLabel, setEditLabel] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editThreshold, setEditThreshold] = useState(0.8);
  const [editCooldown, setEditCooldown] = useState(1.5);

  if (!isOpen) return null;

  const startEdit = (cmd: QuickCommandItem) => {
    setEditingId(cmd.id);
    setEditLabel(cmd.label);
    setEditMessage(cmd.message);
    setEditThreshold(cmd.confidenceThreshold || 0.8);
    setEditCooldown(cmd.cooldown || 1.5);
  };

  const saveEdit = (cmd: QuickCommandItem) => {
    onUpdateCommand({
      ...cmd,
      label: editLabel.trim() || cmd.label,
      message: editMessage.trim() || cmd.message,
      confidenceThreshold: editThreshold,
      cooldown: editCooldown,
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newMessage.trim()) return;

    onAddCommand({
      label: newLabel.trim(),
      message: newMessage.trim(),
      gesture: newGesture,
      icon: newIcon,
      enabled: true,
      confidenceThreshold: newThreshold,
      cooldown: newCooldown,
      gestureDescription: `Custom user-defined gesture for ${newLabel}`,
    });

    setNewLabel('');
    setNewMessage('');
    setIsAdding(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 fill-purple-100" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Manage Silent Commands</h3>
              <p className="text-xs text-slate-500">Configure gesture triggers, cooldowns, and banner text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Add New Command Form / Button */}
          {isAdding ? (
            <form onSubmit={handleAddSubmit} className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">New Gesture Command</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Command Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wrap up"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-purple-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Recognized Output Message</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Let's wrap up our discussion"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Gesture</label>
                  <select
                    value={newGesture}
                    onChange={(e) => setNewGesture(e.target.value)}
                    className="w-full text-xs px-2 py-2 rounded-xl bg-white border border-slate-200"
                  >
                    <option value="ok_sign">👌 OK Sign</option>
                    <option value="pointing_up">☝️ Pointing Up</option>
                    <option value="open_palm">✋ Open Palm</option>
                    <option value="folded_hands">🙏 Folded Hands</option>
                    <option value="thumbs_up">👍 Thumbs Up</option>
                    <option value="thumbs_down">👎 Thumbs Down</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Icon Emoji</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Threshold ({Math.round(newThreshold * 100)}%)</label>
                  <input
                    type="range"
                    min="0.6"
                    max="0.95"
                    step="0.05"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-all shadow-xs"
                >
                  Save Command
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-slate-600 hover:text-purple-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Command</span>
            </button>
          )}

          {/* Existing Commands List */}
          <div className="space-y-2.5">
            {commands.map((cmd) => {
              const isEditing = editingId === cmd.id;

              return (
                <div
                  key={cmd.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-slate-200"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-slate-200"
                          placeholder="Message"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500">Threshold: {Math.round(editThreshold * 100)}%</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(cmd)}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl p-1.5 rounded-xl bg-slate-100 flex-shrink-0">
                          {cmd.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {cmd.label}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                              {cmd.gesture}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            "{cmd.message}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Enable/disable toggle */}
                        <button
                          onClick={() => onUpdateCommand({ ...cmd, enabled: !cmd.enabled })}
                          title={cmd.enabled ? 'Enabled' : 'Disabled'}
                          className={`p-1.5 rounded-lg text-xs ${
                            cmd.enabled ? 'text-purple-600' : 'text-slate-400'
                          }`}
                        >
                          {cmd.enabled ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => startEdit(cmd)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {commands.length > 2 && (
                          <button
                            onClick={() => onDeleteCommand(cmd.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-150 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
