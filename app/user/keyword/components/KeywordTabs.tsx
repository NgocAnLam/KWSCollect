import { CheckCircle } from "lucide-react";

interface Props {
  keywords: { text: string }[];
  completedCounts: number[];
  currentKeywordIdx: number;
}

export default function KeywordTabs({ keywords, completedCounts, currentKeywordIdx }: Props) {
  const REPEATS = 5;

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-10">
      {keywords.map((kw, idx) => {
        const done = completedCounts[idx] === REPEATS;
        const isCurrent = idx === currentKeywordIdx;

        return (
          <div
            key={idx}
            className={`px-5 py-3 rounded-xl font-medium transition-all ${
              done
                ? "bg-green-100 text-green-800 border-2 border-green-300"
                : isCurrent
                ? "bg-indigo-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {kw.text}
            {done && <CheckCircle className="inline-block ml-2 w-5 h-5" />}
            <span className="ml-2 text-sm opacity-70">({completedCounts[idx]}/{REPEATS})</span>
          </div>
        );
      })}
    </div>
  );
}