import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Bot,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  RefreshCw,
  Copy,
  Check,
  Search,
  Filter,
  Volume2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Award,
  ThumbsUp,
  Hand,
  BookmarkPlus,
  Cloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  TranscriptRecord,
  LiveMeetingSummary,
  MeetingIntelligenceEvent,
  AuthUserState,
} from '../types';

interface MeetingIntelligencePanelProps {
  meetingContext: string;
  meetingTopic?: string;
  currentIntent: string;
  currentMessage: string;
  events: MeetingIntelligenceEvent[];
  transcripts: TranscriptRecord[];
  isMicListening: boolean;
  audioLevel?: number;
  interimSpeech?: string;
  onToggleMic: () => void;
  liveSummary: LiveMeetingSummary | null;
  isGeneratingSummary: boolean;
  onGenerateLiveSummary: () => Promise<void>;
  onAddEvent?: (event: Omit<MeetingIntelligenceEvent, 'id'>) => void;
  onAddTaskFromIntelligence?: (
    title: string,
    deadline: string,
    priority: 'High' | 'Medium' | 'Low',
    notes: string
  ) => void;
  onSaveToCloud?: () => Promise<void>;
  isSavingToCloud?: boolean;
  user?: AuthUserState | null;
  onSignInGoogle?: () => void;
  onClearTranscripts?: () => void;
}

export const MeetingIntelligencePanel: React.FC<MeetingIntelligencePanelProps> = ({
  meetingContext,
  meetingTopic = 'Frontend Architecture',
  currentIntent,
  currentMessage,
  events,
  transcripts,
  isMicListening,
  audioLevel = 0,
  interimSpeech = '',
  onToggleMic,
  liveSummary,
  isGeneratingSummary,
  onGenerateLiveSummary,
  onAddEvent,
  onAddTaskFromIntelligence,
  onSaveToCloud,
  isSavingToCloud = false,
  user,
  onSignInGoogle,
  onClearTranscripts,
}) => {
  const [activeTab, setActiveTab] = useState<'transcripts' | 'summary' | 'actions'>('transcripts');
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'speech' | 'gesture'>('all');
  const [manualNote, setManualNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);

  // Filtered transcripts
  const filteredTranscripts = useMemo(() => {
    return transcripts.filter((t) => {
      const matchesSearch =
        t.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
        t.speaker.toLowerCase().includes(transcriptSearch.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transcripts, transcriptSearch, filterType]);

  const handleAddManualNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualNote.trim() || !onAddEvent) return;
    onAddEvent({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'decision',
      text: manualNote.trim(),
      speaker: user?.displayName || 'You',
      completed: true,
    });
    setManualNote('');
  };

  const handleCopyTranscript = () => {
    const text = transcripts
      .map((t) => `[${t.timestamp}] (${t.type.toUpperCase()}) ${t.speaker}: ${t.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      id="meeting-intelligence-panel"
      className="w-full xl:w-96 shrink-0 bg-white rounded-2xl p-3.5 shadow-md border border-slate-200/90 flex flex-col gap-3 select-none overflow-hidden max-h-[calc(100vh-145px)]"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0084FF] flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                Meeting Intelligence
              </span>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                Gemini 3.8
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
              {meetingTopic || 'Project Discussion'}
            </div>
          </div>
        </div>

        {/* Cloud Save / Sign-in Pill */}
        {user ? (
          <button
            onClick={onSaveToCloud}
            disabled={isSavingToCloud}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Save session, transcripts and summary to Firestore"
          >
            <Cloud className={`w-3.5 h-3.5 ${isSavingToCloud ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>{isSavingToCloud ? 'Saving...' : 'Sync Cloud'}</span>
          </button>
        ) : (
          <button
            onClick={onSignInGoogle}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            title="Sign in with Google to sync meeting to Firestore"
          >
            <span>Cloud Sync</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center p-1 bg-slate-100/90 rounded-xl text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('transcripts')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'transcripts'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Transcripts</span>
          <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-medium">
            {transcripts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Live Summary</span>
          {liveSummary && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'actions'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Action Items</span>
          <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded-full font-medium">
            {(liveSummary?.actionItems?.length || 0) + (events.filter((e) => e.type === 'action_item').length || 0)}
          </span>
        </button>
      </div>

      {/* Real-time Mic Listening Ribbon */}
      <div
        className={`px-3 py-2 rounded-xl border flex items-center justify-between transition-colors ${
          isMicListening
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isMicListening
                ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {isMicListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-tight">
                {isMicListening ? 'Real-Time Voice STT Active' : 'Microphone STT Muted'}
              </span>
              {isMicListening && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <span className="text-[11px] text-slate-500 leading-tight truncate">
              {isMicListening
                ? interimSpeech
                  ? `"${interimSpeech}"`
                  : 'Listening to room speech...'
                : 'Click mic to stream audio transcript'}
            </span>
          </div>
        </div>

        <button
          onClick={onToggleMic}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            isMicListening
              ? 'bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isMicListening ? 'Mute Mic' : 'Start Mic'}
        </button>
      </div>

      {/* TAB 1: TRANSCRIPTS */}
      {activeTab === 'transcripts' && (
        <div className="flex-1 flex flex-col min-h-0 gap-2.5">
          {/* Controls: Search, Filter, Copy */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search transcripts..."
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">All</option>
              <option value="speech">Voice</option>
              <option value="gesture">Gestures</option>
            </select>
            <button
              onClick={handleCopyTranscript}
              disabled={transcripts.length === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
              title="Copy all transcripts"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Transcript Stream List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] scrollbar-thin">
            {filteredTranscripts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                <Mic className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No transcripts yet</p>
                <p className="text-[11px] max-w-[200px] mt-0.5">
                  Turn on your microphone or use hand gestures to start capturing real-time transcript.
                </p>
              </div>
            ) : (
              filteredTranscripts.map((t) => {
                const isSpeech = t.type === 'speech';
                const isGesture = t.type === 'gesture';
                return (
                  <div
                    key={t.id}
                    className={`p-2.5 rounded-xl border text-xs leading-relaxed transition-all ${
                      isSpeech
                        ? 'bg-slate-50/90 border-slate-200/80 text-slate-800'
                        : 'bg-emerald-50/60 border-emerald-200/70 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isSpeech
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isSpeech ? 'Voice' : 'Gesture'}
                        </span>
                        <span className="font-bold text-slate-800">{t.speaker}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">{t.timestamp}</span>
                    </div>
                    <div className="text-slate-700 font-normal">{t.text}</div>
                  </div>
                );
              })
            )}

            {/* Live interim preview */}
            {isMicListening && interimSpeech && (
              <div className="p-2.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 text-xs text-blue-900 animate-pulse">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Transcribing live
                  </span>
                </div>
                <div className="italic text-slate-700 font-medium">"{interimSpeech}"</div>
              </div>
            )}
          </div>

          {/* Quick Note Input Form */}
          <form onSubmit={handleAddManualNote} className="flex gap-1.5 pt-1 border-t border-slate-100">
            <input
              type="text"
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="Type note or decision..."
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!manualNote.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#0084FF] hover:bg-[#0070D6] text-white text-xs font-semibold disabled:opacity-40 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: LIVE SUMMARY */}
      {activeTab === 'summary' && (
        <div className="flex-1 flex flex-col min-h-0 gap-3 overflow-y-auto pr-1">
          {/* Action Button: Generate Live Summary with Gemini */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-2.5">
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Executive Gemini Summary</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {liveSummary
                  ? `Generated from ${liveSummary.transcriptCount || transcripts.length} records`
                  : 'Synthesizes real-time transcripts into structured minutes'}
              </div>
            </div>

            <button
              onClick={onGenerateLiveSummary}
              disabled={isGeneratingSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0084FF] hover:bg-[#0070D6] text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
              <span>{isGeneratingSummary ? 'Summarizing...' : 'Generate'}</span>
            </button>
          </div>

          {/* Summary Content */}
          {liveSummary ? (
            <div className="space-y-3">
              {/* Executive Overview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Executive Briefing
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {liveSummary.generatedAt}
                  </span>
                </div>
                <p className="text-slate-800 leading-relaxed font-normal">
                  {liveSummary.executiveSummary}
                </p>
              </div>

              {/* Sentiment & Engagement Pulse */}
              {liveSummary.sentiment && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      Sentiment Pulse
                    </div>
                    <span className="text-xs font-bold text-emerald-900">
                      {liveSummary.sentiment.pulse}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 mb-0.5">
                      Alignment Score
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-black text-blue-900">
                        {liveSummary.sentiment.score}
                      </span>
                      <span className="text-[10px] font-semibold text-blue-600">/ 100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Discussion Points */}
              {liveSummary.keyPoints && liveSummary.keyPoints.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Key Highlights
                  </span>
                  <ul className="space-y-1">
                    {liveSummary.keyPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 flex items-start gap-1.5 bg-white border border-slate-100 rounded-lg p-2 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decisions & Alignments */}
              {liveSummary.decisions && liveSummary.decisions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Decisions Reached
                  </span>
                  <ul className="space-y-1">
                    {liveSummary.decisions.map((dec, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-emerald-900 flex items-start gap-1.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-2 leading-relaxed"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="font-medium">{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Follow-up Topics */}
              {liveSummary.suggestedTopics && liveSummary.suggestedTopics.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Recommended Next Topics
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {liveSummary.suggestedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
              <Bot className="w-8 h-8 stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No summary generated yet</p>
              <p className="text-[11px] max-w-[220px] mt-0.5">
                Click "Generate" above or let the meeting transcribe to create real-time executive minutes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACTION ITEMS */}
      {activeTab === 'actions' && (
        <div className="flex-1 flex flex-col min-h-0 gap-2.5 overflow-y-auto pr-1">
          {/* Extracted Tasks List */}
          <div className="space-y-2">
            {liveSummary?.actionItems && liveSummary.actionItems.length > 0 ? (
              liveSummary.actionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 leading-snug">{item.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        item.priority === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : item.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      Assignee: <strong className="text-slate-700">{item.assignee || 'Team'}</strong>
                    </span>
                    <span>Due: {item.deadline || 'This week'}</span>
                  </div>

                  {onAddTaskFromIntelligence && (
                    <button
                      onClick={() =>
                        onAddTaskFromIntelligence(
                          item.title,
                          item.deadline || 'This week',
                          item.priority || 'Medium',
                          `Assigned to ${item.assignee || 'Team'}`
                        )
                      }
                      className="mt-1 w-full py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-blue-600 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>Add to My Schedule</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 className="w-8 h-8 stroke-1 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No action items detected</p>
                <p className="text-[11px] max-w-[200px] mx-auto mt-0.5">
                  Generate an AI summary to automatically extract deliverables and to-dos from the discussion.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer State / Current Gesture / Intent Indicator */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Hand className="w-3.5 h-3.5 text-blue-500" />
          <span>Intent:</span>
          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.2 rounded-md">
            {currentIntent || 'AGREE'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
          "{currentMessage || 'I agree with using React.'}"
        </span>
      </div>
    </aside>
  );
};
