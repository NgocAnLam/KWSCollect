interface CrossCheckProgressProps {
  currentIndex: number;
  total: number;
  progressPercent: number;
}

export default function CrossCheckProgress({
  currentIndex,
  total,
  progressPercent,
}: CrossCheckProgressProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5 px-0.5">
        <span>Tiến độ: câu {currentIndex + 1}/{total}</span>
        <span className="font-medium tabular-nums">{progressPercent}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1.5 px-0.5">
        Nghe và đánh dấu đoạn chứa từ khóa, sau đó bấm &quot;Gửi kiểm tra&quot;.
      </p>
    </div>
  );
}
