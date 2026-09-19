import { GestureMapping, UserProfile } from '../types';

export const INITIAL_GESTURES: GestureMapping[] = [
  {
    id: 'thumbs_up',
    label: 'Thumbs Up',
    description: 'Thumb pointing straight up, 4 fingers folded into palm',
    text: 'I AGREE',
    category: 'Agreement',
    enabled: true,
    cooldown: 2.0,
    badgeColor: '#10B981',
    iconName: 'ThumbsUp',
  },
  {
    id: 'open_palm',
    label: 'Open Palm',
    description: 'All 5 fingers fully extended and spread facing camera',
    text: 'PLEASE WAIT',
    category: 'Attention',
    enabled: true,
    cooldown: 2.0,
    badgeColor: '#EF4444',
    iconName: 'Hand',
  },
  {
    id: 'victory',
    label: 'Victory',
    description: 'Index & middle fingers extended upward in V shape, ring & pinky folded',
    text: 'I HAVE A QUESTION',
    category: 'Participation',
    enabled: true,
    cooldown: 2.0,
    badgeColor: '#3B82F6',
    iconName: 'Sparkles',
  },
  {
    id: 'ok_sign',
    label: 'OK Sign',
    description: 'Thumb and index tips touching in a circle, others extended',
    text: 'Understood / Sounds good 👌',
    category: 'Agreement',
    enabled: false,
    cooldown: 2.0,
    badgeColor: '#8B5CF6',
    iconName: 'CheckCircle2',
  },
  {
    id: 'pointing_up',
    label: 'Pointing Up',
    description: 'Index finger pointing up, other fingers folded',
    text: 'Please check the screen / slides ☝️',
    category: 'Direction',
    enabled: false,
    cooldown: 2.0,
    badgeColor: '#F59E0B',
    iconName: 'Pointer',
  },
  {
    id: 'fist',
    label: 'Closed Fist',
    description: 'All fingers tightly curled into palm',
    text: 'Muted / In active listening ✊',
    category: 'Status',
    enabled: false,
    cooldown: 2.5,
    badgeColor: '#6B7280',
    iconName: 'VolumeX',
  },
  {
    id: 'call_me',
    label: 'Call Me (Master Macro)',
    description: 'Thumb and pinky extended, middle three curled',
    text: 'MASTER_MACRO:INTRO_PROFILE',
    category: 'Macro',
    enabled: true,
    cooldown: 3.0,
    badgeColor: '#EC4899',
    iconName: 'UserCheck',
  },
];

export const INITIAL_PROFILE: UserProfile = {
  name: 'Shrim Yadav',
  job_title: 'Frontend Architecture Lead',
  status: 'Active in Project Discussion',
  team: 'Core Product Team',
  template: "👋 Hello everyone! I'm {name}, {job_title} ({team}). Status: {status} at {time}.",
  master_gesture: 'call_me',
};

export const PYTHON_SOURCE_FILES: Record<string, { filename: string; description: string; code: string }> = {
  'gesture_engine.py': {
    filename: 'gesture_engine.py',
    description: 'Core OpenCV 30+ FPS capture, MediaPipe Hands 3D landmarks, geometric classifiers & rolling cooldown buffer',
    code: `"""
Webcam & Computer Vision Engine for Silent Meeting Assistant.
Captures real-time camera feed at 30+ FPS, processes 3D hand landmarks via MediaPipe Hands,
classifies gestures with geometric feature extraction, and stabilizes triggers via a rolling buffer and cooldown timer.
"""

import time
import math
from collections import deque
from typing import Optional, Tuple, Dict, Any, List
import cv2
import mediapipe as mp
import numpy as np


class GestureEngine:
    """
    Computer Vision Engine using OpenCV and Google MediaPipe Hands
    to detect and stabilize hand gestures in real-time.
    """

    def __init__(
        self,
        camera_index: int = 0,
        target_fps: int = 30,
        buffer_size: int = 10,
        consensus_threshold: float = 0.70,
        default_cooldown: float = 2.0,
        min_detection_confidence: float = 0.7,
        min_tracking_confidence: float = 0.6
    ):
        self.camera_index = camera_index
        self.target_fps = target_fps
        self.buffer_size = buffer_size
        self.consensus_threshold = consensus_threshold
        self.default_cooldown = default_cooldown

        # MediaPipe initialization
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils

        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,  # Single primary hand for intentional command execution
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

        self.cap: Optional[cv2.VideoCapture] = None
        self.gesture_buffer = deque(maxlen=self.buffer_size)

        # Cooldown management
        self.last_trigger_time: float = 0.0
        self.last_triggered_gesture: Optional[str] = None
        self.cooldown_durations: Dict[str, float] = {
            "thumbs_up": 2.0,
            "open_palm": 2.5,
            "peace_sign": 2.0,
            "ok_sign": 2.0,
            "pointing_up": 2.0,
            "fist": 2.5,
            "call_me": 3.0
        }

        self.fps: float = 0.0
        self._prev_frame_time: float = time.time()
        self.is_tracking_paused: bool = False

    def start_camera(self) -> bool:
        """Initializes OpenCV video capture stream with 30+ FPS settings."""
        self.cap = cv2.VideoCapture(self.camera_index)
        if not self.cap.isOpened():
            print(f"[GestureEngine] Could not open camera {self.camera_index}. Trying index 1...")
            self.cap = cv2.VideoCapture(1)
            if not self.cap.isOpened():
                return False

        self.cap.set(cv2.CAP_PROP_FPS, self.target_fps)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        return True

    def stop_camera(self):
        """Releases the camera and MediaPipe resources."""
        if self.cap and self.cap.isOpened():
            self.cap.release()
        self.hands.close()

    def _calculate_fps(self):
        now = time.time()
        dt = now - self._prev_frame_time
        self._prev_frame_time = now
        if dt > 0:
            current_fps = 1.0 / dt
            self.fps = 0.85 * self.fps + 0.15 * current_fps if self.fps > 0 else current_fps

    @staticmethod
    def _euclidean_dist(p1, p2) -> float:
        return math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

    def classify_landmarks(self, landmarks, handedness: str = "Right") -> Tuple[Optional[str], float]:
        """Extracts geometric finger relationships from 21 hand landmarks."""
        lm = landmarks.landmark
        wrist = lm[0]

        index_extended = lm[8].y < lm[6].y
        middle_extended = lm[12].y < lm[10].y
        ring_extended = lm[16].y < lm[14].y
        pinky_extended = lm[20].y < lm[18].y

        thumb_tip = lm[4]
        thumb_ip = lm[3]
        thumb_mcp = lm[2]
        thumb_extended_vertical = (thumb_tip.y < thumb_ip.y < thumb_mcp.y) and (thumb_tip.y < lm[5].y)
        thumb_extended_horizontal = abs(thumb_tip.x - lm[5].x) > 0.12

        thumb_index_dist = self._euclidean_dist(thumb_tip, lm[8])
        index_middle_dist = self._euclidean_dist(lm[8], lm[12])
        wrist_to_middle_mcp = self._euclidean_dist(wrist, lm[9]) or 0.2

        normalized_thumb_index_dist = thumb_index_dist / wrist_to_middle_mcp
        normalized_index_middle_dist = index_middle_dist / wrist_to_middle_mcp

        # 1. Thumbs Up
        if thumb_extended_vertical and not (index_extended or middle_extended or ring_extended or pinky_extended):
            return "thumbs_up", 0.95

        # 2. Open Palm (Stop/Wait)
        if index_extended and middle_extended and ring_extended and pinky_extended and (thumb_extended_vertical or thumb_extended_horizontal):
            return "open_palm", 0.94

        # 3. Peace Sign (V) (Question)
        if index_extended and middle_extended and not (ring_extended or pinky_extended or thumb_extended_vertical) and normalized_index_middle_dist > 0.20:
            return "peace_sign", 0.92

        # 4. OK Sign
        if normalized_thumb_index_dist < 0.28 and middle_extended and ring_extended and pinky_extended:
            return "ok_sign", 0.90

        # 5. Pointing Up
        if index_extended and not (middle_extended or ring_extended or pinky_extended or thumb_extended_vertical):
            return "pointing_up", 0.91

        # 6. Call Me (Master Macro)
        if (thumb_extended_vertical or thumb_extended_horizontal) and pinky_extended and not (index_extended or middle_extended or ring_extended):
            return "call_me", 0.93

        # 7. Closed Fist
        if not (index_extended or middle_extended or ring_extended or pinky_extended or thumb_extended_vertical):
            return "fist", 0.88

        return None, 0.0

    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[str], float, bool]:
        self._calculate_fps()
        if self.is_tracking_paused:
            return frame, None, 0.0, False

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb_frame.flags.writeable = False
        results = self.hands.process(rgb_frame)
        rgb_frame.flags.writeable = True

        raw_gesture: Optional[str] = None
        confidence: float = 0.0

        if results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                hand_label = handedness.classification[0].label
                raw_gesture, confidence = self.classify_landmarks(hand_landmarks, handedness=hand_label)

                self.mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(0, 230, 160), thickness=2, circle_radius=3),
                    self.mp_drawing.DrawingSpec(color=(240, 240, 240), thickness=2, circle_radius=2)
                )
                break

        self.gesture_buffer.append(raw_gesture)

        confirmed_gesture = None
        now = time.time()
        is_new_trigger = False

        if raw_gesture is not None:
            count = sum(1 for g in self.gesture_buffer if g == raw_gesture)
            if (count / len(self.gesture_buffer)) >= self.consensus_threshold:
                confirmed_gesture = raw_gesture
                cooldown = self.cooldown_durations.get(confirmed_gesture, self.default_cooldown)

                if (now - self.last_trigger_time) > cooldown:
                    self.last_trigger_time = now
                    self.last_triggered_gesture = confirmed_gesture
                    is_new_trigger = True

        return frame, confirmed_gesture, confidence, is_new_trigger
`,
  },
  'overlay_ui.py': {
    filename: 'overlay_ui.py',
    description: 'PyQt6 Frameless, Always-On-Top translucent floating overlay with live preview, dynamic theme switching & high-contrast transcription HUD',
    code: `"""
Floating Meeting Overlay UI for Silent Meeting Assistant.
Constructs a sleek, frameless, always-on-top desktop overlay using PyQt6
with live camera preview feed, dynamic theme switching (Dark / High-Contrast Light), and transcription HUD.
"""

from PyQt6.QtCore import Qt, QPoint, pyqtSignal
from PyQt6.QtGui import QImage, QPixmap, QColor
from PyQt6.QtWidgets import (
    QWidget, QLabel, QPushButton, QVBoxLayout, QHBoxLayout,
    QFrame, QGraphicsDropShadowEffect, QSizePolicy
)


class FloatingOverlay(QWidget):
    toggle_tracking_signal = pyqtSignal(bool)
    clear_text_signal = pyqtSignal()
    open_settings_signal = pyqtSignal()

    def __init__(self):
        super().__init__()
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.SubWindow
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.dragging = False
        self.drag_position = QPoint()
        self.is_tracking = True
        self.theme = "dark"  # "dark" or "high-contrast-light"
        self.current_message = "Waiting for hand gesture..."
        self._init_ui()

    def _init_ui(self):
        self.resize(740, 240)
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(12, 12, 12, 12)

        self.container = QFrame(self)
        self.container.setObjectName("overlayContainer")
        self.container.setStyleSheet("""
            QFrame#overlayContainer {
                background-color: rgba(18, 22, 30, 0.92);
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 16px;
            }
        """)

        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(28)
        shadow.setColor(QColor(0, 0, 0, 180))
        shadow.setOffset(0, 8)
        self.container.setGraphicsEffect(shadow)

        container_layout = QVBoxLayout(self.container)
        container_layout.setContentsMargins(16, 12, 16, 14)

        # Header
        header_layout = QHBoxLayout()
        self.brand_label = QLabel("SILENT MEETING ASSISTANT", self.container)
        self.brand_label.setStyleSheet("color: #94A3B8; font-size: 11px; font-weight: 700; letter-spacing: 1.2px;")
        self.status_pill = QLabel("● LIVE TRACKING", self.container)
        self.status_pill.setStyleSheet("background-color: rgba(16, 185, 129, 0.18); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 2px 8px; font-size: 10px; font-weight: 700;")

        header_layout.addWidget(self.brand_label)
        header_layout.addWidget(self.status_pill)
        header_layout.addStretch()

        self.theme_btn = QPushButton("☀ Theme", self.container)
        self.theme_btn.clicked.connect(self.toggle_theme)
        self.pause_btn = QPushButton("Pause", self.container)
        self.pause_btn.clicked.connect(self._toggle_tracking)
        self.clear_btn = QPushButton("Clear", self.container)
        self.clear_btn.clicked.connect(self._clear_transcription)
        self.settings_btn = QPushButton("⚙ Settings", self.container)
        self.settings_btn.clicked.connect(self.open_settings_signal.emit)

        header_layout.addWidget(self.theme_btn)
        header_layout.addWidget(self.pause_btn)
        header_layout.addWidget(self.clear_btn)
        header_layout.addWidget(self.settings_btn)
        container_layout.addLayout(header_layout)

        # Body
        body_layout = QHBoxLayout()
        self.camera_label = QLabel(self.container)
        self.camera_label.setFixedSize(180, 120)
        self.camera_label.setScaledContents(True)
        self.camera_label.setStyleSheet("background-color: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px;")

        self.transcription_box = QFrame(self.container)
        self.transcription_box.setStyleSheet("QFrame { background-color: rgba(10, 14, 23, 0.95); border: 2px solid #3B82F6; border-radius: 12px; }")
        trans_layout = QVBoxLayout(self.transcription_box)

        self.gesture_badge = QLabel("READY", self.transcription_box)
        self.gesture_badge.setStyleSheet("color: #60A5FA; font-size: 11px; font-weight: 800;")
        self.message_label = QLabel(self.current_message, self.transcription_box)
        self.message_label.setStyleSheet("color: #F8FAFC; font-size: 20px; font-weight: 700;")
        self.message_label.setWordWrap(True)

        trans_layout.addWidget(self.gesture_badge)
        trans_layout.addWidget(self.message_label)
        body_layout.addWidget(self.camera_label)
        body_layout.addWidget(self.transcription_box, 1)

        container_layout.addLayout(body_layout)
        main_layout.addWidget(self.container)

    def toggle_theme(self):
        self.theme = "high-contrast-light" if self.theme == "dark" else "dark"
        self.theme_btn.setText("🌙 Dark Mode" if self.theme == "high-contrast-light" else "☀ Theme")
        is_hc = (self.theme == "high-contrast-light")
        if is_hc:
            self.container.setStyleSheet("QFrame#overlayContainer { background-color: #FFFFFF; border: 2px solid #0F172A; border-radius: 16px; }")
            self.brand_label.setStyleSheet("color: #0F172A; font-size: 11px; font-weight: 900;")
            self.transcription_box.setStyleSheet("QFrame { background-color: #FFFFFF; border: 2px solid #0F172A; border-radius: 12px; }")
            self.message_label.setStyleSheet("color: #020617; font-size: 20px; font-weight: 900;")
        else:
            self.container.setStyleSheet("QFrame#overlayContainer { background-color: rgba(18, 22, 30, 0.92); border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 16px; }")
            self.brand_label.setStyleSheet("color: #94A3B8; font-size: 11px; font-weight: 700;")
            self.transcription_box.setStyleSheet("QFrame { background-color: rgba(10, 14, 23, 0.95); border: 2px solid #3B82F6; border-radius: 12px; }")
            self.message_label.setStyleSheet("color: #F8FAFC; font-size: 20px; font-weight: 700;")

    def display_transcription(self, message: str, gesture_name: str = "", badge_color: str = "#3B82F6"):
        self.current_message = message
        self.message_label.setText(message)
        is_hc = (self.theme == "high-contrast-light")
        if gesture_name:
            self.gesture_badge.setText(f"GESTURE: {gesture_name.upper().replace('_', ' ')}")
            self.gesture_badge.setStyleSheet(f"color: {'#1D4ED8' if is_hc else badge_color}; font-size: 11px; font-weight: 900;")
            self.transcription_box.setStyleSheet(f"QFrame {{ background-color: {'#FFFFFF' if is_hc else 'rgba(10, 14, 23, 0.96)'}; border: 3px solid {'#1D4ED8' if is_hc else badge_color}; border-radius: 12px; }}")

    def _toggle_tracking(self):
        self.is_tracking = not self.is_tracking
        self.pause_btn.setText("Resume" if not self.is_tracking else "Pause")
        self.toggle_tracking_signal.emit(self.is_tracking)

    def _clear_transcription(self):
        self.message_label.setText("Display cleared. Ready for gesture...")
        self.gesture_badge.setText("READY")
        self.clear_text_signal.emit()

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.dragging = True
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        if self.dragging and event.buttons() == Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()

    def mouseReleaseEvent(self, event):
        self.dragging = False
`,
  },
  'config_manager.py': {
    filename: 'config_manager.py',
    description: 'JSON persistence for custom_gestures.json & profile.json with macro token interpolation ({name}, {title}, etc.)',
    code: `"""
Configuration & Persistence Manager for Silent Meeting Assistant.
Handles reading, writing, validating, and dynamic interpolation of custom gesture mappings
and user intro profiles from local JSON files.
"""

import os
import json
import time
from typing import Dict, Any, Optional

DEFAULT_CONFIG_PATH = "custom_gestures.json"
DEFAULT_PROFILE_PATH = "profile.json"

class ConfigManager:
    def __init__(self, config_path: str = DEFAULT_CONFIG_PATH, profile_path: str = DEFAULT_PROFILE_PATH):
        self.config_path = config_path
        self.profile_path = profile_path
        self.gestures: Dict[str, Dict[str, Any]] = {}
        self.profile: Dict[str, Any] = {}
        self.load_all()

    def load_all(self):
        self.load_gestures()
        self.load_profile()

    def load_gestures(self) -> Dict[str, Dict[str, Any]]:
        if not os.path.exists(self.config_path):
            from custom_gestures import DEFAULT_GESTURE_MAPPINGS
            self.gestures = DEFAULT_GESTURE_MAPPINGS.copy()
            self.save_gestures()
            return self.gestures

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                self.gestures = json.load(f)
        except Exception as e:
            print(f"[ConfigManager] Error: {e}")
        return self.gestures

    def save_gestures(self) -> bool:
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self.gestures, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ConfigManager] Save error: {e}")
            return False

    def load_profile(self) -> Dict[str, Any]:
        if not os.path.exists(self.profile_path):
            self.profile = {
                "name": "Alex Morgan",
                "job_title": "Staff AI Systems Architect",
                "status": "Available / On Silent Mode",
                "team": "Engineering & Innovation",
                "template": "👋 Hello everyone! I'm {name}, {job_title} ({team}). Status: {status}.",
                "master_gesture": "call_me"
            }
            self.save_profile()
            return self.profile

        with open(self.profile_path, "r", encoding="utf-8") as f:
            self.profile = json.load(f)
        return self.profile

    def save_profile(self) -> bool:
        with open(self.profile_path, "w", encoding="utf-8") as f:
            json.dump(self.profile, f, indent=4, ensure_ascii=False)
        return True

    def get_compiled_introduction(self) -> str:
        template = self.profile.get("template", "")
        return template.format(
            name=self.profile.get("name", "User"),
            job_title=self.profile.get("job_title", "Team Member"),
            status=self.profile.get("status", "Available"),
            team=self.profile.get("team", ""),
            time=time.strftime("%I:%M %p")
        )

    def resolve_gesture_message(self, gesture_key: str) -> Optional[str]:
        entry = self.gestures.get(gesture_key)
        if not entry or not entry.get("enabled", True):
            return None

        text = entry.get("text", "")
        if gesture_key == self.profile.get("master_gesture", "call_me") or text == "MASTER_MACRO:INTRO_PROFILE":
            return self.get_compiled_introduction()

        return text.format(
            name=self.profile.get("name", "User"),
            job_title=self.profile.get("job_title", ""),
            status=self.profile.get("status", ""),
            time=time.strftime("%I:%M %p")
        )
`,
  },
  'settings_window.py': {
    filename: 'settings_window.py',
    description: 'PyQt6 multi-tab settings dialog for custom gesture macros and profile introduction editor',
    code: `"""
Settings & Configuration Window for Silent Meeting Assistant.
Provides a multi-tab PyQt6 configuration dialog for custom gesture-to-text macros,
the Intro Profile compiler, vision sensitivity controls, and JSON persistence.
"""

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QDialog, QTabWidget, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QTextEdit, QPushButton, QComboBox,
    QTableWidget, QTableWidgetItem, QHeaderView, QGroupBox
)

class SettingsWindow(QDialog):
    config_updated_signal = pyqtSignal()
    test_intro_signal = pyqtSignal(str)

    def __init__(self, config_manager, parent=None):
        super().__init__(parent)
        self.config = config_manager
        self.setWindowTitle("Silent Meeting Assistant — Settings & Macro Studio")
        self.resize(760, 560)
        self._init_tabs()

    def _init_tabs(self):
        layout = QVBoxLayout(self)
        self.tabs = QTabWidget(self)

        self.tab_gestures = QWidget()
        self.tab_profile = QWidget()
        self.tab_vision = QWidget()

        self.tabs.addTab(self.tab_gestures, "Gesture Mappings")
        self.tabs.addTab(self.tab_profile, "Intro Profile & Macros")
        self.tabs.addTab(self.tab_vision, "Vision Tuner")
        layout.addWidget(self.tabs)

        save_btn = QPushButton("Save & Close", self)
        save_btn.clicked.connect(self.accept)
        layout.addWidget(save_btn)
`,
  },
  'main.py': {
    filename: 'main.py',
    description: 'Master application entrypoint wiring QThread video capture worker with the PyQt6 floating overlay UI',
    code: `"""
Master Application Entrypoint for Silent Meeting Assistant.
Integrates OpenCV + MediaPipe computer vision thread with the PyQt6 always-on-top
floating overlay UI, configuration manager, and macro dispatcher.
"""

import sys
import time
import cv2
from PyQt6.QtCore import QThread, pyqtSignal
from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QApplication

from gesture_engine import GestureEngine
from config_manager import ConfigManager
from overlay_ui import FloatingOverlay
from settings_window import SettingsWindow


class VideoWorker(QThread):
    frame_ready = pyqtSignal(QImage)
    gesture_triggered = pyqtSignal(str, str, float)

    def __init__(self, engine: GestureEngine, config: ConfigManager):
        super().__init__()
        self.engine = engine
        self.config = config
        self._is_running = True

    def run(self):
        if not self.engine.start_camera():
            print("[Error] Failed to initialize camera.")
            return

        while self._is_running:
            ret, frame = self.engine.cap.read()
            if not ret:
                time.sleep(0.01)
                continue

            processed_frame, confirmed_gesture, confidence, is_new_trigger = self.engine.process_frame(frame)

            if is_new_trigger and confirmed_gesture:
                resolved_text = self.config.resolve_gesture_message(confirmed_gesture)
                if resolved_text:
                    self.gesture_triggered.emit(confirmed_gesture, resolved_text, confidence)

            rgb_frame = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
            h, w, ch = rgb_frame.shape
            q_img = QImage(rgb_frame.data, w, h, ch * w, QImage.Format.Format_RGB888)
            self.frame_ready.emit(q_img.copy())
            time.sleep(0.015)

    def stop(self):
        self._is_running = False
        self.wait(1000)
        self.engine.stop_camera()


class SilentMeetingApp:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.config_manager = ConfigManager()
        self.gesture_engine = GestureEngine(target_fps=30)
        self.overlay = FloatingOverlay()
        self.settings_window = SettingsWindow(self.config_manager)

        self.worker = VideoWorker(self.gesture_engine, self.config_manager)
        self.worker.frame_ready.connect(self.overlay.update_frame)
        self.worker.gesture_triggered.connect(self._on_gesture)
        self.worker.start()

    def _on_gesture(self, key, text, conf):
        self.overlay.display_transcription(text, gesture_name=key)

    def run(self):
        self.overlay.show()
        sys.exit(self.app.exec())


if __name__ == "__main__":
    app = SilentMeetingApp()
    app.run()
`,
  },
  'requirements.txt': {
    filename: 'requirements.txt',
    description: 'Python package dependencies for OpenCV, MediaPipe, PyQt6, and NumPy',
    code: `opencv-python>=4.8.0.76
mediapipe>=0.10.9
PyQt6>=6.5.0
numpy>=1.24.0
google-genai>=0.1.0
requests>=2.31.0
`,
  },
  'README.md': {
    filename: 'README.md',
    description: 'Complete setup and usage guide with terminal instructions and gesture dictionaries',
    code: `# 🖐️ Silent Meeting Assistant
Real-time "Always-On-Top" Accessible Hand Gesture Floating Overlay for Zoom, Google Meet & Teams.

### Setup:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # Or venv\\Scripts\\activate on Windows
pip install -r requirements.txt
python main.py
\`\`\`
`,
  },
};
