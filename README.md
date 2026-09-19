# 🤟 Silent Meeting Assistant

> **Communicate. Participate. Introduce. Act — Without Speaking.**

An AI-powered accessibility and communication system that uses a webcam to recognize predefined hand gestures and convert them into real-time communication messages.

The Silent Meeting Assistant is designed for situations where a person may be unable or prefer not to speak during an online meeting. Instead of relying on voice input, the system allows users to communicate through predefined gestures detected using computer vision.

---

## 🎯 Problem Statement

In meetings, presentations, classrooms, and other collaborative environments, some people may be unable or prefer not to communicate verbally.

Traditional video-conferencing systems mainly depend on:

- 🎤 Voice communication
- 💬 Manual chat messages
- ✋ Basic reaction buttons

These methods can interrupt the flow of a meeting or make quick silent communication difficult.

The **Silent Meeting Assistant** provides an alternative by using a webcam to detect predefined hand gestures and convert them into meaningful communication messages.

---

## 💡 Our Solution

The system continuously analyzes webcam frames and detects hand landmarks using **Google MediaPipe Hand Landmarker**.

The detected landmarks are processed by a gesture-recognition engine that identifies predefined gestures.

### Workflow

```text
Webcam
   ↓
Video Frame Capture
   ↓
MediaPipe Hand Landmark Detection
   ↓
21 Hand Landmarks
   ↓
Geometric Gesture Analysis
   ↓
Confidence Verification
   ↓
Temporal Stabilization
   ↓
Gesture Confirmation
   ↓
Communication Message
   ↓
Meeting Overlay
