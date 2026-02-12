/**
 * Chạy SpeechRecognition (Web Speech API) song song với ghi âm.
 * Trả về transcript cuối cùng để so sánh với từ khóa (validate script).
 * Lưu ý: Chỉ Chrome/Edge hỗ trợ; Firefox không có SpeechRecognition.
 *
 * TRÊN ĐIỆN THOẠI (MOBILE):
 * - Web Speech API thường KHÔNG detect được khi truy cập qua HTTP (không phải HTTPS).
 * - Trình duyệt chỉ bật SpeechRecognition trong "secure context" (HTTPS hoặc localhost).
 * - Khi vào web bằng địa chỉ http://192.168.x.x hoặc http://tên-miền (không SSL)
 *   thì window.SpeechRecognition / window.webkitSpeechRecognition sẽ là undefined.
 * - Cách khắc phục: truy cập qua HTTPS (ví dụ https://your-domain.com hoặc tunnel HTTPS như ngrok).
 * - iOS Safari: hỗ trợ một phần từ 14.5+; Chrome Android: hỗ trợ một phần.
 */

const LANG = "vi-VN";
/** Trên mobile, kết quả final thường đến trễ sau stop(); cần chờ lâu hơn. */
const RECOGNITION_TIMEOUT_AFTER_STOP_MS = 3000;

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
  onerror: ((e: any) => void) | null;
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

/** Lý do Speech Recognition không dùng được (để hiển thị gợi ý cho user). Trả về null nếu đang hỗ trợ. */
export function getSpeechRecognitionUnsupportedReason(): "secure_context" | "not_supported" | null {
  if (typeof window === "undefined") return "not_supported";
  if (window.SpeechRecognition || window.webkitSpeechRecognition) return null;
  // Trên mobile, API thường bị ẩn khi không dùng HTTPS (secure context).
  if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
    return "secure_context";
  }
  return "not_supported";
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
    /** Trên mobile/Safari thường chỉ có interim, ít hoặc không có final; dùng interim làm fallback. */
    let lastInterimTranscript = "";
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
      const toResolve = transcript.trim() || lastInterimTranscript.trim();
      resolve(toResolve);
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const results = e.results;
      let combinedFinal = "";
      let combinedAny = "";
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const alt = result[0];
        if (!alt) continue;
        const text = (alt as SpeechRecognitionAlternative).transcript || "";
        combinedAny += (combinedAny ? " " : "") + text;
        if (result.isFinal) combinedFinal += (combinedFinal ? " " : "") + text;
      }
      if (combinedFinal) finalTranscript = combinedFinal;
      if (combinedAny) lastInterimTranscript = combinedAny;
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
