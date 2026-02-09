import { Mic, MicOff } from "lucide-react";

interface MicTestButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export default function MicTestButton({ isRecording, onClick }: MicTestButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRecording ? "Dừng ghi âm" : "Bắt đầu thu âm"}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium text-white transition-colors shadow-sm ${
        isRecording
          ? "bg-red-600 animate-pulse hover:bg-red-700"
          : "bg-indigo-600 hover:bg-indigo-700"
      }`}
    >
      {isRecording ? (
        <>
          <MicOff className="h-5 w-5" />
          Đang ghi… (bấm dừng)
        </>
      ) : (
        <>
          <Mic className="h-5 w-5" />
          Bắt đầu thu âm
        </>
      )}
    </button>
  );
}