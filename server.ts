import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Silent Meeting Assistant",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Endpoint: Enhance meeting transcription message
app.post("/api/gemini/enhance-phrase", async (req: Request, res: Response) => {
  try {
    const { phrase, context, tone } = req.body;
    if (!phrase) {
      res.status(400).json({ error: "Phrase is required" });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if no API key is set
      res.json({
        enhanced: `Polite: ${phrase} (Please take note)`,
        variations: [
          `${phrase} - Thanks!`,
          `Pardon the interruption: ${phrase}`,
          `Quick update: ${phrase}`,
        ],
      });
      return;
    }

    const prompt = `You are an executive communication and accessibility expert helping virtual meeting attendees communicate silently through on-screen transcription banners.
The user wants to refine the following raw phrase triggered by a hand gesture:
"${phrase}"

Desired tone: ${tone || "Professional, polite, concise, and clear"}
Meeting Context: ${context || "General remote team meeting"}

Task:
Provide:
1. One refined, high-contrast primary phrase (maximum 8-12 words, friendly emoji if appropriate) suitable for a floating meeting HUD.
2. Three alternative variations (e.g. Concise, Executive, Friendly).

Format response strictly as JSON:
{
  "enhanced": "Primary polished phrase",
  "variations": ["Variation 1", "Variation 2", "Variation 3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text || "{}";
    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/enhance-phrase:", error);
    res.status(500).json({ error: error.message || "Failed to refine phrase" });
  }
});

// AI Endpoint: Generate Profile Intro Macro
app.post("/api/gemini/generate-intro", async (req: Request, res: Response) => {
  try {
    const { name, jobTitle, team, status, style } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        template: `👋 Hello everyone! I'm {name}, {job_title} ({team}). Status: {status} at {time}.`,
        preview: `👋 Hello everyone! I'm ${name || "Alex"}, ${jobTitle || "Engineer"} (${team || "Tech"}). Status: ${status || "Listening"} at 10:00 AM.`,
      });
      return;
    }

    const prompt = `You are designing a high-impact intro card macro for a virtual meeting floating overlay.
User Info:
- Name: ${name || "Participant"}
- Job Title: ${jobTitle || "Team Member"}
- Team/Org: ${team || "Product Team"}
- Status/Note: ${status || "Listening silently"}
- Style: ${style || "Warm, professional, and accessible"}

Create a concise introduction template string using tokens: {name}, {job_title}, {team}, {status}, {time}.
Keep it under 140 characters so it fits comfortably in a floating meeting transcription banner.

Return strictly as JSON:
{
  "template": "👋 Hi team! I'm {name}, {job_title} on {team}. Current status: {status} ({time}).",
  "tips": "Brief 1-sentence tip on how to best use this in calls"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/generate-intro:", error);
    res.status(500).json({ error: error.message || "Failed to generate intro" });
  }
});

// AI Endpoint: Process Structured Gesture Event for Meeting Intelligence
// Preferred structured input: { gesture, label, message, confidence, meeting_context, active_topic }
app.post("/api/gemini/meeting-event", async (req: Request, res: Response) => {
  try {
    const { gesture, label, message, confidence, meeting_context, active_topic } = req.body;

    if (!gesture && !message) {
      res.status(400).json({ error: "Gesture or message is required" });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      // Offline fallback: structured intelligence without AI model
      const fallbackSentiment =
        label === 'Thumbs Up' || gesture === 'thumbs_up'
          ? 'positive'
          : label === 'Victory' || gesture === 'victory'
          ? 'curious'
          : 'neutral';

      res.json({
        summary: `Participant signaled "${message}" via ${label || gesture} (${Math.round((confidence || 0.95) * 100)}% conf).`,
        sentiment: fallbackSentiment,
        meeting_note: `Logged silent consensus in topic "${active_topic || 'Current Discussion'}".`,
        detected_action_item: null,
      });
      return;
    }

    const prompt = `You are a real-time executive meeting intelligence assistant.
A participant in a virtual video meeting just triggered a silent communication gesture with high geometric confidence:
- Gesture: "${label || gesture}"
- Broadcast Message: "${message}"
- Vision Confidence: ${confidence || 0.95}
- Meeting Context: "${meeting_context || "Engineering & Sprint Planning"}"
- Active Topic: "${active_topic || "Architecture Review"}"

Analyze this silent contribution in the context of professional corporate discussion.
Provide:
1. "summary": A crisp 1-sentence executive summary of the participant's contribution.
2. "sentiment": "positive", "neutral", or "attention_needed".
3. "meeting_note": A concise bullet note suitable for the official meeting minutes.
4. "detected_action_item": If this gesture or context implies a follow-up task or responsibility for the participant (e.g. asking a question, agreeing to take an assignment), provide an object { "title": string, "priority": "High" | "Medium" | "Low", "deadline": string }, otherwise null.

Respond strictly as JSON matching this schema:
{
  "summary": "Alex agreed with the proposal on Frontend Architecture.",
  "sentiment": "positive",
  "meeting_note": "Consensus reached on architecture proposal.",
  "detected_action_item": null
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/meeting-event:", error);
    // Graceful error response so client pipeline never halts
    res.json({
      summary: `Signaled "${req.body.message || 'Gesture'}"`,
      sentiment: 'neutral',
      meeting_note: 'Recorded in local session transcript.',
      detected_action_item: null,
    });
  }
});

// AI Endpoint: Real-time meeting transcription summary and pulse
app.post("/api/gemini/live-summary", async (req: Request, res: Response) => {
  try {
    const { transcripts, meetingContext, notes } = req.body;

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      res.json({
        executiveSummary: "Meeting transcription is active. Speak into the microphone or trigger silent gestures to generate real-time synthesis.",
        keyPoints: [],
        decisions: [],
        actionItems: [],
        sentiment: { overall: "neutral", pulse: "Awaiting audio input", score: 50 },
        suggestedTopics: ["Outline meeting agenda", "Review blocker status", "Discuss action item assignments"],
      });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        executiveSummary: `Real-time meeting session in progress with ${transcripts.length} transcript entries recorded.`,
        keyPoints: transcripts.slice(-4).map((t: any) => `${t.speaker}: ${t.text}`),
        decisions: ["Active alignment on project deliverables."],
        actionItems: [
          {
            title: "Review real-time transcript notes",
            priority: "Medium",
            assignee: transcripts[0]?.speaker || "Team",
            deadline: "Before next sync",
            status: "Pending",
          },
        ],
        sentiment: { overall: "positive", pulse: "Collaborative and engaged", score: 85 },
        suggestedTopics: ["Next sprint milestones", "Technical dependency check"],
      });
      return;
    }

    const transcriptText = transcripts
      .map(
        (t: any, idx: number) =>
          `[${t.timestamp || `#${idx + 1}`}] (${t.type || 'speech'}) ${t.speaker || 'Speaker'}: ${t.text}`
      )
      .join("\n");

    const prompt = `You are a world-class executive meeting intelligence assistant.
Analyze this active meeting's real-time transcript stream and produce a structured, high-value live summary.

Meeting Context: ${meetingContext || "Virtual team collaboration and status review"}
Manual Notes Taken: ${JSON.stringify(notes || [])}

Real-Time Transcript:
${transcriptText}

Output Requirements:
1. "executiveSummary": A crisp, professional 2-3 sentence overview synthesizing the meeting's trajectory and main focus.
2. "keyPoints": Array of 3-5 concise bullet strings highlighting critical items or progress discussed.
3. "decisions": Array of agreed decisions or alignments (can be tentative).
4. "actionItems": Array of concrete tasks extracted with schema: { "title": string, "priority": "High" | "Medium" | "Low", "assignee": string, "deadline": string, "status": "Pending" }
5. "sentiment": { "overall": "positive" | "neutral" | "attention_needed", "pulse": string (3-5 words describing team dynamic), "score": number between 0 and 100 }
6. "suggestedTopics": Array of 2-3 actionable next questions or focus areas for the discussion.

Respond strictly as JSON matching this schema:
{
  "executiveSummary": "...",
  "keyPoints": ["..."],
  "decisions": ["..."],
  "actionItems": [
    { "title": "...", "priority": "High", "assignee": "...", "deadline": "...", "status": "Pending" }
  ],
  "sentiment": { "overall": "positive", "pulse": "Aligned and focused", "score": 88 },
  "suggestedTopics": ["..."]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/live-summary:", error);
    res.status(500).json({ error: error.message || "Failed to generate live summary" });
  }
});

// -------------------------------------------------------------
// BACKEND DATA PERSISTENCE FOR SILENT MEETING ASSISTANT
// -------------------------------------------------------------
interface BackendCommand {
  id: string;
  label: string;
  gesture: string;
  gestureDescription: string;
  icon: string;
  message: string;
  category: string;
  confidenceThreshold: number;
  cooldown: number;
  enabled: boolean;
  color?: string;
}

interface BackendHistoryItem {
  id: string;
  commandId?: string;
  message: string;
  gesture: string;
  confidence: number;
  timestamp: string;
  date: string;
  rawConfidence?: number;
}

let backendCommands: BackendCommand[] = [
  {
    id: 'cmd-ok',
    label: 'OK',
    gesture: 'ok_sign',
    gestureDescription: 'Thumb and index fingertips touch in a circle, other 3 fingers extended upward',
    icon: '👌',
    message: 'OK',
    category: 'Agreement',
    confidenceThreshold: 0.80,
    cooldown: 1.5,
    enabled: true,
    color: '#8B5CF6',
  },
  {
    id: 'cmd-question',
    label: 'I have a question',
    gesture: 'pointing_up',
    gestureDescription: 'Index finger pointing straight up, remaining fingers curled into palm',
    icon: '☝️',
    message: 'I have a question',
    category: 'Participation',
    confidenceThreshold: 0.80,
    cooldown: 2.0,
    enabled: true,
    color: '#3B82F6',
  },
  {
    id: 'cmd-repeat',
    label: 'Please repeat',
    gesture: 'open_palm',
    gestureDescription: 'Open palm facing camera with gentle wave or circular motion',
    icon: '🔄',
    message: 'Please repeat',
    category: 'Attention',
    confidenceThreshold: 0.80,
    cooldown: 2.0,
    enabled: true,
    color: '#06B6D4',
  },
  {
    id: 'cmd-thank-you',
    label: 'Thank you',
    gesture: 'folded_hands',
    gestureDescription: 'Both hands folded in front or single open hand placed near chest',
    icon: '🙏',
    message: 'Thank you',
    category: 'Politeness',
    confidenceThreshold: 0.80,
    cooldown: 2.0,
    enabled: true,
    color: '#A855F7',
  },
  {
    id: 'cmd-agree',
    label: 'I agree',
    gesture: 'thumbs_up',
    gestureDescription: 'Thumb pointing upward, other 4 fingers folded into a fist',
    icon: '👍',
    message: 'I agree',
    category: 'Agreement',
    confidenceThreshold: 0.80,
    cooldown: 1.5,
    enabled: true,
    color: '#10B981',
  },
  {
    id: 'cmd-disagree',
    label: 'I disagree',
    gesture: 'thumbs_down',
    gestureDescription: 'Thumb pointing straight downward with fingers folded',
    icon: '👎',
    message: 'I disagree',
    category: 'Disagreement',
    confidenceThreshold: 0.80,
    cooldown: 1.5,
    enabled: true,
    color: '#EF4444',
  },
];

let backendHistory: BackendHistoryItem[] = [
  {
    id: 'hist-1',
    commandId: 'cmd-ok',
    message: 'OK',
    gesture: 'ok_sign',
    confidence: 0.95,
    timestamp: '11:24:36 AM',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'hist-2',
    commandId: 'cmd-question',
    message: 'I have a question',
    gesture: 'pointing_up',
    confidence: 0.92,
    timestamp: '11:23:10 AM',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'hist-3',
    commandId: 'cmd-repeat',
    message: 'Please repeat',
    gesture: 'open_palm',
    confidence: 0.89,
    timestamp: '11:22:05 AM',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'hist-4',
    commandId: 'cmd-thank-you',
    message: 'Thank you',
    gesture: 'folded_hands',
    confidence: 0.94,
    timestamp: '11:21:47 AM',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'hist-5',
    commandId: 'cmd-agree',
    message: 'I agree',
    gesture: 'thumbs_up',
    confidence: 0.96,
    timestamp: '11:20:33 AM',
    date: new Date().toISOString().split('T')[0],
  },
];

let backendSettings = {
  cameraResolution: '720p',
  cameraMirror: true,
  showBoundingBox: true,
  showSkeleton: true,
  sensitivity: 'high',
  confidenceThreshold: 0.80,
  gestureCooldown: 1.5,
  theme: 'light',
  language: 'en',
  ttsEnabled: true,
  ttsRate: 1.0,
  soundEffects: true,
  vibrateOnMobile: true,
};

let sessionStats = {
  startTime: Date.now() - 3.7 * 3600 * 1000, // 3h 42m ago for initial realistic session
  totalDetections: 139,
  successfulCommands: 128,
  accuracy: 92,
  activeState: 'System Active',
};

// --- Commands Endpoints ---
app.get("/api/commands", (req: Request, res: Response) => {
  res.json({ commands: backendCommands });
});

app.post("/api/commands", (req: Request, res: Response) => {
  const { label, gesture, gestureDescription, icon, message, category, confidenceThreshold, cooldown } = req.body;
  if (!label || !message) {
    res.status(400).json({ error: "Label and message are required" });
    return;
  }
  const newCmd: BackendCommand = {
    id: `cmd-${Date.now()}`,
    label,
    gesture: gesture || 'custom',
    gestureDescription: gestureDescription || 'Custom gesture',
    icon: icon || '⚡',
    message,
    category: category || 'Custom',
    confidenceThreshold: confidenceThreshold || 0.80,
    cooldown: cooldown || 1.5,
    enabled: true,
    color: '#6366F1',
  };
  backendCommands.push(newCmd);
  res.status(201).json({ command: newCmd, commands: backendCommands });
});

app.put("/api/commands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendCommands.findIndex((c) => c.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Command not found" });
    return;
  }
  backendCommands[idx] = {
    ...backendCommands[idx],
    ...req.body,
  };
  res.json({ command: backendCommands[idx], commands: backendCommands });
});

app.delete("/api/commands/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  backendCommands = backendCommands.filter((c) => c.id !== id);
  res.json({ success: true, commands: backendCommands });
});

// --- History Endpoints ---
app.get("/api/history", (req: Request, res: Response) => {
  const { filter, query } = req.query;
  let items = [...backendHistory];

  if (query && typeof query === 'string') {
    const q = query.toLowerCase();
    items = items.filter((h) => h.message.toLowerCase().includes(q) || h.gesture.toLowerCase().includes(q));
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (filter === 'today') {
    items = items.filter((h) => h.date === todayStr);
  }

  res.json({ history: items, totalCount: items.length });
});

app.post("/api/history", (req: Request, res: Response) => {
  const { message, gesture, confidence, commandId } = req.body;
  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const newItem: BackendHistoryItem = {
    id: `hist-${Date.now()}`,
    commandId,
    message,
    gesture: gesture || 'detected_gesture',
    confidence: Number(confidence) || 0.90,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: new Date().toISOString().split('T')[0],
  };

  backendHistory.unshift(newItem);
  if (backendHistory.length > 200) {
    backendHistory = backendHistory.slice(0, 200);
  }

  // Update session stats
  sessionStats.totalDetections += 1;
  sessionStats.successfulCommands += 1;
  sessionStats.accuracy = Math.round((sessionStats.successfulCommands / sessionStats.totalDetections) * 100);

  res.status(201).json({ item: newItem, history: backendHistory, stats: sessionStats });
});

app.delete("/api/history", (req: Request, res: Response) => {
  backendHistory = [];
  res.json({ success: true, message: "History cleared" });
});

app.delete("/api/history/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  backendHistory = backendHistory.filter((h) => h.id !== id);
  res.json({ success: true, history: backendHistory });
});

// --- Settings Endpoints ---
app.get("/api/settings", (req: Request, res: Response) => {
  res.json({ settings: backendSettings });
});

app.post("/api/settings", (req: Request, res: Response) => {
  backendSettings = { ...backendSettings, ...req.body };
  res.json({ success: true, settings: backendSettings });
});

// --- Dynamic Stats Endpoints ---
app.get("/api/stats", (req: Request, res: Response) => {
  const sessionElapsedSec = Math.floor((Date.now() - sessionStats.startTime) / 1000);
  const hours = Math.floor(sessionElapsedSec / 3600);
  const minutes = Math.floor((sessionElapsedSec % 3600) / 60);

  res.json({
    accuracy: sessionStats.accuracy,
    commandsUsed: sessionStats.successfulCommands,
    totalDetections: sessionStats.totalDetections,
    sessionTimeString: `${hours}h ${minutes}m`,
    sessionSeconds: sessionElapsedSec,
    activeState: sessionStats.activeState,
  });
});

// --- Calibration Endpoint ---
let calibrationProfile = {
  calibratedAt: new Date().toISOString(),
  baselineConfidence: 0.85,
  lightingFactor: 1.0,
  handScale: 1.0,
  status: 'calibrated',
  gestureSamples: {} as Record<string, number>,
};

app.get("/api/calibration", (req: Request, res: Response) => {
  res.json({ calibration: calibrationProfile });
});

app.post("/api/calibration", (req: Request, res: Response) => {
  calibrationProfile = {
    ...calibrationProfile,
    ...req.body,
    calibratedAt: new Date().toISOString(),
    status: 'calibrated',
  };
  res.json({ success: true, calibration: calibrationProfile });
});

// -------------------------------------------------------------
// MY SCHEDULE BACKEND PERSISTENCE & AI TASK EXTRACTION PIPELINE
// -------------------------------------------------------------
interface BackendScheduleItem {
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

const SCHEDULE_FILE_PATH = path.join(process.cwd(), "data", "schedule.json");

function ensureDataDirectory() {
  const dir = path.dirname(SCHEDULE_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const defaultScheduleItems: BackendScheduleItem[] = [
  {
    id: 'sch-1',
    type: 'meeting',
    title: 'Team Meeting & Sprint Sync',
    description: 'Weekly alignment on sprint deliverables, blockages, and silent gesture protocol review.',
    date: getTodayString(),
    startTime: '09:00',
    endTime: '10:00',
    priority: 'high',
    reminder: '15m',
    status: 'completed',
    assignedTo: 'Team',
    sourceMeeting: 'Weekly Sprint Sync',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sch-2',
    type: 'task',
    title: 'Prepare project documentation',
    description: 'Compile the architecture diagrams and gesture API specification by end of week.',
    date: getTodayString(),
    startTime: '11:30',
    endTime: '13:00',
    priority: 'high',
    reminder: '30m',
    status: 'in-progress',
    assignedTo: 'Shubham',
    sourceMeeting: 'Team Meeting — Sept 18',
    originalStatement: 'Shubham, please prepare the project documentation by Friday.',
    isAiExtracted: true,
    confidence: 0.94,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sch-3',
    type: 'meeting',
    title: 'Client Discussion & UX Review',
    description: 'Walkthrough of live gesture transcription HUD and accessibility features.',
    date: getTodayString(),
    startTime: '14:00',
    endTime: '15:00',
    priority: 'medium',
    reminder: '15m',
    status: 'pending',
    assignedTo: 'Client Team',
    sourceMeeting: 'External Sync',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'sch-4',
    type: 'deadline',
    title: 'Submit Final Codebase & Assets',
    description: 'Merge pull requests and verify zero-regression build on Asia container.',
    date: getTodayString(),
    startTime: '16:30',
    endTime: '17:30',
    priority: 'high',
    reminder: '1h',
    status: 'pending',
    assignedTo: 'Engineering',
    sourceMeeting: 'Release Checklist',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let backendSchedule: BackendScheduleItem[] = (() => {
  try {
    ensureDataDirectory();
    if (fs.existsSync(SCHEDULE_FILE_PATH)) {
      const data = fs.readFileSync(SCHEDULE_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    fs.writeFileSync(SCHEDULE_FILE_PATH, JSON.stringify(defaultScheduleItems, null, 2));
    return defaultScheduleItems;
  } catch (err) {
    console.warn("Could not load schedule file, using defaults:", err);
    return defaultScheduleItems;
  }
})();

function saveScheduleToFile() {
  try {
    ensureDataDirectory();
    fs.writeFileSync(SCHEDULE_FILE_PATH, JSON.stringify(backendSchedule, null, 2));
  } catch (err) {
    console.error("Failed to save schedule to file:", err);
  }
}

// GET /api/schedule
app.get("/api/schedule", (req: Request, res: Response) => {
  const { date, status, priority } = req.query;
  let items = [...backendSchedule];

  if (date && typeof date === 'string') {
    items = items.filter((item) => item.date === date);
  }
  if (status && typeof status === 'string') {
    items = items.filter((item) => item.status === status);
  }
  if (priority && typeof priority === 'string') {
    items = items.filter((item) => item.priority === priority);
  }

  // Sort by date then startTime
  items.sort((a, b) => {
    const dComp = a.date.localeCompare(b.date);
    if (dComp !== 0) return dComp;
    return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
  });

  res.json({ schedule: items, count: items.length });
});

// POST /api/schedule
app.post("/api/schedule", (req: Request, res: Response) => {
  const {
    type,
    title,
    description,
    date,
    startTime,
    endTime,
    priority,
    reminder,
    status,
    assignedTo,
    sourceMeeting,
    originalStatement,
    isAiExtracted,
    confidence,
  } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const newItem: BackendScheduleItem = {
    id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: type || 'task',
    title: title.trim(),
    description: description || '',
    date: date || getTodayString(),
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
    priority: priority || 'medium',
    reminder: reminder || '15m',
    status: status || 'pending',
    assignedTo: assignedTo || 'Self',
    sourceMeeting: sourceMeeting || '',
    originalStatement: originalStatement || '',
    isAiExtracted: Boolean(isAiExtracted),
    confidence: confidence ? Number(confidence) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  backendSchedule.push(newItem);
  saveScheduleToFile();

  res.status(201).json({ item: newItem, schedule: backendSchedule });
});

// PUT /api/schedule/:id
app.put("/api/schedule/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = backendSchedule.findIndex((s) => s.id === id);
  if (idx === -1) {
    res.status(404).json({ error: "Schedule item not found" });
    return;
  }

  backendSchedule[idx] = {
    ...backendSchedule[idx],
    ...req.body,
    id, // protect immutable id
    updatedAt: new Date().toISOString(),
  };

  saveScheduleToFile();
  res.json({ item: backendSchedule[idx], schedule: backendSchedule });
});

// DELETE /api/schedule/:id
app.delete("/api/schedule/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const prevLen = backendSchedule.length;
  backendSchedule = backendSchedule.filter((s) => s.id !== id);

  if (backendSchedule.length === prevLen) {
    res.status(404).json({ error: "Schedule item not found" });
    return;
  }

  saveScheduleToFile();
  res.json({ success: true, schedule: backendSchedule });
});

// POST /api/schedule/extract-tasks
// Implements the AI Task Extraction Pipeline with high precision safety rules
app.post("/api/schedule/extract-tasks", async (req: Request, res: Response) => {
  try {
    const { transcript, currentUserName, meetingContext } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      res.status(400).json({ error: "Transcript text is required" });
      return;
    }

    const userName = (currentUserName || "Shubham").trim();
    const context = meetingContext || "Engineering & Team Sync";

    // Fallback safety heuristic extractor if no API key is set
    if (!process.env.GEMINI_API_KEY) {
      const actionableRegex = /(?:please|can you|could you|need to|must|will|assigned to)\s+([^.\n]+)/i;
      const match = transcript.match(actionableRegex);

      if (!match) {
        res.json({
          extractedTasks: [],
          message: "No actionable task detected.",
        });
        return;
      }

      // Check if current user is named
      const mentionsUser =
        transcript.toLowerCase().includes(userName.toLowerCase()) ||
        transcript.toLowerCase().includes("you") ||
        transcript.toLowerCase().includes("team");

      const deadlineMatch = transcript.match(/(?:by|before|on|due|until)\s+([A-Za-z0-9\s]+?)(?:[.,\n]|$)/i);
      const deadline = deadlineMatch ? deadlineMatch[1].trim() : "Friday";

      const rawTask = match[1].replace(/^(prepare|complete|submit|send|review|create)\s+/i, (m) => m);

      res.json({
        extractedTasks: [
          {
            task: rawTask.charAt(0).toUpperCase() + rawTask.slice(1),
            assignedTo: mentionsUser ? userName : "Team Member",
            deadline,
            priority: "high",
            source: context,
            originalStatement: transcript,
            confidence: 0.92,
            isForCurrentUser: mentionsUser,
          },
        ],
      });
      return;
    }

    const prompt = `You are a high-precision corporate meeting task extractor.
Meeting Context: "${context}"
Current Active User: "${userName}"

Analyze this transcript sentence or conversation segment:
"${transcript}"

CRITICAL SAFETY RULES:
1. Only identify sentences that contain an ACTUAL, ACTIONABLE instruction or commitment (e.g. "Shubham, please prepare the project documentation by Friday", "Can you send the financial report by tomorrow?").
2. Casual remarks, pleasantries, or broad chatter MUST NOT be marked as tasks (e.g. "Great presentation today", "Nice work", "Hello everyone"). Return empty array [] for these.
3. Determine if the task is assigned to "${userName}" or if "${userName}" is directly addressed.
4. Extract the clean task title, assigned person, deadline, priority ("low", "medium", "high"), and confidence (0.0 to 1.0).

Respond STRICTLY with a JSON array:
[
  {
    "task": "Prepare project documentation",
    "assignedTo": "${userName}",
    "deadline": "Friday",
    "priority": "high",
    "source": "${context}",
    "originalStatement": "${transcript.replace(/"/g, '\\"')}",
    "confidence": 0.94,
    "isForCurrentUser": true
  }
]
If no actionable task is present, return [].`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    res.json({
      extractedTasks: Array.isArray(parsed) ? parsed : [],
      currentUserName: userName,
    });
  } catch (error: any) {
    console.error("Error in /api/schedule/extract-tasks:", error);
    res.status(500).json({ error: error.message || "Failed to extract tasks" });
  }
});

// Endpoint to fetch python files directly
app.get("/api/python-code", (req: Request, res: Response) => {
  try {
    const dir = path.join(process.cwd(), "silent_meeting_assistant");
    const files: Record<string, string> = {};

    if (fs.existsSync(dir)) {
      const fileNames = fs.readdirSync(dir);
      for (const name of fileNames) {
        const fullPath = path.join(dir, name);
        if (fs.statSync(fullPath).isFile()) {
          files[name] = fs.readFileSync(fullPath, "utf-8");
        }
      }
    }

    res.json({ files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Silent Meeting Assistant] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
