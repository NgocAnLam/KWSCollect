// app/user/sentences/sentence.tsx
"use client";

import { useEffect, useState } from "react";
import ProgressBar from "./components/ProgressBar";
import SentenceDisplay from "./components/SentenceDisplay";
import RecordingControls from "./components/RecordingControls";
import WaveformPlayer from "./components/WaveformPlayer";
import ValidationResult from "./components/ValidationResult";
import UploadButton from "./components/UploadButton";
import CompletionMessage from "./components/CompletionMessage";

type Sentence = {
  id: number;
  text: string;
  keyword: string;
};

export default function SentenceRecorder({ userId }: { userId: number | null }) {
  const [assigned, setAssigned] = useState<Sentence[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [range, setRange] = useState<[number, number]>([0, 30]);
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());

  // Thêm state quản lý phát lại âm thanh
  const [isPlaying, setIsPlaying] = useState(false);

  const currentSentence = assigned[currentIdx];
  const isLastSentence = currentIdx === assigned.length - 1;
  const isCompleted = currentSentence && completedSentences.has(currentSentence.id);

  // Tải danh sách câu khi có userId
  useEffect(() => {
    if (!userId) return;

    const fetchSentences = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SENTENCE_URL}/assign/${userId}`);

        if (!response.ok) {
          throw new Error(`Lỗi ${response.status}: Không thể tải danh sách câu`);
        }

        const data = await response.json();
        const sentences: Sentence[] = data.sentences || [];

        if (sentences.length !== 10) {
          alert(`Hệ thống chỉ phân công ${sentences.length} câu (dự kiến 10 câu)`);
        }

        setAssigned(sentences);
      } catch (error) {
        console.error(error);
        alert("Không tải được danh sách câu. Vui lòng thử lại.");
      }
    };

    fetchSentences();
  }, [userId]);

  const nextSentence = () => {
    if (!isLastSentence) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setValidation(null);
    setRange([0, 30]);
    setIsPlaying(false); // Dừng phát khi reset
  };

  // Khi chuyển sang câu mới → reset tất cả trạng thái ghi âm và phát
  useEffect(() => {
    resetRecording();
  }, [currentIdx]);

  if (assigned.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <p className="text-xl text-gray-500">Đang tải danh sách câu thu âm...</p>
      </div>
    );
  }

  // Hàm toggle play/pause – được truyền cho cả hai component con
  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <ProgressBar current={currentIdx + 1} total={assigned.length} />
        </div>

        <div className="p-8 lg:p-12 space-y-10">
          {/* Câu cần đọc */}
          <SentenceDisplay sentence={currentSentence} />

          {/* Điều khiển ghi âm + nút nghe lại */}
          <RecordingControls
            audioBlob={audioBlob}
            setAudioBlob={setAudioBlob}
            setAudioUrl={setAudioUrl}
            resetRecording={resetRecording}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
          />

          {/* Waveform + Slider chọn vùng (chỉ hiển thị khi đã có bản thu) */}
          {audioUrl && (
            <WaveformPlayer
              audioUrl={audioUrl}
              audioBlob={audioBlob}  // ← Thêm dòng này
              range={range}
              setRange={setRange}
              keyword={currentSentence?.keyword || ""}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
            />
          )}

          {/* Kiểm tra và Upload (chỉ hiển thị khi đã có bản thu) */}
          {audioBlob && (
            <>
              <ValidationResult
                audioBlob={audioBlob}
                sentenceId={currentSentence?.id}
                validation={validation}
                setValidation={setValidation}
                isValidating={isValidating}
                setIsValidating={setIsValidating}
                setRange={setRange}
              />

              <UploadButton
                userId={userId}
                sentenceId={currentSentence?.id}
                audioBlob={audioBlob}
                range={range}
                validation={validation}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                onSuccess={() => {
                  setCompletedSentences((prev) => new Set(prev).add(currentSentence!.id));
                  resetRecording();
                  nextSentence();
                }}
              />
            </>
          )}

          {/* Thông báo hoàn thành toàn bộ */}
          {isLastSentence && isCompleted && <CompletionMessage />}
        </div>
      </div>
    </div>
  );
}