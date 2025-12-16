// app/user/components/KeywordProgress.tsx

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
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Thu âm mẫu giọng nói
      </h1>
      <p className="text-gray-600 mb-6">
        Vui lòng nói rõ ràng từng từ khóa trong 2 giây. Tổng cộng{" "}
        <strong>{totalRecordings}</strong> bản ghi.
      </p>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Tiến độ tổng thể</span>
          <span>
            {totalCompleted}/{totalRecordings} ({progressPercent}%)
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}