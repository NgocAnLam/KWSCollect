"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import CrossCheckProgress from "./components/CrossCheckProgress";
import CrossCheckTabs from "./components/CrossCheckTabs";
import CrossCheckCard from "./components/CrossCheckCard";
import CrossCheckCompletion from "./components/CrossCheckCompletion";
import { getApiBase } from "@/lib/api";
import { upsertProgress } from "../lib/sessionApi";

type CrossCheckItem = {
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

export default function CrossCheckList({
  userId,
  sessionId,
  onComplete,
}: {
  userId: number | null;
  sessionId?: number | null;
  onComplete?: () => void;
}) {
  const [items, setItems] = useState<CrossCheckItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 30]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentItem = useMemo(() => items[currentIdx], [items, currentIdx]);
  const total = items.length;
  const progressPercent = total > 0 ? Math.min(100, Math.round((submittedCount / total) * 100)) : 0;
  const allCrossCheckDone = !loading && (total === 0 || submittedCount === total);
  const showCompletionMessage = total > 0 && submittedCount === total;

  useEffect(() => {
    if (allCrossCheckDone && onComplete) onComplete();
  }, [allCrossCheckDone, onComplete]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    axios
      .get(`${getApiBase()}/user/sentence/to-check/${userId}`)
      .then((resp) => setItems(resp.data?.sentences || []))
      .catch((e: unknown) =>
        setError(e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Không tải được danh sách kiểm tra")
      )
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    setRange([0, 30]);
    setIsPlaying(false);
  }, [currentItem?.recording_id]);

  const handleSubmit = async () => {
    if (!currentItem || !userId) return;
    if (range[0] >= range[1]) {
      alert("Vui lòng chọn đoạn bắt đầu nhỏ hơn đoạn kết thúc.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${getApiBase()}/user/cross/add`, {
        sentence_id: currentItem.id,
        user_id: userId,
        recording_id: currentItem.recording_id,
        start: range[0],
        end: range[1],
      });
      const newSubmitted = submittedCount + 1;
      setSubmittedCount(newSubmitted);
      if (userId && sessionId != null) {
        const pct = total > 0 ? Math.round((newSubmitted / total) * 100) : 0;
        upsertProgress(userId, sessionId, "cross_check", pct).catch(() => {});
      }
      setCurrentIdx((i) => Math.min(i + 1, total - 1));
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      alert(msg || "Gửi thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => setCurrentIdx((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setCurrentIdx((i) => Math.max(i - 1, 0));

  if (!userId) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-base md:text-lg text-gray-700">Đang tải danh sách kiểm tra chéo…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 md:py-20 px-4">
        <p className="text-lg md:text-xl font-bold text-red-600">Lỗi: {error}</p>
        <p className="mt-2 text-sm md:text-base text-gray-600">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return <CrossCheckCompletion />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 w-full space-y-4">
      <CrossCheckProgress
        currentIndex={currentIdx}
        total={total}
        progressPercent={progressPercent}
        showCompletionHint={showCompletionMessage}
      />
      <CrossCheckTabs total={total} currentIdx={currentIdx} submittedCount={submittedCount} />
      {showCompletionMessage ? (
        <CrossCheckCompletion />
      ) : (
        <CrossCheckCard
          item={currentItem}
          range={range}
          setRange={setRange}
          isPlaying={isPlaying}
          onPlayToggle={() => setIsPlaying((p) => !p)}
          onPrev={goPrev}
          onNext={goNext}
          onSubmit={handleSubmit}
          canGoPrev={currentIdx > 0}
          canGoNext={currentIdx < total - 1}
          submitting={submitting}
        />
      )}
    </div>
  );
}
