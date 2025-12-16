import { Mic, MicOff } from 'lucide-react';

interface MicTestButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export default function MicTestButton({ isRecording, onClick }: MicTestButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-8 rounded-full text-white transition shadow-xl ${
        isRecording
          ? "bg-red-500 animate-pulse"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {isRecording ? <Mic size={64} /> : <MicOff size={64} />}
    </button>
  );
}