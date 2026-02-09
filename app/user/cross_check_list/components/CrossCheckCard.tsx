"use client";

import { Play, Pause, ChevronLeft, ChevronRight, Send } from "lucide-react";
import WaveformPlayer from "../../sentence/components/WaveformPlayer";

export type CrossCheckItem = {
  id: number;
  recording_id: number;
  text: string;
  keyword: string;
  minio_path: string;
  audio_url: string | null;
  recorder_start: number;
  recorder_end: number;
  annotation_count: number;
};

interface CrossCheckCardProps {
  item: CrossCheckItem;
  range: [number, number];
  setRange: (range: [number, number]) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  submitting: boolean;
}

function highlightKeyword(text: string, keyword: string) {
  return text
    .split(new RegExp(`(${keyword})`, "gi"))
    .map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-indigo-700 font-semibold">{part}</span>
      ) : (
        part
      )
    );
}

export default function CrossCheckCard({
  item,
  range,
  setRange,
  isPlaying,
  onPlayToggle,
  onPrev,
  onNext,
  onSubmit,
  canGoPrev,
  canGoNext,
  submitting,
}: CrossCheckCardProps) {
  const canSubmit = range[0] < range[1];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero: câu cần kiểm tra */}
      <div className="bg-gradient-to-b from-indigo-50 to-white px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
          Câu cần kiểm tra
        </p>
        <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-medium mb-1">
          {highlightKeyword(item.text, item.keyword)}
        </p>
        <p className="text-sm text-gray-600">
          Nghe bản thu và kéo thanh để đánh dấu đoạn chứa từ &quot;<strong>{item.keyword}</strong>&quot;.
        </p>
      </div>

      {/* Meta: vị trí người ghi âm + số người đã kiểm tra */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span>
          <span className="font-medium text-gray-700">Vị trí keyword người ghi âm:</span>{" "}
          {item.recorder_start.toFixed(2)}s — {item.recorder_end.toFixed(2)}s
        </span>
        <span>
          <span className="font-medium text-gray-700">Số người đã kiểm tra:</span>{" "}
          <span className="font-semibold text-indigo-600">{item.annotation_count}</span>
        </span>
      </div>

      {/* Phát + Waveform */}
      <div className="p-4 space-y-4">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onPlayToggle}
            disabled={!item.audio_url}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {isPlaying ? "Tạm dừng" : "Phát"}
          </button>
        </div>

        <WaveformPlayer
          audioUrl={item.audio_url || undefined}
          range={range}
          setRange={setRange}
          keyword={item.keyword}
          isPlaying={isPlaying}
          onPlayToggle={onPlayToggle}
        />

        {/* Actions: Câu trước | Câu sau | Gửi kiểm tra */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 order-last w-full sm:order-first sm:w-auto">
            Chọn đoạn chứa từ khóa (≤ 2s), sau đó bấm &quot;Gửi kiểm tra&quot;.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canGoPrev}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Đang gửi…" : "Gửi kiểm tra"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
