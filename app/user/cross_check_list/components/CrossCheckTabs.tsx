interface Props {
  total: number;
  currentIdx: number;
}

export default function CrossCheckTabs({ total, currentIdx }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mb-4 px-2">
      {Array.from({ length: total }, (_, idx) => {
        const isCurrent = idx === currentIdx;

        return (
          <div
            key={idx}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isCurrent
                ? "bg-indigo-600 text-white border-2 border-indigo-500 shadow-md"
                : "bg-gray-100 text-gray-600 border border-transparent"
            }`}
          >
            <span>Câu {idx + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
