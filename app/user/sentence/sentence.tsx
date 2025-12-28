"use client";
import { useEffect, useState } from "react";
import ProgressBar from "./components/ProgressBar";
import SentenceDisplay from "./components/SentenceDisplay";
import RecordingControls from "./components/RecordingControls";
import WaveformPlayer from "./components/WaveformPlayer";
import ValidationResult from "./components/ValidationResult";
import UploadButton from "./components/UploadButton";
import CompletionMessage from "./components/CompletionMessage";
import axios from "axios";

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
  const [frontendValidation, setFrontendValidation] = useState<'pending' | 'valid' | 'invalid'>('pending');
  const [backendValidation, setBackendValidation] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentSentence = assigned[currentIdx];
  const isLastSentence = currentIdx === assigned.length - 1;
  const isCompleted = currentSentence && completedSentences.has(currentSentence.id);

  useEffect(() => {
    if (!userId) return;
    const fetchSentences = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/user/sentence/assign/${userId}`,
          {headers: {"ngrok-skip-browser-warning": "true"}}
        );
        if (!response.ok) throw new Error(`Lỗi ${response.status}: Không thể tải danh sách câu`);
        const data = await response.json();
        const sentences: Sentence[] = data.sentences || [];

        if (sentences.length !== 10) alert(`Hệ thống chỉ phân công ${sentences.length} câu (dự kiến 10 câu)`);

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

  const validateFrontend = async (blob: Blob): Promise<boolean> => {
    setFrontendValidation('pending');
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const duration = audioBuffer.duration; // Độ dài âm thanh thực tế (giây)

      // Kiểm tra độ dài bản thu: phải ≥ 5 giây
      if (duration < 5) {
        setFrontendValidation('invalid');
        setValidation({
          valid: false,
          message: `Bản thu quá ngắn (${duration.toFixed(1)}s). Vui lòng đọc đầy đủ câu, bản thu cần ít nhất 5 giây.`
        });
        return false;
      }

      // Kiểm tra độ to của âm thanh (RMS)
      const channelData = audioBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < channelData.length; i++) {
        sum += channelData[i] ** 2;
      }
      const rms = Math.sqrt(sum / channelData.length);
      const isSilent = rms < 0.01; // Ngưỡng có thể điều chỉnh nếu cần

      if (isSilent) {
        setFrontendValidation('invalid');
        setValidation({
          valid: false,
          message: "Bản thu quá yên lặng hoặc không có âm thanh. Vui lòng đọc to và rõ ràng hơn."
        });
        return false;
      }

      // Nếu qua hết các kiểm tra
      setFrontendValidation('valid');
      return true;
    } catch (err) {
      console.error("Lỗi xử lý âm thanh frontend:", err);
      setFrontendValidation('invalid');
      setValidation({
        valid: false,
        message: "Lỗi xử lý âm thanh trên trình duyệt. Vui lòng thử thu lại."
      });
      return false;
    }
  };

  const validateBackend = async (blob: Blob, sentenceId: number) => {
    setIsValidating(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "recording.webm");
      fd.append("sentence_id", String(sentenceId));

      const resp = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/user/sentence/validate`, fd);
      const result = resp.data;

      setBackendValidation(result);
      setValidation(result);

      if (result.suggested_start !== undefined && result.suggested_end !== undefined) {
        setRange([result.suggested_start, result.suggested_end]);
      }

      if (!result.valid) {
        alert("Backend validation failed: " + result.message);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi server khi kiểm tra";
      setValidation({ valid: false, message: msg });
      alert("Lỗi kiểm tra backend: " + msg);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
    setValidation(null);
    setBackendValidation(null);
    setFrontendValidation('pending');
    setRange([0, 15]);

    const sentenceId = currentSentence?.id;
    if (!sentenceId) return;

    const frontendOk = await validateFrontend(blob);
    if (!frontendOk) return;

    await validateBackend(blob, sentenceId);
  };

  // Reset khi đổi câu
  useEffect(() => {
    resetRecording();
    setFrontendValidation('pending');
    setBackendValidation(null);
  }, [currentIdx]);

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setValidation(null);
    setRange([0, 30]);
    setIsPlaying(false);
  };

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

  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl">
        {/* Progress */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-white">
          <ProgressBar current={currentIdx + 1} total={assigned.length} />
        </div>

        <div className="lg:p-1 space-y-2">
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
            onRecordingComplete={handleRecordingComplete}
          />

          {/* WaveformPlayer chỉ hiển thị khi backend validation pass */}
          {(audioBlob && backendValidation?.valid) && (
            <WaveformPlayer
              audioBlob={audioBlob}
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
                validation={
                  validation || {
                    valid: false,
                    message: backendValidation
                      ? validation.message
                      : isValidating
                      ? "Đang kiểm tra tự động với server..."
                      : frontendValidation === 'invalid'
                      ? "Bản thu quá yên lặng, vui lòng đọc to và rõ hơn!"
                      : "Đang kiểm tra bản thu..."
                  }
                }
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