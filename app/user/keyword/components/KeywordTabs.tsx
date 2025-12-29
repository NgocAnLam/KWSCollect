import { CheckCircle } from "lucide-react";

interface Props {
  keywords: { text: string }[];
  completedCounts: number[];
  currentKeywordIdx: number;
}

export default function KeywordTabs({ keywords, completedCounts, currentKeywordIdx }: Props) {
  const REPEATS = 5;

  return (
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6 md:mb-10 px-2">
      {keywords.map((kw, idx) => {
        const done = completedCounts[idx] === REPEATS;
        const isCurrent = idx === currentKeywordIdx;

        return (
          <div
            key={idx}
            className={`px-3 md:px-5 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-medium transition-all ${
              done
                ? "bg-green-100 text-green-800 border-2 border-green-300"
                : isCurrent
                ? "bg-indigo-600 text-white shadow-lg md:scale-105"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {kw.text}
            {done && <CheckCircle className="inline-block ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />}
            <span className="ml-1 md:ml-2 text-xs md:text-sm opacity-70">({completedCounts[idx]}/{REPEATS})</span>
          </div>
        );
      })}
    </div>
  );
}