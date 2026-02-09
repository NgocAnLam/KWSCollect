"use client";

import MicTestButton from "./MicTestButton";
import VolumeMeter, { VolumeMeterHandle } from "./VolumeMeter";
import RecordingPlayback from "./RecordingPlayback";

interface MicTestCardProps {
  isRecording: boolean;
  volume: number;
  audioUrl: string | null;
  volumeMeterRef: React.RefObject<VolumeMeterHandle | null>;
  onStartStop: () => void;
}

export default function MicTestCard({
  isRecording,
  volume,
  audioUrl,
  volumeMeterRef,
  onStartStop,
}: MicTestCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero: Kiểm tra Micro + hướng dẫn */}
      <div className="bg-gradient-to-b from-indigo-50 to-white px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
          Kiểm tra Micro
        </p>
        <p className="text-lg font-semibold text-gray-800 mb-1">
          Nói: &quot;Xin chào, tôi đang kiểm tra micro&quot;
        </p>
        <p className="text-sm text-gray-600">
          Bấm nút bên dưới để thu âm. Tự động dừng sau 5 giây. Mức âm thanh hiển thị khi đang ghi.
        </p>
      </div>

      {/* Nút thu + thanh âm lượng + nghe lại */}
      <div className="p-4 space-y-4">
        <div className="flex justify-center">
          <MicTestButton isRecording={isRecording} onClick={onStartStop} />
        </div>

        <VolumeMeter ref={volumeMeterRef} volume={volume} />

        <RecordingPlayback audioUrl={audioUrl} />
      </div>
    </div>
  );
}
