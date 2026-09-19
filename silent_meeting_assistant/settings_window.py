"""
Settings & Configuration Window for Silent Meeting Assistant.
Provides a multi-tab PyQt6 configuration dialog for custom gesture-to-text macros,
the Intro Profile compiler, vision sensitivity controls, and JSON persistence.
"""

from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QColor, QFont
from PyQt6.QtWidgets import (
    QDialog, QTabWidget, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QTextEdit, QPushButton, QComboBox,
    QTableWidget, QTableWidgetItem, QHeaderView, QCheckBox,
    QMessageBox, QFrame, QScrollArea, QGroupBox
)
from config_manager import ConfigManager


class SettingsWindow(QDialog):
    """
    Settings dialog allowing runtime customization of gesture mappings,
    profile introductions, and computer vision parameters.
    """

    config_updated_signal = pyqtSignal()
    test_intro_signal = pyqtSignal(str)

    def __init__(self, config_manager: ConfigManager, parent=None):
        super().__init__(parent)
        self.config = config_manager
        self.setWindowTitle("Silent Meeting Assistant — Settings & Macro Studio")
        self.resize(760, 560)
        self.setStyleSheet("""
            QDialog {
                background-color: #0F172A;
                color: #F8FAFC;
            }
            QTabWidget::pane {
                border: 1px solid #334155;
                background-color: #1E293B;
                border-radius: 8px;
            }
            QTabBar::tab {
                background: #0F172A;
                color: #94A3B8;
                padding: 10px 20px;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                font-weight: 600;
                margin-right: 4px;
            }
            QTabBar::tab:selected {
                background: #1E293B;
                color: #38BDF8;
                border-bottom: 2px solid #38BDF8;
            }
            QLabel {
                color: #E2E8F0;
                font-size: 13px;
            }
            QLineEdit, QTextEdit, QComboBox {
                background-color: #0F172A;
                border: 1px solid #475569;
                border-radius: 6px;
                padding: 8px 10px;
                color: #F8FAFC;
                font-size: 13px;
            }
            QLineEdit:focus, QTextEdit:focus, QComboBox:focus {
                border: 1px solid #38BDF8;
            }
            QPushButton {
                background-color: #2563EB;
                color: white;
                border-radius: 6px;
                padding: 8px 16px;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #1D4ED8;
            }
        """)

        self._init_tabs()

    def _init_tabs(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)

        self.tabs = QTabWidget(self)

        # Tab 1: Custom Gestures & Macros
        self.tab_gestures = QWidget()
        self._build_gestures_tab()
        self.tabs.addTab(self.tab_gestures, "Gesture Mappings")

        # Tab 2: Intro Profile & Master Macro
        self.tab_profile = QWidget()
        self._build_profile_tab()
        self.tabs.addTab(self.tab_profile, "Intro Profile & Macros")

        # Tab 3: Vision & Sensitivity
        self.tab_vision = QWidget()
        self._build_vision_tab()
        self.tabs.addTab(self.tab_vision, "Vision & Buffer Tuner")

        layout.addWidget(self.tabs)

        # Bottom Action Bar
        bottom_layout = QHBoxLayout()
        bottom_layout.addStretch()

        close_btn = QPushButton("Save & Close", self)
        close_btn.clicked.connect(self._save_and_close)
        bottom_layout.addWidget(close_btn)

        layout.addLayout(bottom_layout)

    # -------------------------------------------------------------
    # TAB 1: Gesture Mappings Table & Editor
    # -------------------------------------------------------------
    def _build_gestures_tab(self):
        layout = QVBoxLayout(self.tab_gestures)
        layout.setContentsMargins(16, 16, 16, 16)

        info_label = QLabel(
            "Customize the exact text and macros displayed when each gesture is recognized in real-time. "
            "Changes persist in <b>custom_gestures.json</b>."
        )
        info_label.setWordWrap(True)
        info_label.setStyleSheet("color: #94A3B8; font-size: 12px; margin-bottom: 8px;")
        layout.addWidget(info_label)

        # Table of gestures
        self.gesture_table = QTableWidget(self.tab_gestures)
        self.gesture_table.setColumnCount(4)
        self.gesture_table.setHorizontalHeaderLabels(["Gesture", "Category", "Output Text / Macro", "Enabled"])
        self.gesture_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        self.gesture_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        self.gesture_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        self.gesture_table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        self.gesture_table.setStyleSheet("""
            QTableWidget {
                background-color: #0F172A;
                gridline-color: #334155;
                color: #F8FAFC;
                border-radius: 6px;
            }
            QHeaderView::section {
                background-color: #1E293B;
                color: #CBD5E1;
                font-weight: bold;
                padding: 6px;
                border: none;
            }
        """)

        self._populate_gestures_table()
        self.gesture_table.cellChanged.connect(self._on_table_cell_changed)
        layout.addWidget(self.gesture_table)

        # Quick Helper Buttons
        btn_bar = QHBoxLayout()
        reset_btn = QPushButton("Reset to Defaults", self.tab_gestures)
        reset_btn.setStyleSheet("background-color: #475569;")
        reset_btn.clicked.connect(self._reset_gestures_defaults)

        btn_bar.addWidget(reset_btn)
        btn_bar.addStretch()
        layout.addLayout(btn_bar)

    def _populate_gestures_table(self):
        self.gesture_table.blockSignals(True)
        gestures = self.config.load_gestures()
        self.gesture_table.setRowCount(len(gestures))

        for row, (key, data) in enumerate(gestures.items()):
            # Item 0: Gesture Label
            name_item = QTableWidgetItem(f"{data.get('label', key)}")
            name_item.setData(Qt.ItemDataRole.UserRole, key)
            name_item.setFlags(name_item.flags() ^ Qt.ItemFlag.ItemIsEditable)

            # Item 1: Category
            cat_item = QTableWidgetItem(data.get("category", "General"))
            cat_item.setFlags(cat_item.flags() ^ Qt.ItemFlag.ItemIsEditable)

            # Item 2: Output Text (Editable!)
            text_item = QTableWidgetItem(data.get("text", ""))

            # Item 3: Checkbox for Enabled
            enabled_item = QTableWidgetItem()
            enabled_item.setCheckState(Qt.CheckState.Checked if data.get("enabled", True) else Qt.CheckState.Unchecked)

            self.gesture_table.setItem(row, 0, name_item)
            self.gesture_table.setItem(row, 1, cat_item)
            self.gesture_table.setItem(row, 2, text_item)
            self.gesture_table.setItem(row, 3, enabled_item)

        self.gesture_table.blockSignals(False)

    def _on_table_cell_changed(self, row, col):
        name_item = self.gesture_table.item(row, 0)
        if not name_item:
            return
        gesture_key = name_item.data(Qt.ItemDataRole.UserRole)
        text_item = self.gesture_table.item(row, 2)
        enabled_item = self.gesture_table.item(row, 3)

        if gesture_key and text_item and enabled_item:
            new_text = text_item.text()
            is_enabled = enabled_item.checkState() == Qt.CheckState.Checked
            self.config.update_gesture_text(gesture_key, new_text, is_enabled)
            self.config_updated_signal.emit()

    def _reset_gestures_defaults(self):
        reply = QMessageBox.question(
            self, "Confirm Reset", "Reset all gesture mappings to original defaults?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            from config_manager import DEFAULT_GESTURE_MAPPINGS
            self.config.gestures = DEFAULT_GESTURE_MAPPINGS.copy()
            self.config.save_gestures()
            self._populate_gestures_table()
            self.config_updated_signal.emit()

    # -------------------------------------------------------------
    # TAB 2: Intro Profile & Master Macro
    # -------------------------------------------------------------
    def _build_profile_tab(self):
        layout = QVBoxLayout(self.tab_profile)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(12)

        info_label = QLabel(
            "Configure your Introduction Profile. Triggering the designated <b>Master Gesture</b> "
            "instantly compiles and broadcasts this introduction card into the meeting overlay."
        )
        info_label.setWordWrap(True)
        info_label.setStyleSheet("color: #94A3B8; font-size: 12px;")
        layout.addWidget(info_label)

        profile = self.config.load_profile()

        # Input Form
        form_group = QGroupBox("Profile Information", self.tab_profile)
        form_group.setStyleSheet("QGroupBox { font-weight: bold; color: #38BDF8; }")
        form_layout = QVBoxLayout(form_group)

        # Name
        h1 = QHBoxLayout()
        lbl_name = QLabel("Full Name:", form_group)
        lbl_name.setFixedWidth(120)
        self.input_name = QLineEdit(profile.get("name", ""), form_group)
        self.input_name.textChanged.connect(self._refresh_intro_preview)
        h1.addWidget(lbl_name)
        h1.addWidget(self.input_name)
        form_layout.addLayout(h1)

        # Job Title
        h2 = QHBoxLayout()
        lbl_title = QLabel("Job Title / Role:", form_group)
        lbl_title.setFixedWidth(120)
        self.input_title = QLineEdit(profile.get("job_title", ""), form_group)
        self.input_title.textChanged.connect(self._refresh_intro_preview)
        h2.addWidget(lbl_title)
        h2.addWidget(self.input_title)
        form_layout.addLayout(h2)

        # Status / Availability
        h3 = QHBoxLayout()
        lbl_status = QLabel("Meeting Status:", form_group)
        lbl_status.setFixedWidth(120)
        self.input_status = QLineEdit(profile.get("status", ""), form_group)
        self.input_status.textChanged.connect(self._refresh_intro_preview)
        h3.addWidget(lbl_status)
        h3.addWidget(self.input_status)
        form_layout.addLayout(h3)

        # Team
        h4 = QHBoxLayout()
        lbl_team = QLabel("Team / Org:", form_group)
        lbl_team.setFixedWidth(120)
        self.input_team = QLineEdit(profile.get("team", ""), form_group)
        self.input_team.textChanged.connect(self._refresh_intro_preview)
        h4.addWidget(lbl_team)
        h4.addWidget(self.input_team)
        form_layout.addLayout(h4)

        # Master Gesture Selector
        h5 = QHBoxLayout()
        lbl_gesture = QLabel("Master Gesture:", form_group)
        lbl_gesture.setFixedWidth(120)
        self.combo_master = QComboBox(form_group)
        for k, v in self.config.load_gestures().items():
            self.combo_master.addItem(f"{v.get('label', k)} ({k})", k)
        current_master = profile.get("master_gesture", "call_me")
        idx = self.combo_master.findData(current_master)
        if idx >= 0:
            self.combo_master.setCurrentIndex(idx)
        h5.addWidget(lbl_gesture)
        h5.addWidget(self.combo_master)
        form_layout.addLayout(h5)

        layout.addWidget(form_group)

        # Macro Template Editor
        template_group = QGroupBox("Compiled Introduction Template", self.tab_profile)
        template_group.setStyleSheet("QGroupBox { font-weight: bold; color: #38BDF8; }")
        tmpl_layout = QVBoxLayout(template_group)

        self.input_template = QTextEdit(profile.get("template", ""), template_group)
        self.input_template.setFixedHeight(60)
        self.input_template.textChanged.connect(self._refresh_intro_preview)
        tmpl_layout.addWidget(self.input_template)

        variables_hint = QLabel("Available macro tokens: <code>{name}</code>, <code>{job_title}</code>, <code>{team}</code>, <code>{status}</code>, <code>{time}</code>")
        variables_hint.setStyleSheet("color: #64748B; font-size: 11px;")
        tmpl_layout.addWidget(variables_hint)

        layout.addWidget(template_group)

        # Live Preview Box
        preview_group = QGroupBox("Live Output Preview", self.tab_profile)
        preview_group.setStyleSheet("QGroupBox { font-weight: bold; color: #10B981; }")
        prev_layout = QVBoxLayout(preview_group)

        self.preview_label = QLabel(self.tab_profile)
        self.preview_label.setStyleSheet("""
            background-color: #0A0E17;
            border: 1px solid #10B981;
            border-radius: 8px;
            padding: 10px;
            color: #E2E8F0;
            font-size: 14px;
            font-weight: 600;
        """)
        self.preview_label.setWordWrap(True)
        prev_layout.addWidget(self.preview_label)

        test_btn = QPushButton("Test Macro to Meeting Overlay", preview_group)
        test_btn.setStyleSheet("background-color: #059669;")
        test_btn.clicked.connect(self._trigger_test_macro)
        prev_layout.addWidget(test_btn)

        layout.addWidget(preview_group)
        self._refresh_intro_preview()

    def _refresh_intro_preview(self):
        tmpl = self.input_template.toPlainText()
        import time
        preview = tmpl.format(
            name=self.input_name.text() or "Name",
            job_title=self.input_title.text() or "Title",
            team=self.input_team.text() or "Team",
            status=self.input_status.text() or "Status",
            time=time.strftime("%I:%M %p")
        )
        self.preview_label.setText(preview)

    def _trigger_test_macro(self):
        self._save_profile_fields()
        compiled = self.config.get_compiled_introduction()
        self.test_intro_signal.emit(compiled)
        QMessageBox.information(self, "Macro Dispatched", "Introduction macro broadcasted to meeting overlay!")

    def _save_profile_fields(self):
        self.config.profile["name"] = self.input_name.text()
        self.config.profile["job_title"] = self.input_title.text()
        self.config.profile["status"] = self.input_status.text()
        self.config.profile["team"] = self.input_team.text()
        self.config.profile["template"] = self.input_template.toPlainText()
        self.config.profile["master_gesture"] = self.combo_master.currentData()
        self.config.save_profile()

    # -------------------------------------------------------------
    # TAB 3: Vision & Buffer Tuner
    # -------------------------------------------------------------
    def _build_vision_tab(self):
        layout = QVBoxLayout(self.tab_vision)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(14)

        intro = QLabel("Fine-tune Computer Vision performance, frame rates, and anti-flickering stabilization.")
        intro.setStyleSheet("color: #94A3B8; font-size: 12px;")
        layout.addWidget(intro)

        box = QGroupBox("Engine Tuning Parameters", self.tab_vision)
        box.setStyleSheet("QGroupBox { font-weight: bold; color: #38BDF8; }")
        box_layout = QVBoxLayout(box)

        t1 = QLabel("Target Capture Rate: <b>30+ FPS</b> (Hardware DirectShow / AVFoundation)")
        t2 = QLabel("MediaPipe Hand Models: <b>Single Hand 3D World Landmarks</b>")
        t3 = QLabel("Stabilization Buffer Size: <b>10 frames sliding window</b> (70% consensus)")
        t4 = QLabel("Trigger Cooldown Buffer: <b>2.0s - 3.0s anti-rapid fire</b>")

        for lbl in [t1, t2, t3, t4]:
            lbl.setStyleSheet("color: #CBD5E1; padding: 4px 0;")
            box_layout.addWidget(lbl)

        layout.addWidget(box)
        layout.addStretch()

    def _save_and_close(self):
        self._save_profile_fields()
        self.config_updated_signal.emit()
        self.accept()
