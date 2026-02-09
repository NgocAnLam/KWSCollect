interface SentenceProgressProps {
  completedCount: number;
  totalSentences: number;
  progressPercent: number;
}

export default function SentenceProgress({
  completedCount,
  totalSentences,
  progressPercent,
}: SentenceProgressProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 px-0.5">
        <span>Tiến độ: {completedCount}/{totalSentences} câu</span>
        <span className="font-medium tabular-nums">{progressPercent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5 px-0.5">
        Đọc to và rõ toàn bộ câu trong ~15 giây. Mỗi câu thu 1 lần.
      </p>
    </div>
  );
}
