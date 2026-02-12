"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Info } from "lucide-react";
import axios from "axios";
import { getApiBase } from "@/lib/api";
import SentenceProgress from "./components/SentenceProgress";
import SentenceTabs from "./components/SentenceTabs";
import SentenceCard from "./components/SentenceCard";
import CompletionMessage from "./components/CompletionMessage";
import { validateSentenceAudio } from "./utils/validateSentenceAudio";
import { validateSentenceScript } from "../keyword/utils/validateScript";
import { isSpeechRecognitionSupported, getSpeechRecognitionUnsupportedReason } from "../keyword/utils/speechRecognitionCapture";
import { upsertProgress } from "../lib/sessionApi";

/* =======================
   Types
======================= */

type Sentence = {
  id: number;
  text: string;
  keyword: string;
};

export type ValidationState =
  | { status: "idle" }
  | { status: "frontend_error"; message: string }
  | { status: "validating_backend" }
  | { status: "backend_error"; message: string }
  | { status: "success"; message: string };


type BackendValidationResult = {
  valid: boolean;
  message: string;
  suggested_start?: number;
  suggested_end?: number;
};

export default function SentenceRecorder({
  userId,
  sessionId,
  onComplete,
}: {
  userId: number | null;
  sessionId?: number | null;
  onComplete?: () => void;
}) {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [validationState, setValidationState] = useState<ValidationState>({ status: "idle" });
  const [backendValidation, setBackendValidation] = useState<BackendValidationResult | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 30]);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false); // <-- Thêm state này
  const [speechUnsupportedReason, setSpeechUnsupportedReason] = useState<"secure_context" | "not_supported" | null>(null);

  const currentSentence = useMemo(
    () => sentences[currentIdx],
    [sentences, currentIdx]
  );

  const isLastSentence = currentIdx === sentences.length - 1;
  const isCompleted = currentSentence && completed.has(currentSentence.id);

  useEffect(() => {
    if (!userId) return;

    const fetchSentences = async () => {
      try {
        const res = await fetch(`${getApiBase()}/user/sentence/assign/${userId}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!res.ok) throw new Error("Không thể tải danh sách câu");

        const data = await res.json();
        setSentences(data.sentences || []);
      } catch (err) {
        console.error(err);
        alert("Lỗi tải danh sách câu");
      }
    };

    fetchSentences();
  }, [userId]);

  const resetRecording = () => {
    audioUrl && URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRange([0, 30]);
    setBackendValidation(null);
    setValidationState({ status: "idle" });
  };

  useEffect(() => {
    setSpeechUnsupportedReason(getSpeechRecognitionUnsupportedReason());
  }, []);

  useEffect(() => {
    resetRecording();
  }, [currentIdx]);

  const validateFrontendAudio = async (blob: Blob): Promise<boolean> => {
    const result = await validateSentenceAudio(blob);
    if (!result.accepted) {
      setValidationState({
        status: "frontend_error",
        message: result.reason ?? "Bản thu chưa đạt yêu cầu.",
      });
      return false;
    }
    return true;
  };

  const validateBackend = async (blob: Blob, sentenceId: number) => {
    setValidationState({ status: "validating_backend" });

    try {
      const fd = new FormData();
      fd.append("file", blob);
      fd.append("sentence_id", String(sentenceId));

      const { data } = await axios.post<BackendValidationResult>(
        `${getApiBase()}/user/sentence/validate`,
        fd
      );

      setBackendValidation(data);

      if (!data.valid) {
        setValidationState({ status: "backend_error", message: data.message });
        return;
      }

      if (data.suggested_start !== undefined && data.suggested_end !== undefined) {
        setRange([data.suggested_start, data.suggested_end]);
      }

      setValidationState({ status: "success", message: "Bản thu đạt yêu cầu!" });
    } catch {
      setValidationState({
        status: "backend_error",
        message: "Lỗi server khi kiểm tra.",
      });
    }
  };

  const handleRecordingComplete = async (
    blob: Blob,
    transcriptPromise: Promise<string> | null
  ) => {
    resetRecording();
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));

    if (!currentSentence) return;

    if (isSpeechRecognitionSupported() && currentSentence.text && transcriptPromise) {
      const transcript = await Promise.race([
        transcriptPromise,
        new Promise<string>((r) => setTimeout(() => r(""), 5000)),
      ]);
      const scriptValidation = validateSentenceScript(transcript, currentSentence.text);
      if (!scriptValidation.accepted) {
        setValidationState({
          status: "frontend_error",
          message: scriptValidation.reason ?? "Bạn đọc không đúng nội dung câu.",
        });
        return;
      }
    }

    const ok = await validateFrontendAudio(blob);
    if (!ok) return;

    await validateBackend(blob, currentSentence.id);
  };

  const nextSentence = () => {
    if (!isLastSentence) setCurrentIdx((i) => i + 1);
  };

  const completedCount = completed.size;
  const progressPercent = sentences.length > 0 ? Math.round((completedCount / sentences.length) * 100) : 0;
  const allSentencesDone = sentences.length > 0 && completedCount === sentences.length;

  useEffect(() => {
    if (userId == null || sessionId == null || sentences.length === 0) return;
    upsertProgress(userId, sessionId, "sentence", progressPercent).catch(() => {});
  }, [userId, sessionId, sentences.length, progressPercent]);

  useEffect(() => {
    if (allSentencesDone && onComplete) onComplete();
  }, [allSentencesDone, onComplete]);

  if (!userId) return null;

  if (!sentences.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-base md:text-lg text-gray-700">Đang tải danh sách câu…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 w-full space-y-4">
      {speechUnsupportedReason !== null && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {speechUnsupportedReason === "secure_context"
              ? "Kiểm tra phát âm tự động chưa bật: trình duyệt yêu cầu truy cập qua HTTPS. Vui lòng mở web bằng địa chỉ https://... (hoặc dùng Chrome/Edge trên máy tính) để bật tính năng này."
              : "Trên thiết bị/trình duyệt này không hỗ trợ kiểm tra phát âm tự động. Bản ghi vẫn được gửi và chỉ kiểm tra chất lượng âm thanh."}
          </p>
        </div>
      )}
      <SentenceProgress
        completedCount={completedCount}
        totalSentences={sentences.length}
        progressPercent={progressPercent}
      />
      <SentenceTabs sentences={sentences} completed={completed} currentIdx={currentIdx} />
      <SentenceCard
        sentence={currentSentence}
        audioBlob={audioBlob}
        setAudioBlob={setAudioBlob}
        setAudioUrl={setAudioUrl}
        resetRecording={resetRecording}
        isPlaying={isPlaying}
        onPlayToggle={() => setIsPlaying((p) => !p)}
        onRecordingComplete={handleRecordingComplete}
        range={range}
        setRange={setRange}
        validationState={validationState}
        backendValidation={backendValidation}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        userId={userId}
        isLastSentence={isLastSentence}
        isCurrentCompleted={isCompleted}
        allSentencesDone={allSentencesDone}
        onUploadSuccess={() => {
          setCompleted((s) => new Set(s).add(currentSentence.id));
          nextSentence();
        }}
      />
      {/* {isLastSentence && isCompleted && <CompletionMessage />} */}
    </div>
  );
}
