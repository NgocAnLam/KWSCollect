export default function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl mb-4">Câu {current} / {total}</h2>
      <div className="flex justify-center gap-3">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-10 rounded-full transition-all duration-500 ${
              i < current - 1 ? "bg-white/80" :
              i === current - 1 ? "bg-white" :
              "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}