"use client";
import { useEffect, useState } from "react";
import { Loader2, Info } from "lucide-react";
import { useKeywordRecorder } from "./hooks/useKeywordRecorder";
import KeywordProgress from "./components/KeywordProgress";
import KeywordTabs from "./components/KeywordTabs";
import KeywordCard from "./components/KeywordCard";
import { upsertProgress } from "../lib/sessionApi";
import { getSpeechRecognitionUnsupportedReason } from "./utils/speechRecognitionCapture";

type Props = { userId: number | null; sessionId: number | null; onComplete?: () => void };

export default function KeywordRecorder({ userId, sessionId, onComplete }: Props) {
  const recorder = useKeywordRecorder(userId, onComplete);
  const [speechUnsupportedReason, setSpeechUnsupportedReason] = useState<"secure_context" | "not_supported" | null>(null);

  useEffect(() => {
    setSpeechUnsupportedReason(getSpeechRecognitionUnsupportedReason());
  }, []);

  useEffect(() => {
    if (userId == null || sessionId == null) return;
    const pct = recorder.progressPercent ?? 0;
    upsertProgress(userId, sessionId, "keyword", pct).catch(() => {});
  }, [userId, sessionId, recorder.progressPercent]);

  if (recorder.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-base md:text-lg text-gray-700">Đang tải danh sách từ khóa…</p>
      </div>
    );
  }

  if (recorder.error) {
    return (
      <div className="text-center py-12 md:py-20 px-4">
        <p className="text-lg md:text-xl font-bold text-red-600">Lỗi: {recorder.error}</p>
        <p className="mt-2 text-sm md:text-base text-gray-600">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 w-full space-y-4">
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
      <KeywordProgress {...recorder} />
      <KeywordTabs {...recorder} />
      <KeywordCard
        currentKeyword={recorder.currentKeyword}
        records={recorder.records}
        volumes={recorder.volumes}
        startRecording={recorder.startRecording}
        retry={recorder.retry}
      />
    </div>
  );
}