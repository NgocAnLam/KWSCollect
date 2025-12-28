"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ProgressBar from "./components/ProgressBar";
import SentenceDisplay from "./components/SentenceDisplay";
import RecordingControls from "./components/RecordingControls";
import WaveformPlayer from "./components/WaveformPlayer";
import ValidationResult from "./components/ValidationResult";
import UploadButton from "./components/UploadButton";
import CompletionMessage from "./components/CompletionMessage";

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

export default function SentenceRecorder({ userId }: { userId: number | null }) {
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/user/sentence/assign/${userId}`,
          { headers: { "ngrok-skip-browser-warning": "true" } }
        );

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
    resetRecording();
  }, [currentIdx]);

  const validateFrontend = async (blob: Blob): Promise<boolean> => {
    try {
      const buffer = await blob.arrayBuffer();
      const ctx = new AudioContext();
      const audio = await ctx.decodeAudioData(buffer);

      if (audio.duration < 5) {
        setValidationState({
          status: "frontend_error",
          message: `Bản thu quá ngắn (${audio.duration.toFixed(1)}s). Cần ≥ 5s.`,
        });
        return false;
      }

      const data = audio.getChannelData(0);
      const rms = Math.sqrt(data.reduce((s, x) => s + x * x, 0) / data.length);

      if (rms < 0.01) {
        setValidationState({
          status: "frontend_error",
          message: "Bản thu quá yên lặng, vui lòng đọc to và rõ hơn.",
        });
        return false;
      }

      return true;
    } catch {
      setValidationState({
        status: "frontend_error",
        message: "Lỗi xử lý âm thanh trên trình duyệt.",
      });
      return false;
    }
  };

  const validateBackend = async (blob: Blob, sentenceId: number) => {
    setValidationState({ status: "validating_backend" });

    try {
      const fd = new FormData();
      fd.append("file", blob);
      fd.append("sentence_id", String(sentenceId));

      const { data } = await axios.post<BackendValidationResult>(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/user/sentence/validate`,
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

  const handleRecordingComplete = async (blob: Blob) => {
    resetRecording();
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));

    if (!currentSentence) return;

    const ok = await validateFrontend(blob);
    if (!ok) return;

    await validateBackend(blob, currentSentence.id);
  };

  const nextSentence = () => {
    if (!isLastSentence) setCurrentIdx((i) => i + 1);
  };

  if (!sentences.length) {
    return <p className="text-center text-gray-500">Đang tải danh sách câu...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white">
        <ProgressBar current={currentIdx + 1} total={sentences.length} />
      </div>

      <SentenceDisplay sentence={currentSentence} />

      <RecordingControls
        audioBlob={audioBlob}
        setAudioBlob={setAudioBlob}
        setAudioUrl={setAudioUrl}
        resetRecording={resetRecording}
        isPlaying={isPlaying}
        onPlayToggle={() => setIsPlaying((p) => !p)}
        onRecordingComplete={handleRecordingComplete}
      />

      {audioBlob && backendValidation?.valid && (
        <WaveformPlayer
          audioBlob={audioBlob}
          range={range}
          setRange={setRange}
          keyword={currentSentence.keyword}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying((p) => !p)}
        />
      )}

      {audioBlob && (
        <>
          <ValidationResult state={validationState} />

          <UploadButton
            userId={userId}
            sentenceId={currentSentence.id}
            audioBlob={audioBlob}
            range={range}
            validation={backendValidation}
            isUploading={isUploading} // Truyền isUploading vào đây
            setIsUploading={setIsUploading} // Truyền setIsUploading vào đây
            onSuccess={() => {
              setCompleted((s) => new Set(s).add(currentSentence.id));
              nextSentence();
            }}
          />
        </>
      )}

      {isLastSentence && isCompleted && <CompletionMessage />}
    </div>
  );
}
