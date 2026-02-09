import { CheckCircle } from "lucide-react";

const REPEATS = process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT ? parseInt(process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT) : 2;

interface Props {
  keywords: { text: string }[];
  completedCounts: number[];
  currentKeywordIdx: number;
}

export default function KeywordTabs({ keywords, completedCounts, currentKeywordIdx }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center mb-4 px-2">
      {keywords.map((kw, idx) => {
        const done = completedCounts[idx] === REPEATS;
        const isCurrent = idx === currentKeywordIdx;

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
            <span>{kw.text}</span>
            {done && <CheckCircle className="ml-1.5 h-3.5 w-3.5 flex-shrink-0" />}
            <span className={`ml-1.5 text-xs ${isCurrent ? "text-white/90" : "opacity-75"}`}>
              ({completedCounts[idx]}/{REPEATS})
            </span>
          </div>
        );
      })}
    </div>
  );
}
