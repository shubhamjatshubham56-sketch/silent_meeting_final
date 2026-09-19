"""
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

DEFAULT_GESTURE_MAPPINGS: Dict[str, Dict[str, Any]] = {
    "thumbs_up": {
        "label": "Thumbs Up",
        "description": "Thumb pointing straight up, fingers curled",
        "text": "I agree / Yes 👍",
        "category": "Agreement",
        "enabled": True,
        "cooldown": 2.0,
        "badge_color": "#10B981"
    },
    "open_palm": {
        "label": "Open Palm",
        "description": "All 5 fingers extended and spread facing camera",
        "text": "Please wait / Stop ✋",
        "category": "Attention",
        "enabled": True,
        "cooldown": 2.5,
        "badge_color": "#EF4444"
    },
    "peace_sign": {
        "label": "Peace Sign (V)",
        "description": "Index & middle fingers extended upward in V shape",
        "text": "I have a question ✌️",
        "category": "Participation",
        "enabled": True,
        "cooldown": 2.0,
        "badge_color": "#3B82F6"
    },
    "ok_sign": {
        "label": "OK Sign",
        "description": "Thumb and index tips touching in circle, others extended",
        "text": "Understood / Sounds good 👌",
        "category": "Agreement",
        "enabled": True,
        "cooldown": 2.0,
        "badge_color": "#8B5CF6"
    },
    "pointing_up": {
        "label": "Pointing Up",
        "description": "Index finger extended up, other fingers folded",
        "text": "Please check the screen / slides ☝️",
        "category": "Direction",
        "enabled": True,
        "cooldown": 2.0,
        "badge_color": "#F59E0B"
    },
    "fist": {
        "label": "Closed Fist",
        "description": "All fingers tightly curled into palm",
        "text": "Muted / In active listening ✊",
        "category": "Status",
        "enabled": True,
        "cooldown": 2.5,
        "badge_color": "#6B7280"
    },
    "call_me": {
        "label": "Call Me (Master Macro)",
        "description": "Thumb and pinky extended, middle 3 curled",
        "text": "MASTER_MACRO:INTRO_PROFILE",
        "category": "Macro",
        "enabled": True,
        "cooldown": 3.0,
        "badge_color": "#EC4899"
    }
}

DEFAULT_USER_PROFILE: Dict[str, Any] = {
    "name": "Alex Morgan",
    "job_title": "Staff AI Systems Architect",
    "status": "Available / On Silent Mode",
    "team": "Engineering & Innovation",
    "template": "👋 Hello everyone! I'm {name}, {job_title} ({team}). Status: {status}.",
    "master_gesture": "call_me"
}


class ConfigManager:
    def __init__(self, config_path: str = DEFAULT_CONFIG_PATH, profile_path: str = DEFAULT_PROFILE_PATH):
        self.config_path = config_path
        self.profile_path = profile_path
        self.gestures: Dict[str, Dict[str, Any]] = {}
        self.profile: Dict[str, Any] = {}
        self.load_all()

    def load_all(self):
        """Loads both gestures and profile configurations from disk."""
        self.load_gestures()
        self.load_profile()

    def load_gestures(self) -> Dict[str, Dict[str, Any]]:
        """Loads gesture mappings from JSON or writes default if not found."""
        if not os.path.exists(self.config_path):
            self.gestures = DEFAULT_GESTURE_MAPPINGS.copy()
            self.save_gestures()
            return self.gestures

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                # Merge loaded with defaults so any newly added gestures stay supported
                merged = DEFAULT_GESTURE_MAPPINGS.copy()
                merged.update(loaded)
                self.gestures = merged
        except Exception as e:
            print(f"[ConfigManager] Error reading {self.config_path}: {e}. Using defaults.")
            self.gestures = DEFAULT_GESTURE_MAPPINGS.copy()

        return self.gestures

    def save_gestures(self) -> bool:
        """Persists current gesture configuration to JSON file."""
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self.gestures, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ConfigManager] Error saving gestures to {self.config_path}: {e}")
            return False

    def update_gesture_text(self, gesture_key: str, new_text: str, enabled: Optional[bool] = None) -> bool:
        """Updates text and status for a specific gesture key."""
        if gesture_key not in self.gestures:
            return False
        self.gestures[gesture_key]["text"] = new_text
        if enabled is not None:
            self.gestures[gesture_key]["enabled"] = enabled
        return self.save_gestures()

    def load_profile(self) -> Dict[str, Any]:
        """Loads user profile and intro macro settings."""
        if not os.path.exists(self.profile_path):
            self.profile = DEFAULT_USER_PROFILE.copy()
            self.save_profile()
            return self.profile

        try:
            with open(self.profile_path, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                merged = DEFAULT_USER_PROFILE.copy()
                merged.update(loaded)
                self.profile = merged
        except Exception as e:
            print(f"[ConfigManager] Error reading {self.profile_path}: {e}. Using default profile.")
            self.profile = DEFAULT_USER_PROFILE.copy()

        return self.profile

    def save_profile(self) -> bool:
        """Persists user profile configuration."""
        try:
            with open(self.profile_path, "w", encoding="utf-8") as f:
                json.dump(self.profile, f, indent=4, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ConfigManager] Error saving profile to {self.profile_path}: {e}")
            return False

    def update_profile(self, name: str, job_title: str, status: str, team: str = "", template: str = "") -> bool:
        """Updates the profile details and intro macro template."""
        self.profile["name"] = name
        self.profile["job_title"] = job_title
        self.profile["status"] = status
        if team:
            self.profile["team"] = team
        if template:
            self.profile["template"] = template
        return self.save_profile()

    def get_compiled_introduction(self) -> str:
        """Compiles the dynamic intro macro block using the configured template."""
        template = self.profile.get("template") or DEFAULT_USER_PROFILE["template"]
        compiled = template.format(
            name=self.profile.get("name", "User"),
            job_title=self.profile.get("job_title", "Team Member"),
            status=self.profile.get("status", "Available"),
            team=self.profile.get("team", ""),
            time=time.strftime("%I:%M %p")
        )
        return compiled

    def resolve_gesture_message(self, gesture_key: str) -> Optional[str]:
        """Resolves a detected gesture into the final text transcription, expanding macros."""
        entry = self.gestures.get(gesture_key)
        if not entry or not entry.get("enabled", True):
            return None

        text = entry.get("text", "")

        # Check if master macro is triggered either via designated gesture or special tag
        master_gesture = self.profile.get("master_gesture", "call_me")
        if gesture_key == master_gesture or text == "MASTER_MACRO:INTRO_PROFILE":
            return self.get_compiled_introduction()

        # Variable interpolation on custom text
        resolved = text.format(
            name=self.profile.get("name", "User"),
            job_title=self.profile.get("job_title", ""),
            status=self.profile.get("status", ""),
            time=time.strftime("%I:%M %p")
        )
        return resolved
