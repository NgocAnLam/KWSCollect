import { Mic, Loader2, CheckCircle, XCircle } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";

type RecordStatus = "idle" | "recording" | "processing" | "accepted" | "rejected";

interface RecordingRowProps {
  index: number;
  status: RecordStatus;
  volume: number;
  audioUrl: string | null;
  onStartRecording: () => void;
  onRetry: () => void;
  previousRecordStatus?: RecordStatus;
}

export default function RecordingRow({
  index,
  status,
  volume,
  audioUrl,
  onStartRecording,
  onRetry,
  previousRecordStatus,
}: RecordingRowProps) {
  // Kiểm tra xem có thể ghi âm không: lần đầu tiên (index === 0) hoặc lần trước đã được chấp nhận
  const canRecord = index === 0 || previousRecordStatus === "accepted";

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 p-4 md:p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition">
      {/* Mobile: Lần thứ + Nút ghi âm cùng hàng */}
      <div className="flex md:hidden items-center justify-between gap-3">
        <div className="text-base font-semibold text-gray-700 flex-shrink-0">
          Lần {index + 1}
        </div>
        <div className="flex-1 text-center">
          {status === "idle" && (
            <>
              {canRecord ? (
                <button
                  onClick={onStartRecording}
                  className="flex items-center justify-center gap-2 mx-auto px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
                >
                  <Mic className="w-4 h-4" />
                  Ghi âm
                </button>
              ) : (
                <div className="text-gray-400 text-xs font-medium">
                  Hoàn thành lần trước
                </div>
              )}
            </>
          )}
          {status === "recording" && (
            <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang ghi...
            </div>
          )}
          {status === "processing" && (
            <div className="text-orange-600 font-medium flex items-center justify-center gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Kiểm tra...
            </div>
          )}
          {status === "accepted" && (
            <div className="text-green-600 font-bold flex items-center justify-center gap-2 text-sm">
              <CheckCircle className="w-6 h-6" />
              Chấp nhận
            </div>
          )}
          {status === "rejected" && (
            <div className="text-red-600 font-bold flex items-center justify-center gap-2 text-sm">
              <XCircle className="w-6 h-6" />
              Không hợp lệ
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Header: Lần thứ + Waveform */}
      <div className="hidden md:flex items-center gap-4">
        <div className="w-20 text-lg font-semibold text-gray-700 flex-shrink-0">
          Lần {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <WaveformVisualizer volume={volume} isRecording={status === "recording"} />
        </div>
      </div>

      {/* Desktop: Trạng thái & Nút ghi âm */}
      <div className="hidden md:block w-48 text-center flex-shrink-0">
        {status === "idle" && (
          <>
            {canRecord ? (
              <button
                onClick={onStartRecording}
                className="flex items-center justify-center gap-2 mx-auto px-4 md:px-6 py-2.5 md:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm md:text-base w-full md:w-auto"
              >
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
                Ghi âm
              </button>
            ) : (
              <div className="text-gray-400 text-xs md:text-sm font-medium">
                Hoàn thành lần trước
              </div>
            )}
          </>
        )}
        {status === "recording" && (
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm md:text-base">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            Đang ghi...
          </div>
        )}
        {status === "processing" && (
          <div className="text-orange-600 font-medium flex items-center justify-center gap-2 text-sm md:text-base">
            <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
            Kiểm tra...
          </div>
        )}
        {status === "accepted" && (
          <div className="text-green-600 font-bold flex items-center justify-center gap-2 text-sm md:text-base">
            <CheckCircle className="w-6 h-6 md:w-7 md:h-7" />
            Chấp nhận
          </div>
        )}
        {status === "rejected" && (
          <div className="text-red-600 font-bold flex items-center justify-center gap-2 text-sm md:text-base">
            <XCircle className="w-6 h-6 md:w-7 md:h-7" />
            Không hợp lệ
          </div>
        )}
      </div>

      {/* Nghe lại + Ghi lại */}
      <div className="w-full md:w-64 flex-shrink-0">
        {audioUrl && (
          <div className="flex flex-col items-center gap-2 md:gap-3">
            <audio controls src={audioUrl} className="w-full h-8 md:h-10" />
            {status === "rejected" && (
              <button
                onClick={onRetry}
                className="px-4 md:px-6 py-2 md:py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition shadow text-sm md:text-base w-full md:w-auto"
              >
                Ghi lại lần này
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}