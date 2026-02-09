import { CheckCircle } from "lucide-react";

interface Props {
  sentences: { id: number }[];
  completed: Set<number>;
  currentIdx: number;
}

export default function SentenceTabs({ sentences, completed, currentIdx }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mb-4 px-2">
      {sentences.map((s, idx) => {
        const done = completed.has(s.id);
        const isCurrent = idx === currentIdx;

        return (
          <div
            key={idx}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              done
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : isCurrent
                ? "bg-indigo-600 text-white border-2 border-indigo-500 shadow-md"
                : "bg-gray-100 text-gray-600 border border-transparent"
            }`}
          >
            <span>Câu {idx + 1}</span>
            {done && <CheckCircle className="ml-1.5 h-3.5 w-3.5 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}
