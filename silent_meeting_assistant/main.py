"""
Master Application Entrypoint for Silent Meeting Assistant.
Integrates OpenCV + MediaPipe computer vision thread with the PyQt6 always-on-top
floating overlay UI, configuration manager, and macro dispatcher.
"""

import sys
import time
import cv2
import numpy as np

from PyQt6.QtCore import QThread, pyqtSignal, Qt
from PyQt6.QtGui import QImage
from PyQt6.QtWidgets import QApplication, QMessageBox

from gesture_engine import GestureEngine
from config_manager import ConfigManager
from overlay_ui import FloatingOverlay
from settings_window import SettingsWindow


class VideoWorker(QThread):
    """
    Dedicated QThread worker capturing camera frames and running
    MediaPipe gesture classification off the main GUI thread.
    """
    frame_ready = pyqtSignal(QImage)
    gesture_triggered = pyqtSignal(str, str, float)  # gesture_key, resolved_text, confidence
    error_occurred = pyqtSignal(str)

    def __init__(self, engine: GestureEngine, config: ConfigManager):
        super().__init__()
        self.engine = engine
        self.config = config
        self._is_running = True

    def run(self):
        """Main camera acquisition loop running at 30+ FPS."""
        if not self.engine.start_camera():
            self.error_occurred.emit("Could not open webcam hardware. Check permissions and index.")
            return

        while self._is_running:
            if not self.engine.cap or not self.engine.cap.isOpened():
                break

            ret, frame = self.engine.cap.read()
            if not ret:
                time.sleep(0.01)
                continue

            # Process frame through MediaPipe and classification buffer
            processed_frame, confirmed_gesture, confidence, is_new_trigger = self.engine.process_frame(frame)

            # Trigger gesture macro if consensus reached and cooldown passed
            if is_new_trigger and confirmed_gesture:
                resolved_text = self.config.resolve_gesture_message(confirmed_gesture)
                if resolved_text:
                    self.gesture_triggered.emit(confirmed_gesture, resolved_text, confidence)

            # Convert BGR OpenCV image to QImage for PyQt preview
            rgb_frame = cv2.cvtColor(processed_frame, cv2.COLOR_BGR2RGB)
            h, w, ch = rgb_frame.shape
            bytes_per_line = ch * w
            q_img = QImage(rgb_frame.data, w, h, bytes_per_line, QImage.Format.Format_RGB888)

            # Emit copy of image to prevent memory conflict
            self.frame_ready.emit(q_img.copy())

            # Slight sleep to cap around 35-40 FPS and prevent CPU hogging
            time.sleep(0.015)

    def stop(self):
        """Stops the capture worker thread cleanly."""
        self._is_running = False
        self.wait(1000)
        self.engine.stop_camera()


class SilentMeetingApp:
    """Master Application Coordinator."""

    def __init__(self):
        self.app = QApplication(sys.argv)
        self.app.setApplicationName("Silent Meeting Assistant")

        # 1. Initialize Subsystems
        self.config_manager = ConfigManager()
        self.gesture_engine = GestureEngine(target_fps=30)

        # 2. Build UI Components
        self.overlay = FloatingOverlay()
        self.settings_window = SettingsWindow(self.config_manager)

        # 3. Position overlay nicely in top-right or bottom-right of screen
        screen = self.app.primaryScreen()
        if screen:
            geom = screen.availableGeometry()
            # Position in bottom-right corner above taskbar
            x = geom.width() - self.overlay.width() - 30
            y = geom.height() - self.overlay.height() - 40
            self.overlay.move(x, y)

        # 4. Connect Signals & Slots
        self._connect_signals()

        # 5. Spawn Background Video Worker Thread
        self.worker = VideoWorker(self.gesture_engine, self.config_manager)
        self.worker.frame_ready.connect(self.overlay.update_frame)
        self.worker.gesture_triggered.connect(self._on_gesture_triggered)
        self.worker.error_occurred.connect(self._on_camera_error)
        self.worker.start()

    def _connect_signals(self):
        # Overlay toggles
        self.overlay.toggle_tracking_signal.connect(self._on_toggle_tracking)
        self.overlay.open_settings_signal.connect(self._open_settings)

        # Settings window signals
        self.settings_window.test_intro_signal.connect(self._on_test_intro)
        self.settings_window.config_updated_signal.connect(self._on_config_updated)

    def _on_toggle_tracking(self, is_tracking: bool):
        self.gesture_engine.is_tracking_paused = not is_tracking
        print(f"[App] Tracking state changed: {'Active' if is_tracking else 'Paused'}")

    def _open_settings(self):
        self.settings_window.show()
        self.settings_window.raise_()
        self.settings_window.activateWindow()

    def _on_gesture_triggered(self, gesture_key: str, message: str, confidence: float):
        gesture_data = self.config_manager.gestures.get(gesture_key, {})
        badge_color = gesture_data.get("badge_color", "#3B82F6")
        label = gesture_data.get("label", gesture_key)

        print(f"[Gesture Fired] {label} (Conf: {confidence:.2f}) -> {message}")
        self.overlay.display_transcription(message, gesture_name=label, badge_color=badge_color)

    def _on_test_intro(self, compiled_text: str):
        self.overlay.display_transcription(
            compiled_text,
            gesture_name="MASTER MACRO: INTRO PROFILE",
            badge_color="#EC4899"
        )

    def _on_config_updated(self):
        print("[App] Configuration reloaded dynamically from disk.")

    def _on_camera_error(self, err_msg: str):
        QMessageBox.warning(self.overlay, "Camera Initialization Error", err_msg)

    def run(self):
        self.overlay.show()
        ret = self.app.exec()
        self.worker.stop()
        sys.exit(ret)


if __name__ == "__main__":
    assistant = SilentMeetingApp()
    assistant.run()
