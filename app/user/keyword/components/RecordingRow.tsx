// app/user/components/RecordingRow.tsx
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
}

export default function RecordingRow({
  index,
  status,
  volume,
  audioUrl,
  onStartRecording,
  onRetry,
}: RecordingRowProps) {
  return (
    <div className="flex items-center gap-6 p-5 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition">
      {/* Lần thứ */}
      <div className="w-20 text-lg font-semibold text-gray-700">
        Lần {index + 1}
      </div>

      {/* Waveform */}
      <WaveformVisualizer volume={volume} isRecording={status === "recording"} />

      {/* Trạng thái & Nút ghi âm */}
      <div className="w-48 text-center">
        {status === "idle" && (
          <button
            onClick={onStartRecording}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Mic className="w-5 h-5" />
            Ghi âm
          </button>
        )}
        {status === "recording" && (
          <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
            <Loader2 className="w-6 h-6 animate-spin" />
            Đang ghi...
          </div>
        )}
        {status === "processing" && (
          <div className="text-orange-600 font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            Kiểm tra...
          </div>
        )}
        {status === "accepted" && (
          <div className="text-green-600 font-bold flex items-center justify-center gap-2">
            <CheckCircle className="w-7 h-7" />
            Chấp nhận
          </div>
        )}
        {status === "rejected" && (
          <div className="text-red-600 font-bold flex items-center justify-center gap-2">
            <XCircle className="w-7 h-7" />
            Không hợp lệ
          </div>
        )}
      </div>

      {/* Nghe lại + Ghi lại */}
      <div className="w-64">
        {audioUrl && (
          <div className="flex flex-col items-center gap-3">
            <audio controls src={audioUrl} className="w-full h-10" />
            {status === "rejected" && (
              <button
                onClick={onRetry}
                className="px-6 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition shadow"
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