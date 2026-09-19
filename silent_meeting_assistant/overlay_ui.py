"""
Floating Meeting Overlay UI for Silent Meeting Assistant.
Constructs a sleek, semi-transparent, frameless, always-on-top desktop overlay
using PyQt6 with live camera preview feed and high-contrast transcription HUD.
"""

from PyQt6.QtCore import Qt, QPoint, pyqtSignal, QTimer
from PyQt6.QtGui import QImage, QPixmap, QColor, QFont, QPainter, QBrush, QPen
from PyQt6.QtWidgets import (
    QWidget, QLabel, QPushButton, QVBoxLayout, QHBoxLayout,
    QFrame, QGraphicsDropShadowEffect, QSlider, QSizePolicy
)


class FloatingOverlay(QWidget):
    """
    Always-on-top frameless floating overlay window designed to sit
    above Zoom, Google Meet, Microsoft Teams, or Webex call windows.
    """

    # Signals dispatched to parent controller
    toggle_tracking_signal = pyqtSignal(bool)
    clear_text_signal = pyqtSignal()
    open_settings_signal = pyqtSignal()

    def __init__(self):
        super().__init__()

        # 1. Window Flags: Frameless, Always on Top, Tool window (doesn't steal focus)
        self.setWindowFlags(
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.SubWindow
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)

        # Dragging mechanics
        self.dragging = False
        self.drag_position = QPoint()

        # State
        self.is_tracking = True
        self.current_message = "Waiting for hand gesture..."
        self.active_gesture_name = "None"
        self.badge_color = "#3B82F6"
        self.theme = "dark"  # "dark" or "high-contrast-light"

        self._init_ui()

    def _init_ui(self):
        self.resize(740, 240)
        self.setMinimumSize(600, 200)

        # Root Layout
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(12, 12, 12, 12)

        # Glassmorphic / High-Contrast Container Frame
        self.container = QFrame(self)
        self.container.setObjectName("overlayContainer")
        self.container.setStyleSheet("""
            QFrame#overlayContainer {
                background-color: rgba(18, 22, 30, 0.92);
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 16px;
            }
        """)

        # Soft drop shadow
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(28)
        shadow.setColor(QColor(0, 0, 0, 180))
        shadow.setOffset(0, 8)
        self.container.setGraphicsEffect(shadow)

        container_layout = QVBoxLayout(self.container)
        container_layout.setContentsMargins(16, 12, 16, 14)
        container_layout.setSpacing(10)

        # --- Top Header: Window Drag Handle & Controls ---
        header_layout = QHBoxLayout()
        header_layout.setSpacing(10)

        # App Brand & Status Pill
        self.brand_label = QLabel("SILENT MEETING ASSISTANT", self.container)
        self.brand_label.setStyleSheet("""
            color: #94A3B8;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.2px;
        """)

        self.status_pill = QLabel("● LIVE TRACKING", self.container)
        self.status_pill.setStyleSheet("""
            background-color: rgba(16, 185, 129, 0.18);
            color: #34D399;
            border: 1px solid rgba(16, 185, 129, 0.35);
            border-radius: 8px;
            padding: 2px 8px;
            font-size: 10px;
            font-weight: 700;
        """)

        header_layout.addWidget(self.brand_label)
        header_layout.addWidget(self.status_pill)
        header_layout.addStretch()

        # Action Buttons
        self.theme_btn = QPushButton("☀ Theme", self.container)
        self.theme_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.theme_btn.setStyleSheet(self._btn_style(bg="rgba(51, 65, 85, 0.6)", hover="#475569"))
        self.theme_btn.clicked.connect(self.toggle_theme)

        self.pause_btn = QPushButton("Pause", self.container)
        self.pause_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.pause_btn.setStyleSheet(self._btn_style(bg="rgba(51, 65, 85, 0.6)", hover="#475569"))
        self.pause_btn.clicked.connect(self._toggle_tracking)

        self.clear_btn = QPushButton("Clear", self.container)
        self.clear_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.clear_btn.setStyleSheet(self._btn_style(bg="rgba(51, 65, 85, 0.6)", hover="#475569"))
        self.clear_btn.clicked.connect(self._clear_transcription)

        self.settings_btn = QPushButton("⚙ Settings", self.container)
        self.settings_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.settings_btn.setStyleSheet(self._btn_style(bg="rgba(79, 70, 229, 0.6)", hover="#6366F1"))
        self.settings_btn.clicked.connect(self.open_settings_signal.emit)

        header_layout.addWidget(self.theme_btn)
        header_layout.addWidget(self.pause_btn)
        header_layout.addWidget(self.clear_btn)
        header_layout.addWidget(self.settings_btn)

        container_layout.addLayout(header_layout)

        # --- Middle Body: Camera Feed & Transcription Display ---
        body_layout = QHBoxLayout()
        body_layout.setSpacing(16)

        # Live Camera Preview Frame
        self.camera_label = QLabel(self.container)
        self.camera_label.setFixedSize(180, 120)
        self.camera_label.setScaledContents(True)
        self.camera_label.setStyleSheet("""
            background-color: #0A0D14;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 10px;
        """)
        self.camera_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.camera_label.setText("Camera Feed")

        # High-Contrast Transcription Display Box
        self.transcription_box = QFrame(self.container)
        self.transcription_box.setStyleSheet("""
            QFrame {
                background-color: rgba(10, 14, 23, 0.95);
                border: 2px solid #3B82F6;
                border-radius: 12px;
            }
        """)
        trans_layout = QVBoxLayout(self.transcription_box)
        trans_layout.setContentsMargins(16, 12, 16, 12)
        trans_layout.setSpacing(6)

        self.gesture_badge = QLabel("READY", self.transcription_box)
        self.gesture_badge.setStyleSheet("""
            color: #60A5FA;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.8px;
        """)

        self.message_label = QLabel(self.current_message, self.transcription_box)
        self.message_label.setStyleSheet("""
            color: #F8FAFC;
            font-size: 20px;
            font-weight: 700;
            line-height: 1.3;
        """)
        self.message_label.setWordWrap(True)
        self.message_label.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

        trans_layout.addWidget(self.gesture_badge)
        trans_layout.addWidget(self.message_label)

        body_layout.addWidget(self.camera_label)
        body_layout.addWidget(self.transcription_box, 1)

        container_layout.addLayout(body_layout)
        main_layout.addWidget(self.container)

    def _btn_style(self, bg: str, hover: str, text: str = "#F1F5F9", border: str = "rgba(255, 255, 255, 0.12)") -> str:
        return f"""
            QPushButton {{
                background-color: {bg};
                color: {text};
                border: 1px solid {border};
                border-radius: 6px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 700;
            }}
            QPushButton:hover {{
                background-color: {hover};
            }}
            QPushButton:pressed {{
                background-color: rgba(30, 41, 59, 0.9);
            }}
        """

    def update_frame(self, q_image: QImage):
        """Receives new camera frame from worker thread and updates camera preview."""
        pixmap = QPixmap.fromImage(q_image)
        self.camera_label.setPixmap(pixmap)

    def display_transcription(self, message: str, gesture_name: str = "", badge_color: str = "#3B82F6"):
        """Displays the high-contrast transcription text on the meeting overlay."""
        self.current_message = message
        self.message_label.setText(message)

        is_hc = (self.theme == "high-contrast-light")

        if gesture_name:
            clean_name = gesture_name.upper().replace("_", " ")
            self.gesture_badge.setText(f"GESTURE DETECTED: {clean_name}")
            self.gesture_badge.setStyleSheet(f"""
                color: {'#1D4ED8' if is_hc else badge_color};
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 0.8px;
            """)
            self.transcription_box.setStyleSheet(f"""
                QFrame {{
                    background-color: {'#FFFFFF' if is_hc else 'rgba(10, 14, 23, 0.96)'};
                    border: 3px solid {'#1D4ED8' if is_hc else badge_color};
                    border-radius: 12px;
                }}
            """)

    def toggle_theme(self):
        """Switches between default dark and high-contrast light mode."""
        if self.theme == "dark":
            self.theme = "high-contrast-light"
            self.theme_btn.setText("🌙 Dark Mode")
        else:
            self.theme = "dark"
            self.theme_btn.setText("☀ Theme")
        self.apply_theme()

    def apply_theme(self):
        """Applies stylesheet updates across all widgets based on active theme."""
        is_hc = (self.theme == "high-contrast-light")

        if is_hc:
            self.container.setStyleSheet("""
                QFrame#overlayContainer {
                    background-color: #FFFFFF;
                    border: 2px solid #0F172A;
                    border-radius: 16px;
                }
            """)
            self.brand_label.setStyleSheet("color: #0F172A; font-size: 11px; font-weight: 900; letter-spacing: 1.2px;")
            self.camera_label.setStyleSheet("background-color: #F8FAFC; border: 2px solid #0F172A; border-radius: 10px; color: #0F172A; font-weight: bold;")
            self.transcription_box.setStyleSheet("QFrame { background-color: #FFFFFF; border: 2px solid #0F172A; border-radius: 12px; }")
            self.gesture_badge.setStyleSheet("color: #1D4ED8; font-size: 11px; font-weight: 900; letter-spacing: 0.8px;")
            self.message_label.setStyleSheet("color: #020617; font-size: 20px; font-weight: 900; line-height: 1.3;")
            self.theme_btn.setStyleSheet(self._btn_style(bg="#0F172A", hover="#1E293B", text="#FFFFFF"))
            self.pause_btn.setStyleSheet(self._btn_style(bg="#F1F5F9", hover="#E2E8F0", text="#0F172A", border="#0F172A"))
            self.clear_btn.setStyleSheet(self._btn_style(bg="#F1F5F9", hover="#E2E8F0", text="#0F172A", border="#0F172A"))
            self.settings_btn.setStyleSheet(self._btn_style(bg="#4338CA", hover="#3730A3", text="#FFFFFF"))
        else:
            self.container.setStyleSheet("""
                QFrame#overlayContainer {
                    background-color: rgba(18, 22, 30, 0.92);
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 16px;
                }
            """)
            self.brand_label.setStyleSheet("color: #94A3B8; font-size: 11px; font-weight: 700; letter-spacing: 1.2px;")
            self.camera_label.setStyleSheet("background-color: #0A0D14; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 10px; color: #94A3B8;")
            self.transcription_box.setStyleSheet("QFrame { background-color: rgba(10, 14, 23, 0.95); border: 2px solid #3B82F6; border-radius: 12px; }")
            self.gesture_badge.setStyleSheet("color: #60A5FA; font-size: 11px; font-weight: 800; letter-spacing: 0.8px;")
            self.message_label.setStyleSheet("color: #F8FAFC; font-size: 20px; font-weight: 700; line-height: 1.3;")
            self.theme_btn.setStyleSheet(self._btn_style(bg="rgba(51, 65, 85, 0.6)", hover="#475569"))
            self.pause_btn.setStyleSheet(self._btn_style(bg="rgba(51, 65, 85, 0.6)", hover="#475569"))
            self.clear_btn.setStyleSheet(self._btn_style(bg="rgba(51, 65, 85, 0.6)", hover="#475569"))
            self.settings_btn.setStyleSheet(self._btn_style(bg="rgba(79, 70, 229, 0.6)", hover="#6366F1"))

    def _clear_transcription(self):
        """Clears the transcription box back to ready state."""
        self.message_label.setText("Display cleared. Ready for gesture...")
        self.gesture_badge.setText("READY")
        is_hc = (self.theme == "high-contrast-light")
        self.transcription_box.setStyleSheet(f"""
            QFrame {{
                background-color: {'#FFFFFF' if is_hc else 'rgba(10, 14, 23, 0.95)'};
                border: 2px solid {'#0F172A' if is_hc else '#3B82F6'};
                border-radius: 12px;
            }}
        """)
        self.clear_text_signal.emit()

    # --- Mouse Events for Frameless Window Dragging ---
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
