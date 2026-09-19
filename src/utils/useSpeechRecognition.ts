import { useState, useEffect, useRef, useCallback } from 'react';

export interface SpeechTranscriptItem {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isFinal: boolean;
  type: 'speech' | 'gesture' | 'macro';
}

interface UseSpeechRecognitionOptions {
  onFinalTranscript?: (item: SpeechTranscriptItem) => void;
  speakerName?: string;
  language?: string;
}

export function useSpeechRecognition({
  onFinalTranscript,
  speakerName = 'You',
  language = 'en-US',
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimText, setInterimText] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(true);
  const onFinalCallbackRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalCallbackRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Check speech recognition API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Audio visualizer analyzer loop
  const updateAudioMeter = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS volume level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const normalized = Math.min(100, Math.round((average / 128) * 100));
    setAudioLevel(normalized);

    animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startAudioMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      microphoneStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      updateAudioMeter();
    } catch (err: any) {
      console.warn('Audio metering stream access skipped or denied:', err);
    }
  }, [updateAudioMeter]);

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore if already stopped
      }
    }
    stopAudioMeter();
    setIsListening(false);
    setInterimText('');
  }, [stopAudioMeter]);

  const startListening = useCallback(() => {
    setError(null);
    isManuallyStoppedRef.current = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('SpeechRecognition API not available in this browser environment.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const trimmed = transcript.trim();
            if (trimmed) {
              const now = new Date();
              const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const item: SpeechTranscriptItem = {
                id: `stt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                speaker: speakerName,
                text: trimmed,
                timestamp: timeStr,
                isFinal: true,
                type: 'speech',
              };
              if (onFinalCallbackRef.current) {
                onFinalCallbackRef.current(item);
              }
            }
          } else {
            interim += transcript;
          }
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Expected during pauses in speech
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        console.warn('Speech recognition event error:', event.error);
        setError(`Microphone error: ${event.error}`);
      };

      recognition.onend = () => {
        // Automatically restart if not manually stopped (continuous stream mode)
        if (!isManuallyStoppedRef.current) {
          try {
            recognition.start();
          } catch (err) {
            // Already active or prevented
          }
        } else {
          setIsListening(false);
          setInterimText('');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      startAudioMeter();
    } catch (err: any) {
      console.error('Failed to initialize Speech Recognition:', err);
      setError(err.message || 'Failed to start speech recognition');
      setIsListening(false);
    }
  }, [language, speakerName, startAudioMeter]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isManuallyStoppedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // clean exit
        }
      }
      stopAudioMeter();
    };
  }, [stopAudioMeter]);

  return {
    isListening,
    interimText,
    audioLevel,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
