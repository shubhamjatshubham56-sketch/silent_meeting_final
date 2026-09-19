import React, { useState, useEffect, useRef } from 'react';
import { MeetingNavbar } from './MeetingNavbar';
import { MeetingSidebar, SidebarPage } from './MeetingSidebar';
import { CameraFeedCard } from './CameraFeedCard';
import { RecognizedTextCard, TranslationItem } from './RecognizedTextCard';
import { QuickCommandsRow, QuickCommandItem } from './QuickCommandsRow';
import { CommandManagementModal } from './CommandManagementModal';
import { CalibrationModal } from './CalibrationModal';
import { HistoryModal } from './HistoryModal';
import { SettingsModal, AppSettingsState } from './SettingsModal';
import { CommandDetailModal } from './CommandDetailModal';
import { SchedulePage } from './SchedulePage';
import {
  getHandLandmarker,
  classifyHandLandmarks,
  drawLandmarkConnections,
  drawHandBoundingBox,
} from '../utils/handDetection';
import confetti from 'canvas-confetti';
import { Check, Sparkles, X } from 'lucide-react';

const INITIAL_DEFAULT_COMMANDS: QuickCommandItem[] = [
  {
    id: 'cmd-ok',
    label: 'OK',
    gesture: 'ok_sign',
    gestureDescription: 'Thumb and index fingertips touch in a circle, other 3 fingers extended upward',
    icon: '👌',
    message: 'OK',
    color: '#8B5CF6',
    enabled: true,
    confidenceThreshold: 0.80,
    cooldown: 1.5,
  },
  {
    id: 'cmd-question',
    label: 'I have a question',
    gesture: 'pointing_up',
    gestureDescription: 'Index finger pointing straight up, remaining fingers curled into palm',
    icon: '☝️',
    message: 'I have a question',
    color: '#3B82F6',
    enabled: true,
    confidenceThreshold: 0.80,
    cooldown: 2.0,
  },
  {
    id: 'cmd-repeat',
    label: 'Please repeat',
    gesture: 'open_palm',
    gestureDescription: 'Open palm facing camera with gentle wave or circular motion',
    icon: '🔄',
    message: 'Please repeat',
    color: '#06B6D4',
    enabled: true,
    confidenceThreshold: 0.80,
    cooldown: 2.0,
  },
  {
    id: 'cmd-thank-you',
    label: 'Thank you',
    gesture: 'folded_hands',
    gestureDescription: 'Both hands folded in front or single open hand placed near chest',
    icon: '🙏',
    message: 'Thank you',
    color: '#A855F7',
    enabled: true,
    confidenceThreshold: 0.80,
    cooldown: 2.0,
  },
  {
    id: 'cmd-agree',
    label: 'I agree',
    gesture: 'thumbs_up',
    gestureDescription: 'Thumb pointing upward, other 4 fingers folded into a fist',
    icon: '👍',
    message: 'I agree',
    color: '#10B981',
    enabled: true,
    confidenceThreshold: 0.80,
    cooldown: 1.5,
  },
  {
    id: 'cmd-disagree',
    label: 'I disagree',
    gesture: 'thumbs_down',
    gestureDescription: 'Thumb pointing straight downward with fingers folded',
    icon: '👎',
    message: 'I disagree',
    color: '#EF4444',
    enabled: true,
    confidenceThreshold: 0.80,
    cooldown: 1.5,
  },
];

const INITIAL_HISTORY: TranslationItem[] = [
  {
    id: 'hist-1',
    message: 'OK',
    gesture: 'ok_sign',
    confidence: 0.95,
    timestamp: '11:24:36 AM',
  },
  {
    id: 'hist-2',
    message: 'I have a question',
    gesture: 'pointing_up',
    confidence: 0.92,
    timestamp: '11:23:10 AM',
  },
  {
    id: 'hist-3',
    message: 'Please repeat',
    gesture: 'open_palm',
    confidence: 0.89,
    timestamp: '11:22:05 AM',
  },
  {
    id: 'hist-4',
    message: 'Thank you',
    gesture: 'folded_hands',
    confidence: 0.94,
    timestamp: '11:21:47 AM',
  },
  {
    id: 'hist-5',
    message: 'I agree',
    gesture: 'thumbs_up',
    confidence: 0.96,
    timestamp: '11:20:33 AM',
  },
];

const DEFAULT_SETTINGS: AppSettingsState = {
  cameraResolution: '720p',
  cameraMirror: true,
  showBoundingBox: true,
  showSkeleton: true,
  sensitivity: 'high',
  confidenceThreshold: 0.80,
  gestureCooldown: 1.5,
  theme: 'light',
  language: 'English',
  ttsEnabled: true,
  ttsRate: 1.0,
  soundEffects: true,
  vibrateOnMobile: true,
  developerMode: false,
};

interface SilentMeetingDashboardProps {
  onOpenProfile?: () => void;
  userPhoto?: string | null;
  userName?: string;
}

export const SilentMeetingDashboard: React.FC<SilentMeetingDashboardProps> = ({
  onOpenProfile,
  userPhoto,
  userName = 'Shrim Yadav',
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'live' | 'commands' | 'history' | 'settings'>('dashboard');
  const [activeSidebarPage, setActiveSidebarPage] = useState<SidebarPage>('dashboard');

  // Modals state
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedCommandDetail, setSelectedCommandDetail] = useState<QuickCommandItem | null>(null);

  // Commands state (persistent)
  const [commands, setCommands] = useState<QuickCommandItem[]>(() => {
    const saved = localStorage.getItem('silent_meeting_commands');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DEFAULT_COMMANDS;
  });

  useEffect(() => {
    localStorage.setItem('silent_meeting_commands', JSON.stringify(commands));
  }, [commands]);

  // Fetch backend commands on mount if available
  useEffect(() => {
    fetch('/api/commands')
      .then((r) => r.json())
      .then((data) => {
        if (data.commands && Array.isArray(data.commands) && data.commands.length > 0) {
          setCommands(data.commands);
        }
      })
      .catch(() => {});
  }, []);

  // History state (persistent)
  const [history, setHistory] = useState<TranslationItem[]>(() => {
    const saved = localStorage.getItem('silent_meeting_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('silent_meeting_history', JSON.stringify(history));
  }, [history]);

  // Settings state (persistent)
  const [settings, setSettings] = useState<AppSettingsState>(() => {
    const saved = localStorage.getItem('silent_meeting_app_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('silent_meeting_app_settings', JSON.stringify(settings));
  }, [settings]);

  // Current live recognition output state
  const [currentText, setCurrentText] = useState<string>('OK');
  const [currentConfidence, setCurrentConfidence] = useState<number>(0.95);
  const [currentTimestamp, setCurrentTimestamp] = useState<string>('11:24:36 AM');
  const [activeCommandId, setActiveCommandId] = useState<string | null>('cmd-ok');

  // Dynamic Session Statistics
  const [sessionStats, setSessionStats] = useState({
    accuracy: 92,
    commandsUsed: 128,
    sessionTimeStr: '3h 42m',
  });

  const sessionStartTimeRef = useRef<number>(Date.now() - 3.7 * 3600 * 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      const hrs = Math.floor(elapsedSec / 3600);
      const mins = Math.floor((elapsedSec % 3600) / 60);
      setSessionStats((prev) => ({
        ...prev,
        sessionTimeStr: `${hrs}h ${mins}m`,
      }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Camera & Detection Pipeline State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<
    'connected' | 'initializing' | 'paused' | 'disconnected' | 'error'
  >('connected');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedGesture, setDetectedGesture] = useState<string | null>('OK');
  const [detectedConfidence, setDetectedConfidence] = useState<number>(0.95);
  const [currentLandmarks, setCurrentLandmarks] = useState<any[] | null>(null);
  const [fps, setFps] = useState<number>(30);
  const [gestureProbabilities, setGestureProbabilities] = useState<Record<string, number> | undefined>(undefined);

  // Subtle Toast Notification state
  const [toastNotice, setToastNotice] = useState<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  } | null>(null);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    setToastNotice({ id: Date.now(), title, message, type });
    setTimeout(() => {
      setToastNotice(null);
    }, 4000);
  };

  const animationFrameRef = useRef<number | null>(null);
  const lastTriggerTimeRef = useRef<number>(0);
  const consecutiveMatchesRef = useRef<{ gesture: string; count: number }>({
    gesture: '',
    count: 0,
  });

  // Audio Chime synthesizer
  const playChime = () => {
    if (!settings.soundEffects) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  // Text-to-Speech synthesizer
  const speakText = (text: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings.ttsRate || 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS speech synthesis error:', err);
    }
  };

  // Dispatch a recognized command
  const dispatchRecognizedCommand = (matchedCmd: QuickCommandItem, conf: number) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setCurrentText(matchedCmd.message);
    setCurrentConfidence(conf);
    setCurrentTimestamp(timeStr);
    setActiveCommandId(matchedCmd.id);

    // Audio & TTS
    playChime();
    if (settings.ttsEnabled) {
      speakText(matchedCmd.message);
    }

    // Subtle celebration for high confidence
    if (conf >= 0.94) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981'],
      });
    }

    // Add to history
    const newHistItem: TranslationItem = {
      id: `hist-${Date.now()}`,
      message: matchedCmd.message,
      gesture: matchedCmd.gesture,
      confidence: conf,
      timestamp: timeStr,
    };

    setHistory((prev) => [newHistItem, ...prev]);

    // Send to backend persistence
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHistItem),
    }).catch(() => {});

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      commandsUsed: prev.commandsUsed + 1,
    }));
  };

  // Start Real Webcam Feed
  const startCamera = async () => {
    setCameraError(null);
    setCameraStatus('initializing');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support webcam access.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: settings.cameraResolution === '1080p' ? 1920 : 1280 },
          height: { ideal: settings.cameraResolution === '1080p' ? 1080 : 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsPaused(false);
          setCameraStatus('connected');
          initDetectionLoop();
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let msg = 'Unable to connect to camera. Please grant camera permission.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera found. Please connect a webcam device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is already in use by another application.';
      }
      setCameraError(msg);
      setCameraStatus('error');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraStatus('disconnected');
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      setCameraStatus(next ? 'paused' : 'connected');
      return next;
    });
  };

  // Start camera automatically on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Main Hand Detection & Canvas Drawing Loop
  const initDetectionLoop = async () => {
    try {
      const landmarker = await getHandLandmarker();

      let lastFrameTime = performance.now();
      let frameCounter = 0;

      const loop = () => {
        const now = performance.now();
        frameCounter++;
        if (now - lastFrameTime >= 1000) {
          setFps(frameCounter);
          frameCounter = 0;
          lastFrameTime = now;
        }

        if (
          videoRef.current &&
          canvasRef.current &&
          videoRef.current.readyState >= 2 &&
          !isPaused
        ) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
          }

          if (ctx) {
            // Draw video frame to canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (landmarker) {
              const detectionResult = landmarker.detectForVideo(video, now);

              if (detectionResult.landmarks && detectionResult.landmarks.length > 0) {
                const handLandmarks = detectionResult.landmarks[0];
                setCurrentLandmarks(handLandmarks);

                // 1. Draw Skeleton Landmarks if enabled
                if (settings.showSkeleton) {
                  drawLandmarkConnections(ctx, handLandmarks, canvas.width, canvas.height);
                }

                // 2. Classify gesture
                const classification = classifyHandLandmarks(handLandmarks, settings.confidenceThreshold);

                if (classification) {
                  const { gesture, confidence, predictions } = classification;
                  setDetectedGesture(gesture);
                  setDetectedConfidence(confidence);

                  if (predictions && predictions.length > 0) {
                    const probMap: Record<string, number> = {};
                    predictions.forEach((p) => {
                      probMap[p.gesture] = p.confidence;
                    });
                    setGestureProbabilities(probMap);
                  }

                  // 3. Find matching command
                  const matchedCmd = commands.find(
                    (c) => c.enabled && (c.gesture === gesture || c.id.includes(gesture))
                  );

                  // 4. Draw Purple Bounding Box matching reference image
                  if (settings.showBoundingBox) {
                    drawHandBoundingBox(
                      ctx,
                      handLandmarks,
                      canvas.width,
                      canvas.height,
                      matchedCmd?.label || gesture,
                      confidence
                    );
                  }

                  // 5. Check threshold & cooldown for triggering
                  const threshold = matchedCmd?.confidenceThreshold || settings.confidenceThreshold;
                  const cooldownMs = (matchedCmd?.cooldown || settings.gestureCooldown) * 1000;

                  if (confidence >= threshold) {
                    if (consecutiveMatchesRef.current.gesture === gesture) {
                      consecutiveMatchesRef.current.count += 1;
                    } else {
                      consecutiveMatchesRef.current = { gesture, count: 1 };
                    }

                    // Require 2 consecutive steady frames to eliminate false positives
                    if (consecutiveMatchesRef.current.count >= 2) {
                      if (now - lastTriggerTimeRef.current > cooldownMs && matchedCmd) {
                        lastTriggerTimeRef.current = now;
                        dispatchRecognizedCommand(matchedCmd, confidence);
                      }
                    }
                  }
                } else {
                  consecutiveMatchesRef.current = { gesture: '', count: 0 };
                  setDetectedGesture(null);
                }
              } else {
                setCurrentLandmarks(null);
                setDetectedGesture(null);
                consecutiveMatchesRef.current = { gesture: '', count: 0 };
              }
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(loop);
      };

      animationFrameRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.warn('MediaPipe initialization error:', err);
    }
  };

  // History Actions
  const handleClearAllHistory = () => {
    setHistory([]);
    fetch('/api/history', { method: 'DELETE' }).catch(() => {});
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    fetch(`/api/history/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Nav actions
  const handleSelectNavTab = (tab: 'dashboard' | 'live' | 'commands' | 'history' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'commands') {
      setIsCommandModalOpen(true);
    } else if (tab === 'history') {
      setIsHistoryModalOpen(true);
    } else if (tab === 'settings') {
      setIsSettingsModalOpen(true);
    }
  };

  const handleSelectSidebarPage = (page: SidebarPage) => {
    setActiveSidebarPage(page);
    if (page === 'commands') {
      setIsCommandModalOpen(true);
    } else if (page === 'history') {
      setIsHistoryModalOpen(true);
    } else if (page === 'settings') {
      setIsSettingsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP NAVBAR matching Reference Design */}
      <MeetingNavbar
        activeTab={activeTab}
        onSelectTab={handleSelectNavTab}
        cameraStatus={cameraStatus}
        isTracking={!isPaused && isCameraActive}
        userInitials="SA"
        userName={userName}
        userPhoto={userPhoto}
        onOpenProfile={onOpenProfile}
      />

      {/* 2. MAIN HORIZONTAL LAYOUT (Sidebar + Content Stage) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <MeetingSidebar
          activePage={activeSidebarPage}
          onSelectPage={handleSelectSidebarPage}
          stats={sessionStats}
        />

        {/* Center Dashboard Main Area or Schedule Page */}
        {activeSidebarPage === 'my-schedule' ? (
          <main className="flex-1 flex flex-col overflow-y-auto bg-[#F8FAFC]">
            <SchedulePage
              currentUserName={userName}
              onToast={(title, msg, type) => {
                showToast(title, msg, type);
              }}
            />
          </main>
        ) : (
          <main className="flex-1 flex flex-col p-4 sm:p-5 lg:p-6 overflow-y-auto gap-4 sm:gap-5 bg-[#F8FAFC]">
            {/* TOP SECTION: Centerpiece Live Camera Card (Left) + Recognized Text Card (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 flex-1 min-h-[500px] lg:min-h-[540px]">
              {/* Camera Feed Card (Occupies 7/12 = 58-60% width and 55-65% vertical space) */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-w-0 h-full">
                <CameraFeedCard
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  isCameraActive={isCameraActive}
                  onToggleCamera={toggleCamera}
                  isPaused={isPaused}
                  onTogglePause={togglePause}
                  onOpenCalibration={() => setIsCalibrationModalOpen(true)}
                  detectedGesture={detectedGesture}
                  detectedConfidence={detectedConfidence}
                  landmarks={currentLandmarks}
                  cameraError={cameraError}
                  onRetryCamera={startCamera}
                  fps={fps}
                  showSkeleton={settings.showSkeleton}
                  showBoundingBox={settings.showBoundingBox}
                  developerMode={settings.developerMode}
                  gestureProbabilities={gestureProbabilities}
                />
              </div>

              {/* Recognized Text & Recent Translations Card (Occupies 5/12 = 40-42% width) */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-w-0 h-full">
                <RecognizedTextCard
                  currentText={currentText}
                  currentConfidence={currentConfidence}
                  currentTimestamp={currentTimestamp}
                  recentTranslations={history}
                  onClearAll={handleClearAllHistory}
                  onDeleteItem={handleDeleteHistoryItem}
                  onSpeakText={speakText}
                  onCopyText={() => {}}
                  selectedLanguage={settings.language}
                  onSelectLanguage={(lang) => setSettings({ ...settings, language: lang })}
                />
              </div>
            </div>

            {/* BOTTOM SECTION: Quick Commands Row */}
            <div className="flex-shrink-0 w-full">
              <QuickCommandsRow
                commands={commands}
                activeCommandId={activeCommandId}
                onSelectCommand={(cmd) => setSelectedCommandDetail(cmd)}
                onEditCommands={() => setIsCommandModalOpen(true)}
              />
            </div>
          </main>
        )}
      </div>

      {/* 3. FUNCTIONAL MODALS & WORKFLOWS */}
      {/* Command Management Modal (Add, Edit, Delete, Enable/Disable) */}
      <CommandManagementModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        commands={commands}
        onSaveCommands={(updated) => setCommands(updated)}
        onAddCommand={(newCmd) => {
          const created: QuickCommandItem = {
            ...newCmd,
            id: `cmd-${Date.now()}`,
          };
          setCommands((prev) => [...prev, created]);
          fetch('/api/commands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(created),
          }).catch(() => {});
        }}
        onDeleteCommand={(id) => {
          setCommands((prev) => prev.filter((c) => c.id !== id));
          fetch(`/api/commands/${id}`, { method: 'DELETE' }).catch(() => {});
        }}
        onUpdateCommand={(updated) => {
          setCommands((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          fetch(`/api/commands/${updated.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(() => {});
        }}
      />

      {/* Calibration Wizard Modal */}
      <CalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
        detectedConfidence={detectedConfidence}
        landmarksDetected={Boolean(currentLandmarks)}
        onSaveCalibration={(profile) => {
          fetch('/api/calibration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile),
          }).catch(() => {});
        }}
      />

      {/* History Log Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={handleClearAllHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(updated) => {
          setSettings(updated);
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          }).catch(() => {});
        }}
        onResetDefaults={() => {
          setSettings(DEFAULT_SETTINGS);
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(DEFAULT_SETTINGS),
          }).catch(() => {});
        }}
      />

      {/* Command Details & Guide Modal */}
      <CommandDetailModal
        command={selectedCommandDetail}
        onClose={() => setSelectedCommandDetail(null)}
        onTestCommand={(cmd) => {
          dispatchRecognizedCommand(cmd, 0.96);
        }}
      />

      {/* Floating Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700/80">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              toastNotice.type === 'error'
                ? 'bg-rose-500/20 text-rose-400'
                : toastNotice.type === 'warning'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {toastNotice.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          </div>
          <div>
            <h5 className="text-xs font-bold text-white tracking-tight">{toastNotice.title}</h5>
            <p className="text-[11px] text-slate-300">{toastNotice.message}</p>
          </div>
          <button
            onClick={() => setToastNotice(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
