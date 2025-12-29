"use client";
import { Loader2 } from "lucide-react";
import { useKeywordRecorder } from "./hooks/useKeywordRecorder";
import KeywordProgress from "./components/KeywordProgress";
import KeywordTabs from "./components/KeywordTabs";
import KeywordCard from "./components/KeywordCard";

type Props = { userId: number | null; onComplete?: () => void };

export default function KeywordRecorder({ userId, onComplete }: Props) {
  const recorder = useKeywordRecorder(userId, onComplete);

  if (recorder.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-base md:text-lg text-gray-700">Đang tải danh sách từ khóa...</p>
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
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 w-full">
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