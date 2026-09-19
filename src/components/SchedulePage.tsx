import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  Bell,
  Check,
  X,
  Play,
  ArrowRight,
  ListTodo,
  CalendarDays,
  Flame,
  MessageSquare,
} from 'lucide-react';

export interface ScheduleItem {
  id: string;
  type: 'meeting' | 'task' | 'reminder' | 'deadline';
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  priority: 'low' | 'medium' | 'high';
  reminder?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  sourceMeeting?: string;
  originalStatement?: string;
  isAiExtracted?: boolean;
  confidence?: number;
  createdAt: string;
  updatedAt: string;
}

interface SchedulePageProps {
  currentUserName?: string;
  onToast?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  onPendingTaskChange?: (task: any | null) => void;
  tasks?: any[];
  currentMeetingName?: string;
  onAddTask?: (newTaskData: any) => void;
  onUpdateTask?: (updated: any) => void;
  onDeleteTask?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  onStartMeetingMode?: (task: any) => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  currentUserName = 'Shrim Yadav',
  onToast = () => {},
  onPendingTaskChange,
}) => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'today' | 'calendar' | 'tasks'>('today');
  const [calendarSpan, setCalendarSpan] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'task' as 'meeting' | 'task' | 'reminder' | 'deadline',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminder: '15m',
    assignedTo: currentUserName,
  });

  // AI Task Extraction Simulator state
  const [simulatorInput, setSimulatorInput] = useState(
    `${currentUserName || 'Shubham'}, please prepare the project documentation by Friday.`
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [detectedPendingTask, setDetectedPendingTask] = useState<any | null>(null);

  // Fetch schedule from backend API
  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/schedule');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.schedule)) {
          setItems(data.schedule);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch schedule from API, using cached state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Sync pending task to parent callback if provided
  useEffect(() => {
    if (onPendingTaskChange) {
      onPendingTaskChange(detectedPendingTask);
    }
  }, [detectedPendingTask, onPendingTaskChange]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      type: 'task',
      description: '',
      date: selectedDate,
      startTime: '10:00',
      endTime: '11:00',
      priority: 'medium',
      reminder: '15m',
      assignedTo: currentUserName || 'Self',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      description: item.description || '',
      date: item.date,
      startTime: item.startTime || '10:00',
      endTime: item.endTime || '11:00',
      priority: item.priority,
      reminder: item.reminder || '15m',
      assignedTo: item.assignedTo || currentUserName,
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast('Validation Error', 'Title is required', 'warning');
      return;
    }

    try {
      if (editingItem) {
        // Update item
        const res = await fetch(`/api/schedule/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.item : i)));
          onToast('Event Updated', `"${formData.title}" updated successfully`, 'success');
        }
      } else {
        // Create item
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [...prev, data.item]);
          onToast('Event Added', `"${formData.title}" scheduled for ${formData.date}`, 'success');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving schedule item:', err);
      onToast('Error', 'Could not save schedule item', 'error');
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        onToast('Event Removed', `"${title}" has been removed from schedule`, 'info');
      }
    } catch (err) {
      console.error('Error deleting schedule item:', err);
    }
  };

  const handleToggleStatus = async (item: ScheduleItem) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/schedule/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
        );
        onToast(
          nextStatus === 'completed' ? 'Marked Complete' : 'Marked Pending',
          `"${item.title}" status updated`,
          'success'
        );
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // Run AI Task Extraction from Meeting Transcript
  const handleExtractFromTranscript = async (sampleText?: string) => {
    const textToAnalyze = sampleText || simulatorInput;
    if (!textToAnalyze.trim()) return;

    setIsExtracting(true);
    try {
      const res = await fetch('/api/schedule/extract-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToAnalyze,
          currentUserName: currentUserName || 'Shubham',
          meetingContext: 'Team Engineering Sync',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.extractedTasks && data.extractedTasks.length > 0) {
          const task = data.extractedTasks[0];
          setDetectedPendingTask(task);
        } else {
          onToast('No Actionable Task', 'Conversation segment contains no direct task instruction', 'info');
        }
      }
    } catch (err) {
      console.error('Error running AI task extraction:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Confirm and add AI detected task to schedule
  const handleConfirmAiTask = async () => {
    if (!detectedPendingTask) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          title: detectedPendingTask.task,
          description: `Extracted from live meeting conversation. Deadline: ${detectedPendingTask.deadline}`,
          date: today,
          startTime: '11:00',
          endTime: '12:30',
          priority: detectedPendingTask.priority || 'high',
          assignedTo: detectedPendingTask.assignedTo || currentUserName,
          sourceMeeting: detectedPendingTask.source || 'Team Meeting',
          originalStatement: detectedPendingTask.originalStatement,
          isAiExtracted: true,
          confidence: detectedPendingTask.confidence || 0.94,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [...prev, data.item]);
        setDetectedPendingTask(null);
        onToast('Task Added', `✓ "${detectedPendingTask.task}" added to your schedule`, 'success');
      }
    } catch (err) {
      console.error('Error adding confirmed AI task:', err);
      onToast('Error', 'Failed to add task to schedule', 'error');
    }
  };

  // Filter items
  const todayStr = new Date().toISOString().split('T')[0];
  const filteredItems = items.filter((item) => {
    if (viewMode === 'today' && item.date !== todayStr) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.assignedTo && item.assignedTo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getTypeBadge = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'meeting':
        return { label: 'Meeting', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'deadline':
        return { label: 'Deadline', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'reminder':
        return { label: 'Reminder', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'task':
      default:
        return { label: 'Task', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const getPriorityBadge = (priority: ScheduleItem['priority']) => {
    switch (priority) {
      case 'high':
        return { label: 'High', dot: 'bg-rose-500', text: 'text-rose-600' };
      case 'medium':
        return { label: 'Medium', dot: 'bg-amber-500', text: 'text-amber-600' };
      case 'low':
      default:
        return { label: 'Low', dot: 'bg-slate-400', text: 'text-slate-600' };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                My Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage your meetings, tasks and deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'today'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* 2. Floating AI Task Confirmation Notification Banner */}
      {detectedPendingTask && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 shadow-xl border border-purple-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 text-purple-300 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-purple-300">
                    AI Task Detected in Meeting
                  </span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full font-medium">
                    Assigned to: {detectedPendingTask.assignedTo}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {detectedPendingTask.task}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                  <span>
                    Due:{' '}
                    <strong className="text-purple-200">
                      {detectedPendingTask.deadline || 'This week'}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Source:{' '}
                    <span className="text-slate-400">
                      {detectedPendingTask.source || 'Meeting Discussion'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Confidence:{' '}
                    <strong className="text-emerald-400">
                      {Math.round((detectedPendingTask.confidence || 0.94) * 100)}%
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleConfirmAiTask}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add to Schedule</span>
              </button>
              <button
                onClick={() => setDetectedPendingTask(null)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Meeting Task Extraction Testing Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Meeting Task Detection Simulator</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Simulates real-time transcript &amp; assignment parsing
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={simulatorInput}
            onChange={(e) => setSimulatorInput(e.target.value)}
            placeholder="e.g. Rahul, please complete the UI by tomorrow."
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden transition-all"
          />
          <button
            onClick={() => handleExtractFromTranscript()}
            disabled={isExtracting}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer flex-shrink-0"
          >
            {isExtracting ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Extract Task</span>
          </button>
        </div>

        {/* Quick Example Presets */}
        <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Try Presets:</span>
          <button
            onClick={() => {
              const text = `${currentUserName || 'Shubham'}, please prepare the project documentation by Friday.`;
              setSimulatorInput(text);
              handleExtractFromTranscript(text);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            "Prepare project documentation by Friday"
          </button>
          <button
            onClick={() => {
              const text = `Can you complete the accessibility audit by tomorrow afternoon?`;
              setSimulatorInput(text);
              handleExtractFromTranscript(text);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            "Complete accessibility audit by tomorrow"
          </button>
          <button
            onClick={() => {
              const text = `Great work on the presentation earlier today.`;
              setSimulatorInput(text);
              handleExtractFromTranscript(text);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer italic"
          >
            "Great work" (Non-task test)
          </button>
        </div>
      </div>

      {/* 4. Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, meetings..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* 5. Main View: Today Timeline View */}
      {viewMode === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Today's Timeline</span>
              <span className="text-xs font-normal text-slate-400">
                ({new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })})
              </span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {filteredItems.length} Scheduled
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No events scheduled for today</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Add meetings or let AI extract tasks during your silent meetings automatically.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Schedule Today's First Event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const typeBadge = getTypeBadge(item.type);
                const priorityBadge = getPriorityBadge(item.priority);
                const isCompleted = item.status === 'completed';

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition-all p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'border-slate-200/60 bg-slate-50/40 opacity-75'
                        : 'border-slate-200/90 hover:shadow-md hover:border-indigo-200'
                    }`}
                  >
                    {/* Time Slot & Main Details */}
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Status Checkbox */}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors mt-0.5 flex-shrink-0 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Time */}
                          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
                          </span>

                          {/* Type */}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeBadge.bg}`}
                          >
                            {typeBadge.label}
                          </span>

                          {/* Priority */}
                          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                            {priorityBadge.label}
                          </span>

                          {/* AI Extracted Indicator */}
                          {item.isAiExtracted && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Extracted
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-sm font-bold ${
                            isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {item.originalStatement && (
                          <p className="text-[11px] text-slate-400 italic">
                            Origin: "{item.originalStatement}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit event"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Day / Week / Month Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setCalendarSpan('day')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calendarSpan === 'day' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setCalendarSpan('week')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calendarSpan === 'week' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setCalendarSpan('month')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  calendarSpan === 'month' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                Month
              </button>
            </div>
          </div>

          {/* Clean 7-day strip */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
              const d = new Date();
              d.setDate(d.getDate() - d.getDay() + idx);
              const dateStr = d.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const dayItems = items.filter((i) => i.date === dateStr);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : isToday
                      ? 'border-purple-300 bg-purple-50/30'
                      : 'border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">{day}</span>
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-800'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-100/70 px-1.5 rounded-full">
                      {dayItems.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Events for selected date in Calendar view */}
          <div className="pt-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Events on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </h4>
            {items.filter((i) => i.date === selectedDate).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No events scheduled on this day.
              </p>
            ) : (
              items
                .filter((i) => i.date === selectedDate)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {item.startTime}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                      {item.isAiExtracted && (
                        <Sparkles className="w-3 h-3 text-purple-500" />
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium capitalize">
                      {item.type}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 7. All Items View */}
      {viewMode === 'tasks' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            All Scheduled Items ({filteredItems.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {item.date} at {item.startTime}
                    </span>
                  </div>
                  {item.sourceMeeting && (
                    <span className="text-[10px] text-slate-400">
                      Source: {item.sourceMeeting}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'Edit Event' : 'Add New Event'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schedule a meeting, task, reminder or deadline
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Prepare project documentation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="task">Task</option>
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details, discussion topics, deliverables..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Person</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="e.g. Shubham"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reminder</label>
                  <select
                    value={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="none">No reminder</option>
                    <option value="10m">10 minutes before</option>
                    <option value="15m">15 minutes before</option>
                    <option value="30m">30 minutes before</option>
                    <option value="1h">1 hour before</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
