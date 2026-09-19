export interface GestureMapping {
  id: string;
  label: string;
  description: string;
  text: string;
  category: 'Agreement' | 'Attention' | 'Participation' | 'Direction' | 'Status' | 'Macro' | 'Custom';
  enabled: boolean;
  cooldown: number; // in seconds
  badgeColor: string;
  iconName: string;
  samplesCount?: number;
  stabilityScore?: number;
}

export interface UserProfile {
  name: string;
  job_title: string;
  status: string;
  team: string;
  organization?: string;
  additional_info?: string;
  template: string;
  master_gesture: string;
}

export interface DetectedGestureEvent {
  gestureId: string;
  label: string;
  message: string;
  confidence: number;
  timestamp: number;
  stabilizing?: boolean;
}

export type MeetingPlatform = 'zoom' | 'meet' | 'teams' | 'webex';

export type AppTheme = 'dark' | 'high-contrast-light';

export interface OverlayConfig {
  x: number;
  y: number;
  opacity: number;
  isAlwaysOnTop: boolean;
  isTracking: boolean;
  showSkeleton: boolean;
  highContrastMode: boolean;
  audioFeedback: boolean;
}

export interface MeetingScheduleItem {
  id: string;
  title: string;
  time: string;
  period: 'today' | 'this_week' | 'upcoming';
  dateStr: string;
  platform: MeetingPlatform;
  topic: string;
  participantsCount: number;
  isCurrent?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  time: string;
  status: 'In Progress' | 'Today' | 'Upcoming' | 'Completed';
  completed: boolean;
}

export interface PersonalTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Today' | 'Upcoming' | 'Completed';
  category?: string;
  notes?: string;
  sourceMeeting: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

export interface CustomGesture {
  id: string;
  name: string;
  intent: string;
  message: string;
  classification_mode: 'landmark_template';
  threshold: number;
  hand_policy: 'either' | 'right' | 'left';
  enabled: boolean;
  template: {
    feature_vector: number[];
  };
}

export interface GestureDiagnostics {
  candidate: string | null;
  candidateLabel: string;
  rawConfidence: number;
  smoothedConfidence: number;
  landmarkVerification: 'PASS' | 'FAIL' | 'IDLE';
  temporalStability: 'PASS' | 'STABILIZING' | 'FAIL' | 'IDLE';
  ambiguityScore: 'LOW' | 'MEDIUM' | 'HIGH';
  state: 'NEUTRAL' | 'DETECTING' | 'CANDIDATE' | 'CONFIRMED' | 'DISPLAYING' | 'COOLDOWN' | 'UNCERTAIN';
  holdProgress: number; // 0 - 100%
  fingerStates: {
    thumb: boolean;
    index: boolean;
    middle: boolean;
    ring: boolean;
    pinky: boolean;
  };
  fps: number;
  latencyMs: number;
}

export interface MessageSettingsState {
  duration: number; // in seconds
  position: 'bottom-center' | 'top-center' | 'bottom-left' | 'bottom-right';
  fontSize: 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
}

export interface MeetingIntelligenceEvent {
  id: string;
  timestamp: string;
  type: 'agreement' | 'question' | 'decision' | 'action_item';
  text: string;
  speaker?: string;
  completed?: boolean;
}

export interface CameraSettings {
  resolution: '720p' | '1080p' | '4k';
  fps: number;
  mirror: boolean;
  showLandmarks: boolean;
  stabilizationThreshold: number;
  virtualCamDriver: 'DirectShow' | 'v4l2loopback' | 'OBS Virtual Camera' | 'Built-in WebRTC';
}

export interface TranscriptRecord {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  type: 'speech' | 'gesture' | 'macro';
  isFinal?: boolean;
  sentiment?: 'Positive' | 'Neutral' | 'Attention' | string;
}

export interface LiveMeetingSummary {
  executiveSummary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    assignee: string;
    deadline: string;
    status: 'Pending' | 'In Progress' | 'Completed';
  }>;
  sentiment: {
    overall?: 'positive' | 'neutral' | 'attention_needed';
    pulse: string;
    score: number;
  };
  suggestedTopics: string[];
  generatedAt: string;
  transcriptCount: number;
}

export interface AuthUserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

