import { Mic, Loader2, CheckCircle, XCircle, Lock } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

type RecordStatus = "idle" | "recording" | "processing" | "accepted" | "rejected";

interface RecordingRowProps {
  index: number;
  status: RecordStatus;
  volume: number;
  audioUrl: string | null;
  rejectReason?: string;
  onStartRecording: () => void;
  onRetry: () => void;
  previousRecordStatus?: RecordStatus;
}

export default function RecordingRow({
  index,
  status,
  volume,
  audioUrl,
  rejectReason,
  onStartRecording,
  onRetry,
  previousRecordStatus,
}: RecordingRowProps) {
  const canRecord = index === 0 || previousRecordStatus === "accepted";

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-lg border transition-colors ${
        status === "recording"
          ? "bg-red-50 border-red-200"
          : status === "accepted"
          ? "bg-emerald-50/50 border-emerald-200"
          : status === "rejected"
          ? "bg-red-50/50 border-red-100"
          : "bg-gray-50/80 border-gray-200"
      }`}
    >
      {/* Cột 1: Lần thứ */}
      <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:w-16 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Lần {index + 1}
        </span>
        {!canRecord && (
          <span className="flex items-center gap-1 text-xs text-amber-600 sm:mt-1">
            <Lock className="h-3 w-3" />
            Xong Lần 1 trước
          </span>
        )}
      </div>

      {/* Cột 2: Waveform hoặc trạng thái */}
      <div className="flex-1 min-w-0 flex items-center">
        {status === "recording" && (
          <div className="w-full h-12 rounded-md overflow-hidden bg-gray-800/90">
            <WaveformVisualizer volume={volume} isRecording={true} />
          </div>
        )}
        {status === "idle" && canRecord && (
          <div className="w-full h-12 rounded-md overflow-hidden bg-gray-800/90">
            <WaveformVisualizer volume={volume} isRecording={false} />
          </div>
        )}
        {status === "idle" && !canRecord && (
          <p className="text-sm text-gray-400 italic">Hoàn thành Lần 1 trước</p>
        )}
        {status === "processing" && (
          <div className="flex items-center gap-2 text-amber-700 text-sm font-medium py-2">
            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
            <span>Đang kiểm tra…</span>
          </div>
        )}
        {status === "accepted" && (
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold py-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>Đạt yêu cầu</span>
          </div>
        )}
        {status === "rejected" && (
          <div className="flex flex-col gap-0.5 py-2">
            <div className="flex items-center gap-2 text-red-700 text-sm font-semibold">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <span>Chưa đạt</span>
            </div>
            {rejectReason && (
              <p className="text-xs text-red-600 mt-0.5 pl-7 leading-tight">{rejectReason}</p>
            )}
          </div>
        )}
      </div>

      {/* Cột 3: Hành động + audio */}
      <div className="flex flex-row sm:flex-col items-center gap-2 sm:w-36 flex-shrink-0">
        {status === "idle" && (
          <>
            {canRecord ? (
              <button
                type="button"
                onClick={onStartRecording}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm w-full sm:w-auto"
              >
                <Mic className="h-4 w-4" />
                Ghi âm
              </button>
            ) : (
              <span className="text-xs text-gray-400 text-center py-2">Chờ Lần 1</span>
            )}
          </>
        )}
        {status === "recording" && (
          <div className="flex items-center gap-1.5 text-red-600 text-sm font-semibold py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Đang ghi…
          </div>
        )}
        {audioUrl && (
          <div className="flex flex-col items-center gap-1.5 w-full">
            <audio controls src={audioUrl} className="w-full h-8 rounded-md" />
            {status === "rejected" && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-md text-xs font-medium hover:bg-amber-600 transition w-full"
              >
                Ghi lại
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
