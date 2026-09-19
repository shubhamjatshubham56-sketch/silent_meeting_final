import { CustomGesture, GestureDiagnostics } from '../types';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

export interface LandmarkFeatures {
  normalized: NormalizedLandmark[];
  scale: number;
  isThumbExtended: boolean;
  isIndexExtended: boolean;
  isMiddleExtended: boolean;
  isRingExtended: boolean;
  isPinkyExtended: boolean;
  thumbDirectionUp: boolean;
  indexMiddleSeparation: number;
  handBoundingBoxValid: boolean;
}

export interface GestureVerificationResult {
  candidateId: string | null;
  candidateLabel: string;
  verified: boolean;
  rawConfidence: number;
  rejectionReason?: string;
  ambiguity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EngineFrameOutput {
  diagnostics: GestureDiagnostics;
  confirmedGesture: {
    id: string;
    label: string;
    message: string;
    category: string;
  } | null;
  stabilizingEvent?: {
    label: string;
    confidence: number;
  } | null;
}

/**
 * 21. LANDMARK NORMALIZATION
 * Wrist is landmark[0] as origin.
 * Scale normalized using distance between wrist (0) and middle MCP (9).
 */
export interface LandmarkFeatures {
  normalized: NormalizedLandmark[];
  scale: number;
  isThumbExtended: boolean;
  isThumbCurled: boolean;
  isIndexExtended: boolean;
  isIndexCurled: boolean;
  isMiddleExtended: boolean;
  isMiddleCurled: boolean;
  isRingExtended: boolean;
  isRingCurled: boolean;
  isPinkyExtended: boolean;
  isPinkyCurled: boolean;
  thumbDirectionUp: boolean;
  thumbIndexDistance: number;
  thumbMiddleDistance: number;
  indexMiddleSeparation: number;
  handBoundingBoxValid: boolean;
}

export interface GestureVerificationResult {
  candidateId: string | null;
  candidateLabel: string;
  verified: boolean;
  rawConfidence: number;
  rejectionReason?: string;
  ambiguity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EngineFrameOutput {
  diagnostics: GestureDiagnostics;
  confirmedGesture: {
    id: string;
    label: string;
    message: string;
    category: string;
  } | null;
  stabilizingEvent?: {
    label: string;
    confidence: number;
  } | null;
}

/**
 * 21. LANDMARK NORMALIZATION & ROTATION-INVARIANT FINGER STATE ENGINE
 * Wrist is landmark[0] as origin.
 * Scale normalized using distance between wrist (0) and middle MCP (9).
 */
export function extractLandmarkFeatures(landmarks: any[]): LandmarkFeatures | null {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];

  // Check if hand is sufficiently inside frame (Section 27: Hand occlusion / poor detection)
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  // Hand bounding box validation: reject hands truncated by frame edge
  const handBoundingBoxValid =
    minX > 0.02 && maxX < 0.98 && minY > 0.02 && maxY < 0.98 && (maxX - minX > 0.08) && (maxY - minY > 0.08);

  const rawDist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y, (p1.z || 0) - (p2.z || 0));
  const palmScale = rawDist(wrist, landmarks[9]) || 0.2;

  // Normalized coordinates centered at wrist and scaled
  const normalized: NormalizedLandmark[] = landmarks.map((pt) => ({
    x: (pt.x - wrist.x) / palmScale,
    y: (pt.y - wrist.y) / palmScale,
    z: ((pt.z || 0) - (wrist.z || 0)) / palmScale,
  }));

  const distNorm = (i: number, j: number) =>
    Math.hypot(normalized[i].x - normalized[j].x, normalized[i].y - normalized[j].y);

  // Rotation-invariant finger extension calculation
  // For each finger: check wrist-to-tip vs wrist-to-PIP, and MCP-to-tip vs MCP-to-PIP
  const evalFinger = (mcp: number, pip: number, _dip: number, tip: number) => {
    const dWristTip = distNorm(0, tip);
    const dWristPip = distNorm(0, pip) || 0.001;
    const dMcpTip = distNorm(mcp, tip);
    const dMcpPip = distNorm(mcp, pip) || 0.001;

    const ratioWrist = dWristTip / dWristPip;
    const ratioMcp = dMcpTip / dMcpPip;

    const isExtended = ratioWrist > 1.25 && ratioMcp > 1.52;
    const isCurled = ratioWrist < 1.08 && ratioMcp < 1.20;

    return { isExtended, isCurled };
  };

  const indexState = evalFinger(5, 6, 7, 8);
  const middleState = evalFinger(9, 10, 11, 12);
  const ringState = evalFinger(13, 14, 15, 16);
  const pinkyState = evalFinger(17, 18, 19, 20);

  // Thumb analysis:
  // Thumb tip is 4, IP is 3, MCP is 2. Index MCP is 5, Middle MCP is 9.
  const thumbTip = normalized[4];
  const thumbMcp = normalized[2];
  const dThumbWrist = distNorm(0, 4);
  const dThumbMcp = distNorm(2, 4);
  const dThumbIndexMcp = distNorm(5, 4);
  const dThumbMiddleMcp = distNorm(9, 4);

  // Thumb extended away from palm
  const isThumbExtended = dThumbMcp > 0.62 && dThumbIndexMcp > 0.48 && dThumbWrist > 0.90;
  // Thumb curled against palm/fingers (e.g. in a fist or victory)
  const isThumbCurled = dThumbIndexMcp < 0.40 || dThumbMiddleMcp < 0.45;
  // Thumb pointing generally upward in screen coordinate space
  const thumbDirectionUp = thumbTip.y < thumbMcp.y - 0.22 && thumbTip.y < -0.30;

  // Separation between index tip and middle tip for Victory verification
  const indexMiddleSeparation = distNorm(8, 12);

  return {
    normalized,
    scale: palmScale,
    isThumbExtended,
    isThumbCurled,
    isIndexExtended: indexState.isExtended,
    isIndexCurled: indexState.isCurled,
    isMiddleExtended: middleState.isExtended,
    isMiddleCurled: middleState.isCurled,
    isRingExtended: ringState.isExtended,
    isRingCurled: ringState.isCurled,
    isPinkyExtended: pinkyState.isExtended,
    isPinkyCurled: pinkyState.isCurled,
    thumbDirectionUp,
    thumbIndexDistance: dThumbIndexMcp,
    thumbMiddleDistance: dThumbMiddleMcp,
    indexMiddleSeparation,
    handBoundingBoxValid,
  };
}

/**
 * 15, 17, 18, 19, 20: MULTI-STAGE GESTURE VERIFIER
 * Primary gestures:
 * 1. Thumbs Up -> "I AGREE"
 * 2. Open Palm -> "PLEASE WAIT"
 * 3. Victory -> "I HAVE A QUESTION"
 *
 * CRITICAL DIRECTIVE: A wrong gesture must NEVER be preferred over uncertainty.
 * If the system cannot confidently distinguish a gesture, NO GESTURE / UNCERTAIN is returned.
 */
export function verifyPrimaryGestures(
  features: LandmarkFeatures,
  customGestures: CustomGesture[] = []
): GestureVerificationResult {
  const {
    isThumbExtended,
    isThumbCurled,
    isIndexExtended,
    isIndexCurled,
    isMiddleExtended,
    isMiddleCurled,
    isRingExtended,
    isRingCurled,
    isPinkyExtended,
    isPinkyCurled,
    thumbDirectionUp,
    thumbIndexDistance,
    indexMiddleSeparation,
    handBoundingBoxValid,
    normalized,
  } = features;

  if (!handBoundingBoxValid) {
    return {
      candidateId: null,
      candidateLabel: 'UNCERTAIN',
      verified: false,
      rawConfidence: 0.2,
      rejectionReason: 'Hand partially outside camera frame or too small',
      ambiguity: 'HIGH',
    };
  }

  // 1. THUMBS UP VERIFICATION
  // - Thumb must be extended, pointing upward, and distinctly separated from index finger MCP
  // - All 4 other fingers (Index, Middle, Ring, Pinky) MUST be strictly curled
  // - CRITICAL ANTI-CONFUSION: A closed fist with thumb resting on side has small thumbIndexDistance (<= 0.44).
  //   It must NEVER trigger Thumbs Up!
  const allFourFingersCurled = isIndexCurled && isMiddleCurled && isRingCurled && isPinkyCurled;
  const noOtherFingerExtended = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;

  if (allFourFingersCurled && noOtherFingerExtended) {
    if (isThumbExtended && thumbDirectionUp && thumbIndexDistance > 0.48) {
      return {
        candidateId: 'thumbs_up',
        candidateLabel: 'Thumbs Up',
        verified: true,
        rawConfidence: 0.96,
        ambiguity: 'LOW',
      };
    } else if (isThumbCurled || thumbIndexDistance <= 0.44) {
      // Closed fist resting posture -> Neutral, not Thumbs Up
      return {
        candidateId: null,
        candidateLabel: 'NEUTRAL',
        verified: false,
        rawConfidence: 0.1,
        rejectionReason: 'Fist resting posture (Thumb folded)',
        ambiguity: 'LOW',
      };
    }
  }

  // 2. OPEN PALM VERIFICATION
  // - ALL 5 digits (Thumb, Index, Middle, Ring, Pinky) MUST be fully extended
  // - NONE of the 5 fingers may be curled or semi-curled
  // - Adjacent finger tips must have open separation
  const allFiveExtended =
    isIndexExtended &&
    isMiddleExtended &&
    isRingExtended &&
    isPinkyExtended &&
    isThumbExtended;
  const noneCurled =
    !isIndexCurled &&
    !isMiddleCurled &&
    !isRingCurled &&
    !isPinkyCurled &&
    !isThumbCurled;

  if (allFiveExtended && noneCurled) {
    return {
      candidateId: 'open_palm',
      candidateLabel: 'Open Palm',
      verified: true,
      rawConfidence: 0.95,
      ambiguity: 'LOW',
    };
  }

  // 3. VICTORY VERIFICATION
  // - Index and Middle MUST be extended and not curled
  // - Ring and Pinky MUST be strictly curled and not extended
  // - Index and Middle tips MUST have clear geometric separation (> 0.26)
  // - Thumb must NOT be pointing upward in a thumbs-up posture
  const indexAndMiddleExtended = isIndexExtended && middleStateExtendedValid(features);
  const ringAndPinkyCurled = isRingCurled && isPinkyCurled && !isRingExtended && !isPinkyExtended;

  if (indexAndMiddleExtended && ringAndPinkyCurled) {
    if (indexMiddleSeparation > 0.26 && !(isThumbExtended && thumbDirectionUp)) {
      return {
        candidateId: 'victory',
        candidateLabel: 'Victory',
        verified: true,
        rawConfidence: 0.94,
        ambiguity: 'LOW',
      };
    } else if (indexMiddleSeparation <= 0.26) {
      return {
        candidateId: null,
        candidateLabel: 'UNCERTAIN',
        verified: false,
        rawConfidence: 0.55,
        rejectionReason: 'Index and middle fingers not sufficiently separated for Victory',
        ambiguity: 'MEDIUM',
      };
    }
  }

  // Helper function for middle extension check
  function middleStateExtendedValid(f: LandmarkFeatures) {
    return f.isMiddleExtended && !f.isMiddleCurled;
  }

  // Check Custom Gestures if enabled (Cosine similarity on normalized 3D vectors)
  if (customGestures && customGestures.length > 0) {
    const flatFeatures = normalized.flatMap((n) => [n.x, n.y, n.z]);

    for (const cg of customGestures) {
      if (!cg.enabled || !cg.template?.feature_vector?.length) continue;
      const targetVec = cg.template.feature_vector;
      if (targetVec.length !== flatFeatures.length) continue;

      // Cosine similarity
      let dot = 0, normA = 0, normB = 0;
      for (let i = 0; i < flatFeatures.length; i++) {
        dot += flatFeatures[i] * targetVec[i];
        normA += flatFeatures[i] * flatFeatures[i];
        normB += targetVec[i] * targetVec[i];
      }
      const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);

      if (similarity >= (cg.threshold || 0.88)) {
        return {
          candidateId: cg.id,
          candidateLabel: cg.name,
          verified: true,
          rawConfidence: similarity,
          ambiguity: 'LOW',
        };
      }
    }
  }

  // Strict Ambiguity & Neutral Rejection
  const extendedCount = [
    isThumbExtended,
    isIndexExtended,
    isMiddleExtended,
    isRingExtended,
    isPinkyExtended,
  ].filter(Boolean).length;

  if (extendedCount === 0) {
    return {
      candidateId: null,
      candidateLabel: 'NEUTRAL',
      verified: false,
      rawConfidence: 0.1,
      rejectionReason: 'Hand in neutral resting state',
      ambiguity: 'LOW',
    };
  }

  // When posture is ambiguous (e.g. 3 fingers, loose fist, pointing finger, transition)
  return {
    candidateId: null,
    candidateLabel: 'UNCERTAIN',
    verified: false,
    rawConfidence: 0.4,
    rejectionReason: 'Ambiguous or partially formed posture',
    ambiguity: 'HIGH',
  };
}

/**
 * 23. TEMPORAL STABILIZATION & STATE MACHINE ENGINE
 * Enforces:
 * - 15-30 frame circular buffer
 * - Exponential Moving Average (EMA) confidence smoothing
 * - Hold duration (1.0 - 1.5s)
 * - Neutral Reset (Section 26: user holding gesture does not repeat trigger)
 * - Cooldown (2.0s)
 */
export class RobustGestureStateMachine {
  private history: { candidateId: string | null; confidence: number; timestamp: number }[] = [];
  private state: 'NEUTRAL' | 'DETECTING' | 'CANDIDATE' | 'CONFIRMED' | 'DISPLAYING' | 'COOLDOWN' | 'UNCERTAIN' = 'NEUTRAL';
  private smoothedConfidence: number = 0;
  private currentCandidateId: string | null = null;
  private candidateStartTime: number = 0;
  private lastConfirmedGestureId: string | null = null;
  private cooldownUntilTime: number = 0;
  private holdDurationMs: number = 1000; // 1.0 second hold requirement
  private neutralResetRequired: boolean = false;
  private lastFrameTimestamp: number = Date.now();
  private fps: number = 30;
  private lastWristPos: { x: number; y: number } | null = null;

  constructor(holdDurationMs: number = 1000) {
    this.holdDurationMs = holdDurationMs;
  }

  public setHoldDuration(ms: number) {
    this.holdDurationMs = Math.max(500, Math.min(2500, ms));
  }

  public processFrame(
    landmarks: any[] | null,
    customGestures: CustomGesture[] = []
  ): EngineFrameOutput {
    const now = Date.now();
    const dt = now - this.lastFrameTimestamp;
    this.lastFrameTimestamp = now;
    if (dt > 0) {
      this.fps = Math.round(0.9 * this.fps + 0.1 * (1000 / dt));
    }

    if (!landmarks || landmarks.length < 21) {
      // Hand dropped / out of frame
      this.history = [];
      this.currentCandidateId = null;
      this.candidateStartTime = 0;
      this.neutralResetRequired = false;
      this.smoothedConfidence = 0;
      if (now < this.cooldownUntilTime) {
        this.state = 'COOLDOWN';
      } else {
        this.state = 'NEUTRAL';
      }

      return {
        diagnostics: {
          candidate: null,
          candidateLabel: 'No Hand Detected',
          rawConfidence: 0,
          smoothedConfidence: 0,
          landmarkVerification: 'IDLE',
          temporalStability: 'IDLE',
          ambiguityScore: 'LOW',
          state: this.state,
          holdProgress: 0,
          fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
          fps: this.fps,
          latencyMs: Math.max(1, dt),
        },
        confirmedGesture: null,
      };
    }

    const features = extractLandmarkFeatures(landmarks);
    if (!features) {
      return {
        diagnostics: {
          candidate: null,
          candidateLabel: 'Incomplete Hand Mesh',
          rawConfidence: 0,
          smoothedConfidence: 0,
          landmarkVerification: 'FAIL',
          temporalStability: 'IDLE',
          ambiguityScore: 'HIGH',
          state: 'UNCERTAIN',
          holdProgress: 0,
          fingerStates: { thumb: false, index: false, middle: false, ring: false, pinky: false },
          fps: this.fps,
          latencyMs: Math.max(1, dt),
        },
        confirmedGesture: null,
      };
    }

    // Hand velocity filter: if hand is moving rapidly across the frame, user is repositioning
    const wrist = landmarks[0];
    let wristVelocity = 0;
    if (this.lastWristPos) {
      wristVelocity = Math.hypot(wrist.x - this.lastWristPos.x, wrist.y - this.lastWristPos.y);
    }
    this.lastWristPos = { x: wrist.x, y: wrist.y };

    if (wristVelocity > 0.08) {
      this.currentCandidateId = null;
      this.candidateStartTime = 0;
      this.state = 'UNCERTAIN';
      return {
        diagnostics: {
          candidate: null,
          candidateLabel: 'Hand in Motion',
          rawConfidence: 0,
          smoothedConfidence: Math.round(this.smoothedConfidence * 100),
          landmarkVerification: 'IDLE',
          temporalStability: 'IDLE',
          ambiguityScore: 'HIGH',
          state: 'UNCERTAIN',
          holdProgress: 0,
          fingerStates: {
            thumb: features.isThumbExtended,
            index: features.isIndexExtended,
            middle: features.isMiddleExtended,
            ring: features.isRingExtended,
            pinky: features.isPinkyExtended,
          },
          fps: this.fps,
          latencyMs: Math.max(1, dt),
        },
        confirmedGesture: null,
      };
    }

    const verification = verifyPrimaryGestures(features, customGestures);

    // Confidence Smoothing via Exponential Moving Average (EMA)
    const alpha = 0.25;
    this.smoothedConfidence = alpha * verification.rawConfidence + (1 - alpha) * this.smoothedConfidence;

    // Maintain temporal history buffer of last 25 frames
    this.history.push({
      candidateId: verification.candidateId,
      confidence: verification.rawConfidence,
      timestamp: now,
    });
    if (this.history.length > 25) this.history.shift();

    // Check Cooldown
    if (now < this.cooldownUntilTime) {
      this.state = 'COOLDOWN';
      return {
        diagnostics: {
          candidate: verification.candidateId,
          candidateLabel: verification.candidateLabel,
          rawConfidence: Math.round(verification.rawConfidence * 100),
          smoothedConfidence: Math.round(this.smoothedConfidence * 100),
          landmarkVerification: verification.verified ? 'PASS' : 'FAIL',
          temporalStability: 'IDLE',
          ambiguityScore: verification.ambiguity,
          state: 'COOLDOWN',
          holdProgress: 0,
          fingerStates: {
            thumb: features.isThumbExtended,
            index: features.isIndexExtended,
            middle: features.isMiddleExtended,
            ring: features.isRingExtended,
            pinky: features.isPinkyExtended,
          },
          fps: this.fps,
          latencyMs: Math.max(1, dt),
        },
        confirmedGesture: null,
      };
    }

    // Neutral Reset Enforcement (Section 26)
    // If user previously confirmed a gesture and hasn't lowered or returned hand to neutral, do not re-confirm
    if (this.neutralResetRequired) {
      if (verification.candidateId === null || verification.candidateLabel === 'NEUTRAL') {
        this.neutralResetRequired = false;
        this.state = 'NEUTRAL';
      } else {
        // Still holding same gesture
        return {
          diagnostics: {
            candidate: verification.candidateId,
            candidateLabel: verification.candidateLabel,
            rawConfidence: Math.round(verification.rawConfidence * 100),
            smoothedConfidence: Math.round(this.smoothedConfidence * 100),
            landmarkVerification: 'PASS',
            temporalStability: 'PASS',
            ambiguityScore: 'LOW',
            state: 'DISPLAYING',
            holdProgress: 100,
            fingerStates: {
              thumb: features.isThumbExtended,
              index: features.isIndexExtended,
              middle: features.isMiddleExtended,
              ring: features.isRingExtended,
              pinky: features.isPinkyExtended,
            },
            fps: this.fps,
            latencyMs: Math.max(1, dt),
          },
          confirmedGesture: null,
        };
      }
    }

    // Candidate Tracking
    if (!verification.verified || !verification.candidateId) {
      this.currentCandidateId = null;
      this.candidateStartTime = 0;
      this.state = verification.ambiguity === 'HIGH' ? 'UNCERTAIN' : 'NEUTRAL';

      return {
        diagnostics: {
          candidate: null,
          candidateLabel: verification.candidateLabel,
          rawConfidence: Math.round(verification.rawConfidence * 100),
          smoothedConfidence: Math.round(this.smoothedConfidence * 100),
          landmarkVerification: verification.candidateLabel === 'NEUTRAL' ? 'IDLE' : 'FAIL',
          temporalStability: 'IDLE',
          ambiguityScore: verification.ambiguity,
          state: this.state,
          holdProgress: 0,
          fingerStates: {
            thumb: features.isThumbExtended,
            index: features.isIndexExtended,
            middle: features.isMiddleExtended,
            ring: features.isRingExtended,
            pinky: features.isPinkyExtended,
          },
          fps: this.fps,
          latencyMs: Math.max(1, dt),
        },
        confirmedGesture: null,
      };
    }

    // A valid candidate was detected!
    if (this.currentCandidateId !== verification.candidateId) {
      // New candidate started
      this.currentCandidateId = verification.candidateId;
      this.candidateStartTime = now;
      this.state = 'DETECTING';
    }

    const elapsed = now - this.candidateStartTime;
    const holdProgress = Math.min(100, Math.round((elapsed / this.holdDurationMs) * 100));

    // Stabilizing feedback
    let stabilizingEvent: { label: string; confidence: number } | null = null;
    if (elapsed > 200 && elapsed < this.holdDurationMs) {
      this.state = 'CANDIDATE';
      stabilizingEvent = {
        label: verification.candidateLabel,
        confidence: Math.round(this.smoothedConfidence * 100),
      };
    }

    // Check if temporal stability threshold is reached (1.0 - 1.5s)
    if (elapsed >= this.holdDurationMs && this.smoothedConfidence >= 0.75) {
      this.state = 'CONFIRMED';
      this.lastConfirmedGestureId = verification.candidateId;
      this.neutralResetRequired = true; // Must return to neutral before triggering again
      this.cooldownUntilTime = now + 2000; // 2.0s cooldown
      this.candidateStartTime = 0;

      // Construct confirmed message mapping
      let message = 'I AGREE';
      let category = 'Agreement';

      if (verification.candidateId === 'thumbs_up') {
        message = 'I AGREE';
        category = 'Agreement';
      } else if (verification.candidateId === 'open_palm') {
        message = 'PLEASE WAIT';
        category = 'Attention';
      } else if (verification.candidateId === 'victory') {
        message = 'I HAVE A QUESTION';
        category = 'Participation';
      } else {
        // Custom gesture lookup
        const custom = customGestures.find((c) => c.id === verification.candidateId);
        if (custom) {
          message = custom.message;
          category = custom.intent || 'Custom';
        }
      }

      return {
        diagnostics: {
          candidate: verification.candidateId,
          candidateLabel: verification.candidateLabel,
          rawConfidence: Math.round(verification.rawConfidence * 100),
          smoothedConfidence: Math.round(this.smoothedConfidence * 100),
          landmarkVerification: 'PASS',
          temporalStability: 'PASS',
          ambiguityScore: 'LOW',
          state: 'CONFIRMED',
          holdProgress: 100,
          fingerStates: {
            thumb: features.isThumbExtended,
            index: features.isIndexExtended,
            middle: features.isMiddleExtended,
            ring: features.isRingExtended,
            pinky: features.isPinkyExtended,
          },
          fps: this.fps,
          latencyMs: Math.max(1, dt),
        },
        confirmedGesture: {
          id: verification.candidateId,
          label: verification.candidateLabel,
          message,
          category,
        },
        stabilizingEvent: null,
      };
    }

    return {
      diagnostics: {
        candidate: verification.candidateId,
        candidateLabel: verification.candidateLabel,
        rawConfidence: Math.round(verification.rawConfidence * 100),
        smoothedConfidence: Math.round(this.smoothedConfidence * 100),
        landmarkVerification: 'PASS',
        temporalStability: 'STABILIZING',
        ambiguityScore: 'LOW',
        state: this.state,
        holdProgress,
        fingerStates: {
          thumb: features.isThumbExtended,
          index: features.isIndexExtended,
          middle: features.isMiddleExtended,
          ring: features.isRingExtended,
          pinky: features.isPinkyExtended,
        },
        fps: this.fps,
        latencyMs: Math.max(1, dt),
      },
      confirmedGesture: null,
      stabilizingEvent,
    };
  }
}
