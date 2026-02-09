interface KeywordProgressProps {
  totalCompleted: number;
  totalRecordings: number;
  progressPercent: number;
}

export default function KeywordProgress({
  totalCompleted,
  totalRecordings,
  progressPercent,
}: KeywordProgressProps) {
  const REPEATS = process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT ? parseInt(process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT) : 2;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 px-0.5">
        <span>Tiến độ: {totalCompleted}/{totalRecordings} bản ghi</span>
        <span className="font-medium tabular-nums">{progressPercent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5 px-0.5">
        Nói rõ từ khóa trong ~3 giây. Mỗi từ thu {REPEATS} lần.
      </p>
    </div>
  );
}
