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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-lg">Đang tải danh sách từ khóa...</p>
      </div>
    );
  }

  if (recorder.error) {
    return (
      <div className="text-center py-20 text-red-600">
        <p className="text-xl font-bold">Lỗi: {recorder.error}</p>
        <p className="mt-2">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <KeywordProgress {...recorder} />
      <KeywordTabs {...recorder} />
      <KeywordCard
        currentKeyword={recorder.currentKeyword}
        records={recorder.records}
        volumes={recorder.volumes}
        startRecording={recorder.startRecording}
        retry={recorder.retry}
        isCurrentDone={recorder.isCurrentDone}
        isAllDone={recorder.isAllDone}
        currentKeywordIdx={recorder.currentKeywordIdx}
        keywords={recorder.keywords}
        nextKeyword={recorder.nextKeyword}
        onComplete={recorder.onComplete}
      />
    </div>
  );
}