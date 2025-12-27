import { ChevronRight } from "lucide-react";
import RecordingRow from "./RecordingRow";

interface KeywordCardProps {
  currentKeyword: string;
  records: { status: string; audioUrl: string | null }[];
  volumes: number[];
  startRecording: (rowIndex: number) => void;
  retry: (rowIndex: number) => void;

  isCurrentDone: boolean;
  isAllDone: boolean;
  currentKeywordIdx: number;
  keywords: { text: string }[];
  nextKeyword: () => void;
  onComplete?: () => void;
}

export default function KeywordCard({
  currentKeyword,
  records,
  volumes,
  startRecording,
  retry,
  isCurrentDone,
  isAllDone,
  currentKeywordIdx,
  keywords,
  nextKeyword,
  onComplete,
}: KeywordCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center mb-2">
        Đang thu: <span className="text-indigo-600">{currentKeyword}</span>
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Nói to và rõ keyword: "<strong>{currentKeyword}</strong>"
      </p>

      <div className="space-y-5">
        {records.map((record, idx) => (
          <RecordingRow
            key={idx}
            index={idx}
            status={record.status as any}
            volume={volumes[idx]}
            audioUrl={record.audioUrl}
            onStartRecording={() => startRecording(idx)}
            onRetry={() => retry(idx)}
          />
        ))}
      </div>

      {/* Nút Tiếp tục / Hoàn tất - đưa thẳng vào đây */}
      <div className="mt-10 text-center">
        {isAllDone ? (
          <button
            onClick={() => onComplete?.()}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition transform"
          >
            Hoàn tất phần Keyword! Chuyển sang câu dài
          </button>
        ) : (
          isCurrentDone &&
          currentKeywordIdx < keywords.length - 1 && (
            <button
              onClick={nextKeyword}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition shadow-lg"
            >
              Tiếp tục: {keywords[currentKeywordIdx + 1].text}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition" />
            </button>
          )
        )}
      </div>
    </div>
  );
}