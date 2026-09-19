import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let landmarkerInstance: HandLandmarker | null = null;
let isInitializing = false;

export async function getHandLandmarker(): Promise<HandLandmarker | null> {
  if (landmarkerInstance) return landmarkerInstance;
  if (isInitializing) return null;

  isInitializing = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );
    landmarkerInstance = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.65,
      minHandPresenceConfidence: 0.65,
      minTrackingConfidence: 0.65,
    });
    return landmarkerInstance;
  } catch (error) {
    console.warn('Could not initialize web MediaPipe HandLandmarker (fallback will be used):', error);
    return null;
  } finally {
    isInitializing = false;
  }
}

export interface GesturePredictionScore {
  gesture: 'ok_sign' | 'pointing_up' | 'open_palm' | 'folded_hands' | 'thumbs_up' | 'thumbs_down';
  label: string;
  confidence: number;
}

export interface DetailedClassificationResult {
  gesture: string | null;
  label: string;
  confidence: number;
  status: 'confirmed' | 'candidate' | 'unclear' | 'unrecognized';
  predictions: GesturePredictionScore[];
}

const GESTURE_LABELS: Record<string, string> = {
  ok_sign: 'OK',
  pointing_up: 'I have a question',
  open_palm: 'Please repeat',
  folded_hands: 'Thank you',
  thumbs_up: 'I agree',
  thumbs_down: 'I disagree',
};

/**
 * Geometric Feature Extraction & Normalized Gesture Classification:
 * Distinguishes the 6 predefined gestures reliably using normalized finger vectors,
 * angles, tip distances, and curl ratios. Unknown gestures NEVER default to "I agree".
 */
export function classifyHandLandmarksDetailed(
  landmarks: any[],
  customThreshold: number = 0.80
): DetailedClassificationResult | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const middleMcp = landmarks[9];

  // Palm scale reference: distance between wrist (0) and middle MCP (9)
  const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const palmScale = dist(wrist, middleMcp);
  if (palmScale < 0.04) return null; // hand too small or not fully in frame

  // 1. Individual Finger Extension and Curl Ratios (normalized by palmScale)
  // Joints:
  // Thumb: 1, 2, 3, 4
  // Index: 5(MCP), 6(PIP), 7(DIP), 8(TIP)
  // Middle: 9(MCP), 10(PIP), 11(DIP), 12(TIP)
  // Ring: 13(MCP), 14(PIP), 15(DIP), 16(TIP)
  // Pinky: 17(MCP), 18(PIP), 19(DIP), 20(TIP)

  const checkFingerState = (mcpIdx: number, pipIdx: number, tipIdx: number) => {
    const dWristTip = dist(wrist, landmarks[tipIdx]);
    const dWristPip = dist(wrist, landmarks[pipIdx]);
    const dMcpTip = dist(landmarks[mcpIdx], landmarks[tipIdx]);
    const dMcpPip = dist(landmarks[mcpIdx], landmarks[pipIdx]);

    const isExtended = dWristTip > dWristPip * 1.15 && dMcpTip > dMcpPip * 1.25;
    const isCurled = dWristTip < dWristPip * 1.08 || dMcpTip < dMcpPip * 0.95;
    return { isExtended, isCurled, tipDistance: dWristTip / palmScale };
  };

  const index = checkFingerState(5, 6, 8);
  const middle = checkFingerState(9, 10, 12);
  const ring = checkFingerState(13, 14, 16);
  const pinky = checkFingerState(17, 18, 20);

  // 2. Thumb Analysis
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const thumbCmc = landmarks[1];

  const thumbPointingUp =
    thumbTip.y < thumbIp.y - 0.03 * palmScale &&
    thumbIp.y < thumbMcp.y &&
    thumbTip.y < landmarks[5].y;

  const thumbPointingDown =
    thumbTip.y > thumbIp.y + 0.03 * palmScale &&
    thumbIp.y > thumbMcp.y &&
    thumbTip.y > landmarks[5].y;

  const normThumbIndexDist = dist(thumbTip, landmarks[8]) / palmScale;
  const thumbTouchingIndex = normThumbIndexDist < 0.28;

  // Finger spread (distance between index tip and pinky tip normalized)
  const fingerSpread = dist(landmarks[8], landmarks[20]) / palmScale;

  // 3. Compute probability / match scores for each of the 6 gestures
  const scores: Record<'ok_sign' | 'pointing_up' | 'open_palm' | 'folded_hands' | 'thumbs_up' | 'thumbs_down', number> = {
    ok_sign: 0.1,
    pointing_up: 0.1,
    open_palm: 0.1,
    folded_hands: 0.1,
    thumbs_up: 0.1,
    thumbs_down: 0.1,
  };

  // --- GESTURE 1: OK ("ok_sign") ---
  // Circle between thumb tip and index tip; middle, ring, pinky extended upright
  if (thumbTouchingIndex && (middle.isExtended || ring.isExtended)) {
    let okScore = 0.82;
    if (normThumbIndexDist < 0.22) okScore += 0.08;
    if (middle.isExtended && ring.isExtended) okScore += 0.06;
    if (pinky.isExtended) okScore += 0.02;
    scores.ok_sign = Math.min(0.98, okScore);
  } else if (thumbTouchingIndex && !middle.isCurled) {
    scores.ok_sign = 0.70;
  }

  // --- GESTURE 2: I HAVE A QUESTION ("pointing_up") ---
  // Index finger extended straight up, middle/ring/pinky curled into palm
  if (index.isExtended && middle.isCurled && ring.isCurled && pinky.isCurled) {
    let ptScore = 0.84;
    // Thumb should not be pointing upward like a thumbs up
    if (!thumbPointingUp) ptScore += 0.08;
    if (landmarks[8].y < landmarks[6].y - 0.05 * palmScale) ptScore += 0.04;
    scores.pointing_up = Math.min(0.97, ptScore);
  } else if (index.isExtended && middle.isCurled && ring.isCurled) {
    scores.pointing_up = 0.72;
  }

  // --- GESTURE 3: PLEASE REPEAT ("open_palm") ---
  // All 4 fingers extended and spread, thumb extended away
  if (index.isExtended && middle.isExtended && ring.isExtended && pinky.isExtended) {
    if (fingerSpread > 0.40) {
      let palmScore = 0.85;
      if (fingerSpread > 0.55) palmScore += 0.07;
      if (!thumbTouchingIndex) palmScore += 0.04;
      scores.open_palm = Math.min(0.97, palmScore);
    } else {
      scores.open_palm = 0.70;
    }
  }

  // --- GESTURE 4: THANK YOU ("folded_hands") ---
  // All 4 fingers extended upright and held closely together (low spread), thumb tucked against palm
  if (index.isExtended && middle.isExtended && ring.isExtended && pinky.isExtended) {
    if (fingerSpread <= 0.38) {
      let thankScore = 0.85;
      if (fingerSpread < 0.28) thankScore += 0.08;
      if (!thumbPointingUp && !thumbPointingDown) thankScore += 0.04;
      scores.folded_hands = Math.min(0.96, thankScore);
    }
  }

  // --- GESTURE 5: I AGREE ("thumbs_up") ---
  // Thumb pointing strictly UP, AND all other 4 fingers strictly curled into a fist!
  // CRITICAL: If any of index, middle, ring, pinky is extended, Thumbs Up is FORBIDDEN!
  const otherFingersCurled = index.isCurled && middle.isCurled && ring.isCurled && pinky.isCurled;
  const anyFingerExtended = index.isExtended || middle.isExtended || ring.isExtended || pinky.isExtended;

  if (thumbPointingUp && otherFingersCurled && !anyFingerExtended) {
    let tuScore = 0.86;
    if (thumbTip.y < thumbMcp.y - 0.08 * palmScale) tuScore += 0.08;
    if (dist(thumbTip, landmarks[8]) > 0.35 * palmScale) tuScore += 0.04;
    scores.thumbs_up = Math.min(0.98, tuScore);
  } else if (thumbPointingUp && !anyFingerExtended) {
    scores.thumbs_up = 0.68;
  } else {
    // If any finger is extended or thumb is not pointing up, thumbs_up score stays minimal
    scores.thumbs_up = 0.05;
  }

  // --- GESTURE 6: I DISAGREE ("thumbs_down") ---
  // Thumb pointing strictly DOWN, and all 4 other fingers strictly curled into a fist
  if (thumbPointingDown && otherFingersCurled && !anyFingerExtended) {
    let tdScore = 0.86;
    if (thumbTip.y > thumbMcp.y + 0.08 * palmScale) tdScore += 0.08;
    scores.thumbs_down = Math.min(0.97, tdScore);
  } else if (thumbPointingDown && !anyFingerExtended) {
    scores.thumbs_down = 0.68;
  } else {
    scores.thumbs_down = 0.05;
  }

  // Convert scores to sorted predictions
  const predictions: GesturePredictionScore[] = (
    Object.keys(scores) as Array<keyof typeof scores>
  )
    .map((g) => ({
      gesture: g,
      label: GESTURE_LABELS[g],
      confidence: Number(scores[g].toFixed(2)),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const top = predictions[0];

  // Confidence Threshold Rules as instructed:
  // < 60% -> ignore / unrecognized
  // 60-80% -> "Gesture unclear"
  // > 80% -> candidate gesture
  // > 85% sustained across frames -> confirm
  if (top.confidence < 0.60) {
    return {
      gesture: null,
      label: 'Gesture not recognized',
      confidence: top.confidence,
      status: 'unrecognized',
      predictions,
    };
  }

  if (top.confidence < 0.80) {
    return {
      gesture: null,
      label: 'Gesture unclear',
      confidence: top.confidence,
      status: 'unclear',
      predictions,
    };
  }

  return {
    gesture: top.gesture,
    label: top.label,
    confidence: top.confidence,
    status: top.confidence >= customThreshold ? 'confirmed' : 'candidate',
    predictions,
  };
}

/**
 * Standard classification wrapper for backward compatibility with existing callers.
 * Guarantees that unknown hands NEVER default to "I agree".
 */
export function classifyHandLandmarks(
  landmarks: any[],
  customThreshold: number = 0.80
): { gesture: string; confidence: number; predictions?: GesturePredictionScore[] } | null {
  const result = classifyHandLandmarksDetailed(landmarks, customThreshold);
  if (!result || !result.gesture) return null;
  return {
    gesture: result.gesture,
    confidence: result.confidence,
    predictions: result.predictions,
  };
}

/**
 * Temporal Smoothing Buffer:
 * Collects a rolling window of recent frames (default 5 frames).
 * Prevents rapid-fire false positives and eliminates duplicate triggers from continuous poses.
 */
export class RollingGestureSmoother {
  private windowSize: number;
  private history: Array<{ gesture: string; confidence: number; timestamp: number }> = [];
  private lastTriggeredGesture: string | null = null;
  private lastTriggeredTime: number = 0;
  private poseActive: boolean = false;

  constructor(windowSize: number = 5) {
    this.windowSize = windowSize;
  }

  public update(
    result: DetailedClassificationResult | null,
    now: number,
    threshold: number = 0.80,
    cooldownSec: number = 1.5
  ): {
    shouldTrigger: boolean;
    gesture: string | null;
    label: string | null;
    confidence: number;
    status: string;
  } {
    if (!result || !result.gesture) {
      // Hand dropped or unknown gesture
      this.history.push({ gesture: '', confidence: 0, timestamp: now });
      if (this.history.length > this.windowSize) this.history.shift();

      // If hand is absent for 3 consecutive frames, reset the active pose latch
      const recentEmpty = this.history.slice(-3).every((h) => h.gesture === '');
      if (recentEmpty) {
        this.poseActive = false;
      }

      return {
        shouldTrigger: false,
        gesture: null,
        label: result ? result.label : 'No hand detected',
        confidence: result ? result.confidence : 0,
        status: result ? result.status : 'unrecognized',
      };
    }

    // Add frame to history
    this.history.push({
      gesture: result.gesture,
      confidence: result.confidence,
      timestamp: now,
    });
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }

    // Count gesture occurrences in rolling window
    const counts: Record<string, { count: number; sumConf: number }> = {};
    for (const item of this.history) {
      if (!item.gesture) continue;
      if (!counts[item.gesture]) {
        counts[item.gesture] = { count: 0, sumConf: 0 };
      }
      counts[item.gesture].count += 1;
      counts[item.gesture].sumConf += item.confidence;
    }

    // Find dominant gesture in window
    let dominantGesture: string | null = null;
    let maxCount = 0;
    let avgConfidence = 0;

    for (const g of Object.keys(counts)) {
      if (counts[g].count > maxCount) {
        maxCount = counts[g].count;
        dominantGesture = g;
        avgConfidence = counts[g].sumConf / counts[g].count;
      }
    }

    // Temporal requirement: gesture must be present in at least 4 of the last 5 frames
    // and average confidence must meet the sustained threshold (>= 0.82)
    const isStableAcrossWindow =
      maxCount >= Math.min(4, this.windowSize) &&
      dominantGesture !== null &&
      avgConfidence >= threshold;

    const cooldownMs = cooldownSec * 1000;
    const cooldownElapsed = now - this.lastTriggeredTime > cooldownMs;
    const isDifferentGesture = dominantGesture !== this.lastTriggeredGesture;

    // Trigger condition:
    // Stable across frames AND (different gesture OR cooldown expired while pose released)
    if (isStableAcrossWindow && dominantGesture) {
      if ((!this.poseActive && cooldownElapsed) || (isDifferentGesture && cooldownElapsed)) {
        this.lastTriggeredGesture = dominantGesture;
        this.lastTriggeredTime = now;
        this.poseActive = true;

        return {
          shouldTrigger: true,
          gesture: dominantGesture,
          label: GESTURE_LABELS[dominantGesture] || dominantGesture,
          confidence: Number(avgConfidence.toFixed(2)),
          status: 'confirmed',
        };
      }
    }

    return {
      shouldTrigger: false,
      gesture: dominantGesture,
      label: dominantGesture ? GESTURE_LABELS[dominantGesture] : result.label,
      confidence: Number((dominantGesture ? avgConfidence : result.confidence).toFixed(2)),
      status: isStableAcrossWindow ? 'sustained' : 'candidate',
    };
  }

  public reset() {
    this.history = [];
    this.lastTriggeredGesture = null;
    this.lastTriggeredTime = 0;
    this.poseActive = false;
  }
}

/**
 * Draws the signature SaaS Hand Bounding Box matching the reference design:
 * Purple outline, corner pin handles, top gesture label tag, bottom confidence pill.
 */
export function drawHandBoundingBox(
  ctx: CanvasRenderingContext2D,
  landmarks: any[],
  width: number,
  height: number,
  gestureLabel: string,
  confidence: number = 0.95
) {
  if (!landmarks || landmarks.length < 21) return;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  // Add padding around hand
  const padX = width * 0.05;
  const padY = height * 0.05;

  const x = Math.max(12, minX * width - padX);
  const y = Math.max(12, minY * height - padY);
  const boxW = Math.min(width - x - 12, (maxX - minX) * width + padX * 2);
  const boxH = Math.min(height - y - 12, (maxY - minY) * height + padY * 2);

  ctx.save();

  // Bounding box border
  ctx.strokeStyle = '#8B5CF6';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x, y, boxW, boxH);

  // 4 Corner circular pin handles (white with purple border)
  const corners = [
    [x, y],
    [x + boxW, y],
    [x + boxW, y + boxH],
    [x, y + boxH],
  ];

  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Top Gesture Label Tag (purple badge with white text)
  if (gestureLabel) {
    const tagText = gestureLabel.toUpperCase();
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const textMetrics = ctx.measureText(tagText);
    const tagW = textMetrics.width + 18;
    const tagH = 22;
    const tagX = x + 10;
    const tagY = y - tagH / 2;

    ctx.fillStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 6);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(tagText, tagX + 9, tagY + 15);
  }

  // Bottom-Left Confidence Pill inside the video frame
  const confPct = Math.round(confidence * 100);
  const confPillW = 120;
  const confPillH = 26;
  const confPillX = 18;
  const confPillY = height - confPillH - 18;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect(confPillX, confPillY, confPillW, confPillH, 13);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw signal icon / bars
  ctx.fillStyle = '#8B5CF6';
  ctx.fillRect(confPillX + 12, confPillY + 15, 2.5, 5);
  ctx.fillRect(confPillX + 16, confPillY + 12, 2.5, 8);
  ctx.fillRect(confPillX + 20, confPillY + 9, 2.5, 11);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Confidence: ${confPct}%`, confPillX + 28, confPillY + 17);

  ctx.restore();
}

export function drawLandmarkConnections(ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) {
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // index
    [0, 9], [9, 10], [10, 11], [11, 12], // middle
    [0, 13], [13, 14], [14, 15], [15, 16], // ring
    [0, 17], [17, 18], [18, 19], [19, 20], // pinky
    [5, 9], [9, 13], [13, 17] // palm
  ];

  ctx.strokeStyle = '#00E6A0';
  ctx.lineWidth = 2.5;

  for (const [start, end] of connections) {
    const p1 = landmarks[start];
    const p2 = landmarks[end];
    ctx.beginPath();
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.stroke();
  }

  // Draw points
  ctx.fillStyle = '#FFFFFF';
  for (const p of landmarks) {
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}

export interface CompositeOverlayData {
  text: string;
  category: string;
  gestureLabel: string;
  alpha: number; // 0.0 to 1.0
  timestamp?: string;
}

/**
 * 5. VIDEO COMPOSITOR: Burns the communication overlay directly into the canvas pixels.
 * Pipeline: Physical Webcam -> MediaPipe Processing -> Canvas Compositing -> Final Video Frame (captureStream)
 */
export function drawVideoCompositeOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  overlay: CompositeOverlayData,
  mirrored: boolean = true
) {
  if (overlay.alpha <= 0.01) return;

  ctx.save();

  // If the canvas element is flipped via CSS -scale-x-100, we pre-flip the drawing coordinates
  // so the text renders right-side-up and forwards for the human viewer
  if (mirrored) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  ctx.globalAlpha = Math.max(0, Math.min(1, overlay.alpha));

  // Banner metrics (scaled nicely to video resolution)
  const isSmall = width < 480;
  const bannerWidth = Math.min(width * 0.88, isSmall ? 360 : 540);
  const bannerHeight = isSmall ? 68 : 84;
  const x = (width - bannerWidth) / 2;
  const y = height - bannerHeight - (isSmall ? 16 : 28);
  const radius = 16;

  // Background card with blur/shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  // Rounded rectangle container
  ctx.beginPath();
  ctx.roundRect(x, y, bannerWidth, bannerHeight, radius);
  ctx.fillStyle = '#06131D';
  ctx.fill();

  // Subtle gradient glow border
  ctx.lineWidth = 2;
  const borderGrad = ctx.createLinearGradient(x, y, x + bannerWidth, y + bannerHeight);
  borderGrad.addColorStop(0, '#00E6A0');
  borderGrad.addColorStop(0.5, '#0084FF');
  borderGrad.addColorStop(1, '#00E6A0');
  ctx.strokeStyle = borderGrad;
  ctx.stroke();

  // Reset shadow for crisp text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Left accent indicator
  ctx.beginPath();
  ctx.roundRect(x + 14, y + 14, 5, bannerHeight - 28, 2.5);
  ctx.fillStyle = '#00E6A0';
  ctx.fill();

  // Top header text: Gesture & Category Badge
  ctx.font = `600 ${isSmall ? 10 : 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#00E6A0';
  ctx.fillText(
    `[${overlay.category.toUpperCase()}]  ${overlay.gestureLabel.toUpperCase()}`,
    x + 32,
    y + (isSmall ? 26 : 30)
  );

  // Main Communication Text: Bold, high contrast
  ctx.font = `700 ${isSmall ? 16 : 22}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(overlay.text, x + 32, y + (isSmall ? 50 : 58));

  // Small watermark on bottom right: Real Compositor verification
  ctx.font = `500 ${isSmall ? 8 : 9}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  const tag = 'DIRECTSHOW COMPOSITE';
  const tagWidth = ctx.measureText(tag).width;
  ctx.fillText(tag, x + bannerWidth - tagWidth - 16, y + (isSmall ? 26 : 30));

  ctx.restore();
}
