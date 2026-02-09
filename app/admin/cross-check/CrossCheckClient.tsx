"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Users, FileText, UserCheck, Check, Undo2, ChevronUp, ChevronDown } from "lucide-react";
import type { CrossCheckRecording, CrossCheckAnnotator } from "./page";

const DEFAULT_STD_THRESHOLD = 0.05;
const DEFAULT_MIN_KT = 5;
const PAGE_SIZE = 10;
const NEAR_MULTIPLIER = 1.5;

type Props = {
  accessToken: string;
  summary: { total_recordings: number; total_annotations: number; total_annotators: number };
  recordingsPending: CrossCheckRecording[];
  recordingsAccepted: CrossCheckRecording[];
  annotators: CrossCheckAnnotator[];
};

function formatSec(v: number | undefined | null): string {
  if (v === undefined || v === null) return "-";
  const n = Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(3);
}

function getNum(r: CrossCheckRecording, key: string): number | undefined {
  const v = (r as Record<string, unknown>)[key];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  return undefined;
}

function getStdColor(std: number | undefined, threshold: number): string {
  if (std === undefined || std === null) return "text-gray-500";
  if (std <= threshold) return "text-green-600 font-medium";
  if (std <= threshold * NEAR_MULTIPLIER) return "text-yellow-600 font-medium";
  return "text-red-600 font-medium";
}

/** Màu dòng: Số lần KT = 0 → trắng; Số lần KT > 0 → vàng */
function getRowBg(r: CrossCheckRecording): string {
  const annCount = r.annotation_count ?? 0;
  if (annCount === 0) return "";
  return "bg-amber-50";
}

type SortKey = "recording_id" | "sentence_text" | "keyword_text" | "recorder_name" | "annotation_count" | "recorder_start" | "recorder_end" | "mean_start" | "mean_end" | "std_start" | "std_end";

function RecordingsTable({
  title,
  subtitle,
  variant,
  recordings,
  stdThreshold,
  minKT,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: {
  title: string;
  subtitle: string;
  variant: "pending" | "accepted";
  recordings: CrossCheckRecording[];
  stdThreshold: number;
  minKT: number;
  actionLabel: string;
  actionIcon: React.ComponentType<{ className?: string }>;
  onAction: (recordingId: number) => Promise<void>;
}) {
  const isPending = variant === "pending";
  const borderAccent = isPending ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-green-500";
  const headerBg = isPending ? "bg-amber-50 border-amber-100" : "bg-green-50 border-green-100";
  const badge = isPending ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
      Chờ duyệt — bấm &quot;Chấp nhận&quot; để chuyển xuống bảng dưới
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
      Đã duyệt — bấm &quot;Hoàn tác&quot; để đưa lại lên bảng trên
    </span>
  );
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recording_id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return recordings;
    const q = search.toLowerCase().trim();
    return recordings.filter((r) => {
      const kw = (r as Record<string, unknown>)["keyword_text"] ?? r.keyword_text;
      return (
        r.sentence_text?.toLowerCase().includes(q) ||
        (typeof kw === "string" && kw.toLowerCase().includes(q)) ||
        r.recorder_name?.toLowerCase().includes(q) ||
        r.recorder_phone?.includes(q)
      );
    });
  }, [recordings, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") cmp = aVal - bVal;
      else cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page]
  );

  const handleAction = async (recordingId: number) => {
    setLoadingId(recordingId);
    try {
      await onAction(recordingId);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Có lỗi");
    } finally {
      setLoadingId(null);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const Th = ({ label, keyName }: { label: string; keyName: SortKey }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap">
      <button
        type="button"
        onClick={() => toggleSort(keyName)}
        className="flex items-center gap-1 hover:text-indigo-600"
      >
        {label}
        {sortKey === keyName ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
      </button>
    </th>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${borderAccent}`}>
      <div className={`px-6 py-4 border-b ${headerBg}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className={isPending ? "h-5 w-5 text-amber-600" : "h-5 w-5 text-green-600"} />
                {title}
              </h2>
              {badge}
            </div>
            <input
              type="text"
              placeholder="Tìm theo câu, keyword, tên, SĐT…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
            />
          </div>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <Th label="ID" keyName="recording_id" />
              <Th label="Câu" keyName="sentence_text" />
              <Th label="Keyword" keyName="keyword_text" />
              <Th label="Người thu" keyName="recorder_name" />
              <Th label="Số lần KT" keyName="annotation_count" />
              <Th label="Start (người thu)" keyName="recorder_start" />
              <Th label="End (người thu)" keyName="recorder_end" />
              <Th label="Mean start" keyName="mean_start" />
              <Th label="Mean end" keyName="mean_end" />
              <Th label="Std start" keyName="std_start" />
              <Th label="Std end" keyName="std_end" />
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-500">
                  {recordings.length === 0 ? "Chưa có bản ghi" : "Không có kết quả phù hợp"}
                </td>
              </tr>
            ) : (
              paginated.map((r) => {
                const hasKT = (r.annotation_count ?? 0) > 0;
                return (
                <tr key={r.recording_id} className={`hover:opacity-90 transition ${getRowBg(r)}`}>
                  <td className="px-3 py-2 text-sm font-mono text-gray-600">{r.recording_id}</td>
                  <td className="px-3 py-2 text-sm text-gray-800 max-w-[180px] truncate" title={r.sentence_text}>{r.sentence_text || "-"}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-800">{typeof r.keyword_text === "string" ? r.keyword_text : "-"}</td>
                  <td className="px-3 py-2 text-sm">
                    <p className="font-medium text-gray-900">{r.recorder_name}</p>
                    <p className="text-gray-500 text-xs">{r.recorder_phone}</p>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.annotation_count > 0 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                      {r.annotation_count}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-gray-700">{formatSec(getNum(r, "recorder_start"))}</td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-gray-700">{formatSec(getNum(r, "recorder_end"))}</td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-gray-700">{hasKT ? formatSec(getNum(r, "mean_start")) : "-"}</td>
                  <td className="px-3 py-2 text-sm text-right font-mono text-gray-700">{hasKT ? formatSec(getNum(r, "mean_end")) : "-"}</td>
                  <td className={`px-3 py-2 text-sm text-right font-mono ${hasKT ? getStdColor(getNum(r, "std_start"), stdThreshold) : "text-gray-500"}`}>{hasKT ? formatSec(getNum(r, "std_start")) : "-"}</td>
                  <td className={`px-3 py-2 text-sm text-right font-mono ${hasKT ? getStdColor(getNum(r, "std_end"), stdThreshold) : "text-gray-500"}`}>{hasKT ? formatSec(getNum(r, "std_end")) : "-"}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleAction(r.recording_id)}
                      disabled={loadingId === r.recording_id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <ActionIcon className="h-4 w-4" />
                      {loadingId === r.recording_id ? "…" : actionLabel}
                    </button>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Trang {page} / {totalPages} ({(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} / {sorted.length})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrossCheckClient({
  accessToken,
  summary,
  recordingsPending,
  recordingsAccepted,
  annotators,
}: Props) {
  const [stdThreshold, setStdThreshold] = useState(DEFAULT_STD_THRESHOLD);
  const [minKT, setMinKT] = useState(DEFAULT_MIN_KT);
  const [searchAnnotators, setSearchAnnotators] = useState("");

  const base = process.env.NEXT_PUBLIC_SERVER_URL;
  const headers = () => ({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  });

  const acceptRecording = async (recordingId: number) => {
    const res = await fetch(`${base}/admin/cross-check/recordings/${recordingId}/accept`, { method: "POST", headers: headers() });
    if (!res.ok) throw new Error(await res.text().catch(() => "Lỗi"));
  };

  const undoRecording = async (recordingId: number) => {
    const res = await fetch(`${base}/admin/cross-check/recordings/${recordingId}/undo`, { method: "POST", headers: headers() });
    if (!res.ok) throw new Error(await res.text().catch(() => "Lỗi"));
  };

  const filteredAnnotators = useMemo(() => {
    if (!searchAnnotators.trim()) return annotators;
    const q = searchAnnotators.toLowerCase().trim();
    return annotators.filter((a) => a.name?.toLowerCase().includes(q) || a.phone?.includes(q));
  }, [annotators, searchAnnotators]);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng sentence recordings</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_recordings}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
            <CheckSquare className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Tổng annotation kiểm tra chéo</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_annotations}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <UserCheck className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Số người đã kiểm tra chéo</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_annotators}</p>
          </div>
        </div>
      </div>

      {/* Ngưỡng: std + Số lần KT */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Ngưỡng std (giây):</label>
        <input
          type="number"
          min={0.01}
          max={0.1}
          step={0.01}
          value={stdThreshold}
          onChange={(e) => setStdThreshold(Number(e.target.value) || DEFAULT_STD_THRESHOLD)}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <label className="text-sm font-medium text-gray-700">Số lần KT (tối thiểu):</label>
        <input
          type="number"
          min={0}
          max={50}
          value={minKT}
          onChange={(e) => setMinKT(Math.max(0, Number(e.target.value) || 0))}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <span className="text-xs text-gray-500">
          Số lần KT = 0: dòng trắng, Mean/Std hiển thị &quot;-&quot; · Số lần KT &gt; 0: dòng vàng, Mean/Std hiển thị giá trị (Std tô màu theo ngưỡng)
        </span>
      </div>

      {/* Bảng 1: Chờ duyệt — recording đã thu, có cross-check, chưa được admin chấp nhận */}
      <RecordingsTable
        title="Bảng 1 — Recordings đã thu (có cross-check)"
        subtitle="Các recording đã được user thu và có người kiểm tra chéo, đang chờ admin chấp nhận. Sau khi bấm &quot;Chấp nhận&quot;, recording sẽ chuyển xuống Bảng 2 và không còn trong pool kiểm tra chéo của user."
        variant="pending"
        recordings={recordingsPending}
        stdThreshold={stdThreshold}
        minKT={minKT}
        actionLabel="Chấp nhận"
        actionIcon={Check}
        onAction={acceptRecording}
      />

      {/* Bảng 2: Đã chấp nhận — recording đã được admin chấp nhận */}
      <RecordingsTable
        title="Bảng 2 — Recordings đã được chấp nhận"
        subtitle="Các recording đã được admin chấp nhận (đã chuyển từ Bảng 1). Bấm &quot;Hoàn tác&quot; nếu cần đưa recording trở lại Bảng 1."
        variant="accepted"
        recordings={recordingsAccepted}
        stdThreshold={stdThreshold}
        minKT={minKT}
        actionLabel="Hoàn tác"
        actionIcon={Undo2}
        onAction={undoRecording}
      />

      {/* Annotators */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Người đã tham gia kiểm tra chéo
          </h2>
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT…"
            value={searchAnnotators}
            onChange={(e) => setSearchAnnotators(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Số annotation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAnnotators.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-12 text-center text-gray-500">
                    {annotators.length === 0 ? "Chưa có ai kiểm tra chéo" : "Không có kết quả phù hợp"}
                  </td>
                </tr>
              ) : (
                filteredAnnotators.map((a) => (
                  <tr key={a.user_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">{a.annotation_count}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
