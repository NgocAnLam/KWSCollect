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
  return (
    <div className="text-center mb-4 md:mb-8">
      <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 px-2">
        (Vui lòng nói rõ từ khóa trong tối đa 2 giây. Hệ thống sẽ tự động ghi nhận. Tổng cộng{" "}
        <strong>{totalRecordings}</strong> bản ghi)
      </p>

      <div className="max-w-2xl mx-auto mb-4 md:mb-8">
        <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-2 px-1">
          <span>Tiến độ tổng thể</span>
          <span>
            {totalCompleted}/{totalRecordings} ({progressPercent}%)
          </span>
        </div>
        <div className="h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}