/**
 * Chạy SpeechRecognition (Web Speech API) song song với ghi âm.
 * Trả về transcript cuối cùng để so sánh với từ khóa (validate script).
 * Lưu ý: Chỉ Chrome/Edge hỗ trợ; Firefox không có SpeechRecognition.
 */

const LANG = "vi-VN";
const RECOGNITION_TIMEOUT_AFTER_STOP_MS = 1500;

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export interface TranscriptCapture {
  promise: Promise<string>;
  stop: () => void;
}

/**
 * Chạy recognition (tối đa durationMs), thu thập transcript (ưu tiên kết quả final).
 * Trả về { promise, stop }: gọi stop() khi recorder dừng để resolve sớm với transcript hiện có.
 * Nếu không gọi stop(), promise vẫn resolve sau durationMs.
 */
export function captureTranscriptWhileRecording(durationMs: number): TranscriptCapture {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return { promise: Promise.resolve(""), stop: () => {} };
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let fallbackId: ReturnType<typeof setTimeout> | null = null;
  let stopFn: (() => void) | null = null;

  const promise = new Promise<string>((resolve) => {
    const recognition = new Recognition() as SpeechRecognitionInstance;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = LANG;

    let finalTranscript = "";
    let resolved = false;

    const finish = (transcript: string) => {
      if (resolved) return;
      resolved = true;
      if (timeoutId != null) clearTimeout(timeoutId);
      if (fallbackId != null) clearTimeout(fallbackId);
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      resolve(transcript.trim());
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const results = e.results;
      let combined = "";
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (!result.isFinal) continue;
        const alt = result[0];
        if (!alt) continue;
        const text = (alt as SpeechRecognitionAlternative).transcript || "";
        combined += (combined ? " " : "") + text;
      }
      if (combined) finalTranscript = combined;
    };

    recognition.onend = () => {
      finish(finalTranscript);
    };

    recognition.onerror = () => {
      finish(finalTranscript);
    };

    try {
      recognition.start();
    } catch (err) {
      finish("");
      return;
    }

    const stopNow = () => {
      try {
        recognition.stop();
      } catch {
        finish(finalTranscript);
      }
      fallbackId = setTimeout(() => finish(finalTranscript), RECOGNITION_TIMEOUT_AFTER_STOP_MS);
    };

    stopFn = stopNow;
    timeoutId = setTimeout(stopNow, durationMs);
  });

  return {
    promise,
    stop: () => {
      stopFn?.();
    },
  };
}
