"use client";

import RecordingControls from "./RecordingControls";
import WaveformPlayer from "./WaveformPlayer";
import ValidationResult from "./ValidationResult";
import UploadButton from "./UploadButton";
import type { ValidationState } from "../sentence";

type Sentence = { id: number; text: string; keyword: string };
type BackendValidationResult = {
  valid: boolean;
  message: string;
  suggested_start?: number;
  suggested_end?: number;
};

interface SentenceCardProps {
  sentence: Sentence;
  audioBlob: Blob | null;
  setAudioBlob: (blob: Blob | null) => void;
  setAudioUrl: (url: string | null) => void;
  resetRecording: () => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onRecordingComplete: (blob: Blob, transcriptPromise: Promise<string> | null) => void;
  range: [number, number];
  setRange: (range: [number, number]) => void;
  validationState: ValidationState;
  backendValidation: BackendValidationResult | null;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
  userId: number | null;
  isLastSentence?: boolean;
  isCurrentCompleted?: boolean;
  allSentencesDone?: boolean;
  onUploadSuccess: () => void;
}

function highlightKeyword(text: string, keyword: string) {
  return text
    .split(new RegExp(`(${keyword})`, "gi"))
    .map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-indigo-700 font-semibold">{part}</span>
      ) : (
        part
      )
    );
}

export default function SentenceCard({
  sentence,
  audioBlob,
  setAudioBlob,
  setAudioUrl,
  resetRecording,
  isPlaying,
  onPlayToggle,
  onRecordingComplete,
  range,
  setRange,
  validationState,
  backendValidation,
  isUploading,
  setIsUploading,
  userId,
  isLastSentence = false,
  isCurrentCompleted = false,
  allSentencesDone = false,
  onUploadSuccess,
}: SentenceCardProps) {
  const showUploadButton = audioBlob && backendValidation?.valid && !(isLastSentence && isCurrentCompleted);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero: câu hiện tại + hướng dẫn */}
      <div className="bg-gradient-to-b from-indigo-50 to-white px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
          Câu hiện tại
        </p>
        <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-medium mb-1">
          {highlightKeyword(sentence.text, sentence.keyword)}
        </p>
        <p className="text-sm text-gray-600">
          Đọc to và rõ toàn bộ câu trong ~15 giây. Nhấn mạnh từ &quot;<strong>{sentence.keyword}</strong>&quot;.
        </p>
      </div>

      {/* Controls + validation + waveform + upload */}
      <div className="p-4 space-y-4">
        <RecordingControls
          audioBlob={audioBlob}
          setAudioBlob={setAudioBlob}
          setAudioUrl={setAudioUrl}
          resetRecording={resetRecording}
          isPlaying={isPlaying}
          onPlayToggle={onPlayToggle}
          onRecordingComplete={onRecordingComplete}
        />

        {audioBlob && (
          <>
            <ValidationResult state={validationState} />
            {backendValidation?.valid && (
              <WaveformPlayer
                audioBlob={audioBlob}
                range={range}
                setRange={setRange}
                keyword={sentence.keyword}
                isPlaying={isPlaying}
                onPlayToggle={onPlayToggle}
              />
            )}
            {allSentencesDone ? (
              <div className="text-center py-3 px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                Bạn đã hoàn thành tất cả câu. Nhấn nút <strong>Tiếp theo</strong> bên dưới để sang Bước 5.
              </div>
            ) : showUploadButton ? (
              <UploadButton
                userId={userId}
                sentenceId={sentence.id}
                audioBlob={audioBlob}
                range={range}
                validation={backendValidation}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                onSuccess={onUploadSuccess}
              />
            ) : isLastSentence && isCurrentCompleted ? (
              <div className="text-center py-3 px-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                Đã gửi câu cuối. Nhấn nút <strong>Tiếp theo</strong> bên dưới để sang Bước 5.
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
