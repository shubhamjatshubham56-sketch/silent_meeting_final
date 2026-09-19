# 🖐️ Silent Meeting Assistant
### Accessible Real-Time "Always-On-Top" Hand Gesture Floating Overlay for Virtual Meetings

The **Silent Meeting Assistant** is an accessible system software application built for virtual meeting platforms (**Zoom, Google Meet, Microsoft Teams, Webex**). It empowers users—including individuals with vocal fatigue, speech impairments, or anyone attending meetings in noisy or quiet environments—to communicate instantly and silently using natural hand gestures.

---

## 🌟 Key Features

1. **High-Performance Computer Vision Engine**:
   - Captures front laptop webcam at **30+ FPS** with OpenCV.
   - Extracts 21 3D hand landmarks via **Google MediaPipe Hands**.
   - Geometric classification algorithms with rotation and scale invariance.
   - **Rolling Buffer Stabilization (10 frames)** and cooldown timer to eliminate accidental flickering and rapid-fire triggers.

2. **Always-On-Top Floating HUD Overlay**:
   - Modern, semi-transparent glassmorphic UI built with **PyQt6**.
   - `WindowStaysOnTopHint` ensures it floats above full-screen Zoom/Teams video grids.
   - Live camera preview showing hand skeleton wireframes.
   - High-contrast transcription banner with animated status pill.
   - Quick toggles to pause tracking or clear text.

3. **Dynamic Custom Gestures & Macro Studio**:
   - Secondary settings dialog to configure custom outputs for every gesture.
   - Saved automatically to `custom_gestures.json`.
   - Supports macro token interpolation: `{name}`, `{job_title}`, `{team}`, `{status}`, `{time}`.

4. **Intro Profile Macro**:
   - Store user credentials (Name, Title, Org, Status).
   - Designated Master Gesture (default: *Call Me* 🤙) instantly compiles and broadcasts a professional introduction block.

---

## 📁 Modular Project Architecture

```
silent_meeting_assistant/
│
├── requirements.txt         # Python dependencies (OpenCV, MediaPipe, PyQt6)
├── gesture_engine.py        # Core Computer Vision, 3D landmarks & classification
├── config_manager.py        # JSON persistence & macro token interpolation
├── overlay_ui.py            # PyQt6 translucent always-on-top floating HUD
├── settings_window.py       # Multi-tab macro studio & profile editor
├── main.py                  # Master entrypoint wiring QThread worker & UI signals
├── custom_gestures.json     # Local persistent gesture mappings
└── profile.json             # Local persistent introduction profile
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.9, 3.10, 3.11, or 3.12
- Laptop webcam or USB camera

### 2. Environment Setup
```bash
# Clone or navigate to directory
cd silent_meeting_assistant

# Create a virtual environment
python -m venv venv

# Activate virtual environment:
# On macOS / Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Test Core Vision Engine (Headless / OpenCV Preview)
To test only the webcam and gesture recognition engine with debug HUD:
```bash
python gesture_engine.py
```
*Press `q` or `ESC` to exit, `p` to toggle tracking pause.*

### 4. Run the Full Floating Overlay Application
```bash
python main.py
```
The sleek always-on-top overlay will appear in the corner of your screen. You can drag it anywhere on top of your Zoom/Teams window.

---

## 🖐️ Default Gesture Mappings

| Gesture | Movement Description | Default Output Text |
|---|---|---|
| **Thumbs Up** 👍 | Thumb pointing straight up, 4 fingers folded | *"I agree / Yes 👍"* |
| **Open Palm** ✋ | All 5 fingers extended and spread | *"Please wait / Stop ✋"* |
| **Peace Sign** ✌️ | Index & middle fingers in V shape | *"I have a question ✌️"* |
| **OK Sign** 👌 | Thumb & index tips touching, others extended | *"Understood / Sounds good 👌"* |
| **Pointing Up** ☝️ | Index finger pointing up, others curled | *"Please check the screen / slides ☝️"* |
| **Fist** ✊ | All fingers curled into palm | *"Muted / In active listening ✊"* |
| **Call Me** 🤙 | Thumb & pinky extended (Master Macro) | **Compiles Full Intro Profile Card** |

---

## ⚙️ Configuration & Custom Macros

Edit directly via the in-app **⚙ Settings** button or modify `custom_gestures.json`:

```json
{
  "thumbs_up": {
    "label": "Thumbs Up",
    "text": "100% aligned with this proposal! 👍",
    "enabled": true,
    "cooldown": 2.0
  }
}
```

### Available Macro Tokens
- `{name}` : User's full name
- `{job_title}` : User's role or designation
- `{team}` : Department / team
- `{status}` : Current availability / audio status
- `{time}` : Current clock time (e.g. `02:30 PM`)

---

## 🔒 Permissions & Troubleshooting

- **macOS**: Ensure Terminal/VS Code has camera permission enabled in `System Settings > Privacy & Security > Camera`.
- **Windows**: Verify `Settings > Privacy & Security > Camera > Allow apps to access your camera` is switched ON.
- **Multiple Cameras**: In `gesture_engine.py`, change `camera_index=0` to `1` or `2` if using an external USB webcam.
