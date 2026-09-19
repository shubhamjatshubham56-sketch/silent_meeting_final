"""
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
        self.mp_drawing_styles = mp.solutions.drawing_styles

        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,  # Single primary hand for intentional command execution
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

        # Video capture reference
        self.cap: Optional[cv2.VideoCapture] = None

        # Temporal stabilization buffer (stores recent candidate gesture classifications)
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

        # Runtime telemetry
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
                print("[GestureEngine] Failed to initialize camera hardware.")
                return False

        # Attempt to set 30+ FPS and 720p resolution
        self.cap.set(cv2.CAP_PROP_FPS, self.target_fps)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimal buffer lag

        return True

    def stop_camera(self):
        """Releases the camera and MediaPipe resources."""
        if self.cap and self.cap.isOpened():
            self.cap.release()
        self.hands.close()

    def _calculate_fps(self):
        """Calculates instantaneous smoothed frame rate."""
        now = time.time()
        dt = now - self._prev_frame_time
        self._prev_frame_time = now
        if dt > 0:
            current_fps = 1.0 / dt
            self.fps = 0.85 * self.fps + 0.15 * current_fps if self.fps > 0 else current_fps

    @staticmethod
    def _euclidean_dist(p1, p2) -> float:
        """Euclidean distance between two landmarks (ignoring depth z for screen projection)."""
        return math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

    def classify_landmarks(self, landmarks, handedness: str = "Right") -> Tuple[Optional[str], float]:
        """
        Extracts geometric finger relationships from 21 hand landmarks.
        Returns: (gesture_name, confidence_score)
        """
        lm = landmarks.landmark

        # Key landmark points:
        # Wrist: 0
        # Thumb: 1, 2, 3, 4 (Tip: 4, IP: 3, MCP: 2)
        # Index: 5, 6, 7, 8 (Tip: 8, PIP: 6, MCP: 5)
        # Middle: 9, 10, 11, 12 (Tip: 12, PIP: 10, MCP: 9)
        # Ring: 13, 14, 15, 16 (Tip: 16, PIP: 14, MCP: 13)
        # Pinky: 17, 18, 19, 20 (Tip: 20, PIP: 18, MCP: 17)

        wrist = lm[0]

        # Determine finger extension (Tip is higher than PIP on screen, i.e. smaller y-coord)
        index_extended = lm[8].y < lm[6].y
        middle_extended = lm[12].y < lm[10].y
        ring_extended = lm[16].y < lm[14].y
        pinky_extended = lm[20].y < lm[18].y

        # Thumb extension: check if thumb tip is separated from index MCP and wrist
        thumb_tip = lm[4]
        thumb_ip = lm[3]
        thumb_mcp = lm[2]
        thumb_extended_vertical = (thumb_tip.y < thumb_ip.y < thumb_mcp.y) and (thumb_tip.y < lm[5].y)
        thumb_extended_horizontal = abs(thumb_tip.x - lm[5].x) > 0.12

        # Distances for special gestures
        thumb_index_dist = self._euclidean_dist(thumb_tip, lm[8])
        index_middle_dist = self._euclidean_dist(lm[8], lm[12])
        wrist_to_middle_mcp = self._euclidean_dist(wrist, lm[9]) or 0.2

        normalized_thumb_index_dist = thumb_index_dist / wrist_to_middle_mcp
        normalized_index_middle_dist = index_middle_dist / wrist_to_middle_mcp

        # 1. THUMBS UP:
        # Thumb pointing strongly upward, all other 4 fingers curled
        if (
            thumb_extended_vertical
            and not index_extended
            and not middle_extended
            and not ring_extended
            and not pinky_extended
            and (thumb_tip.y < wrist.y - 0.15)
        ):
            return "thumbs_up", 0.95

        # 2. OPEN PALM (Stop / Wait):
        # All 5 fingers extended and spread
        if (
            index_extended
            and middle_extended
            and ring_extended
            and pinky_extended
            and (thumb_extended_vertical or thumb_extended_horizontal)
        ):
            # Check fingers are not bunched
            return "open_palm", 0.94

        # 3. PEACE SIGN (V) (I have a question):
        # Index and Middle extended in V shape; Ring, Pinky, and Thumb curled
        if (
            index_extended
            and middle_extended
            and not ring_extended
            and not pinky_extended
            and not thumb_extended_vertical
            and normalized_index_middle_dist > 0.20
        ):
            return "peace_sign", 0.92

        # 4. OK SIGN (Understood):
        # Thumb tip and Index tip touching (small distance), Middle, Ring, Pinky extended
        if (
            normalized_thumb_index_dist < 0.28
            and middle_extended
            and ring_extended
            and pinky_extended
        ):
            return "ok_sign", 0.90

        # 5. POINTING UP (Take note / Look):
        # Index extended, all others curled
        if (
            index_extended
            and not middle_extended
            and not ring_extended
            and not pinky_extended
            and not thumb_extended_vertical
        ):
            return "pointing_up", 0.91

        # 6. CALL ME / MASTER MACRO (Intro Profile trigger):
        # Thumb and Pinky extended, middle 3 curled
        if (
            (thumb_extended_vertical or thumb_extended_horizontal)
            and pinky_extended
            and not index_extended
            and not middle_extended
            and not ring_extended
        ):
            return "call_me", 0.93

        # 7. CLOSED FIST (Muted / Listening):
        # All fingers curled
        if (
            not index_extended
            and not middle_extended
            and not ring_extended
            and not pinky_extended
            and not thumb_extended_vertical
        ):
            return "fist", 0.88

        return None, 0.0

    def process_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, Optional[str], float, bool]:
        """
        Processes a single BGR frame from the camera.
        Returns:
            processed_frame: BGR frame with visual HUD and landmarks drawn
            confirmed_gesture: stable classified gesture name if consensus reached
            confidence: confidence score of the gesture
            is_new_trigger: boolean indicating if this is an active new trigger (respecting cooldown)
        """
        self._calculate_fps()

        # If tracking paused by user toggle, return raw frame with PAUSED badge
        if self.is_tracking_paused:
            h, w, _ = frame.shape
            cv2.rectangle(frame, (10, 10), (220, 50), (30, 30, 30), -1)
            cv2.putText(frame, "TRACKING PAUSED", (20, 38), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (120, 120, 255), 2)
            return frame, None, 0.0, False

        # Flip horizontally for natural mirror feel
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape

        # Convert to RGB for MediaPipe processing
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

                # Draw landmark skeleton with sleek tech styling
                self.mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_drawing.DrawingSpec(color=(0, 230, 160), thickness=2, circle_radius=3),
                    self.mp_drawing.DrawingSpec(color=(240, 240, 240), thickness=2, circle_radius=2)
                )
                break  # Process primary hand
        else:
            raw_gesture = None

        # Append to temporal stabilization buffer
        self.gesture_buffer.append(raw_gesture)

        # Evaluate consensus across buffer
        confirmed_gesture = None
        now = time.time()
        is_new_trigger = False

        if raw_gesture is not None:
            # Count occurrences in buffer
            count = sum(1 for g in self.gesture_buffer if g == raw_gesture)
            consensus_ratio = count / len(self.gesture_buffer)

            if consensus_ratio >= self.consensus_threshold:
                confirmed_gesture = raw_gesture
                cooldown = self.cooldown_durations.get(confirmed_gesture, self.default_cooldown)

                # Check cooldown timer to prevent rapid-fire triggers
                if (now - self.last_trigger_time) > cooldown or (self.last_triggered_gesture != confirmed_gesture and (now - self.last_trigger_time) > 0.8):
                    self.last_trigger_time = now
                    self.last_triggered_gesture = confirmed_gesture
                    is_new_trigger = True

        # Render HUD Overlay on frame
        self._render_hud(frame, confirmed_gesture, raw_gesture, now)

        return frame, confirmed_gesture, confidence, is_new_trigger

    def _render_hud(self, frame: np.ndarray, confirmed: Optional[str], raw: Optional[str], current_time: float):
        """Draws a clean, high-contrast overlay HUD on the OpenCV camera frame."""
        h, w, _ = frame.shape

        # Semi-transparent top bar for status
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, 54), (18, 20, 24), -1)
        cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

        # FPS indicator
        fps_text = f"{int(self.fps)} FPS"
        cv2.putText(frame, fps_text, (16, 34), cv2.FONT_HERSHEY_DUPLEX, 0.55, (160, 230, 100), 1)

        # Status badge
        if confirmed:
            cooldown = self.cooldown_durations.get(confirmed, self.default_cooldown)
            time_since = current_time - self.last_trigger_time
            in_cooldown = time_since < cooldown

            status_text = f"DETECTED: {confirmed.upper().replace('_', ' ')}"
            badge_color = (0, 200, 255) if in_cooldown else (100, 255, 140)

            # Gesture pill
            cv2.putText(frame, status_text, (110, 35), cv2.FONT_HERSHEY_DUPLEX, 0.65, badge_color, 2)

            # Cooldown progress line
            if in_cooldown:
                progress = min(1.0, time_since / cooldown)
                bar_w = int(180 * progress)
                cv2.rectangle(frame, (w - 210, 24), (w - 210 + bar_w, 30), (0, 200, 255), -1)
                cv2.rectangle(frame, (w - 210, 24), (w - 30, 30), (100, 100, 100), 1)
        else:
            cv2.putText(frame, "READY / LISTENING FOR HAND", (110, 34), cv2.FONT_HERSHEY_DUPLEX, 0.55, (180, 185, 195), 1)


# Standalone runner for testing the computer vision engine directly
if __name__ == "__main__":
    print("==================================================")
    print("  Silent Meeting Assistant - Computer Vision Engine")
    print("  Testing 30+ FPS Camera Stream & Hand Tracking")
    print("  Press 'q' or ESC in the preview window to exit.")
    print("==================================================")

    engine = GestureEngine()
    if not engine.start_camera():
        print("[Error] Failed to initialize camera.")
        exit(1)

    try:
        while True:
            ret, frame = engine.cap.read()
            if not ret:
                print("[Warning] Blank frame received.")
                break

            processed, gesture, conf, triggered = engine.process_frame(frame)

            if triggered:
                print(f"[TRIGGER] Gesture: '{gesture}' (Conf: {conf:.2f})")

            cv2.imshow("Silent Meeting Assistant - Vision Test", processed)
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q') or key == 27:
                break
            elif key == ord('p'):
                engine.is_tracking_paused = not engine.is_tracking_paused
                print(f"[Engine] Tracking paused: {engine.is_tracking_paused}")
    finally:
        engine.stop_camera()
        cv2.destroyAllWindows()
        print("[Engine] Shutdown complete.")
