interface RecordingPlaybackProps {
  audioUrl: string | null;
}

export default function RecordingPlayback({ audioUrl }: RecordingPlaybackProps) {
  if (!audioUrl) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <p className="text-xs font-medium text-gray-600 mb-1.5">Nghe lại bản ghi</p>
      <audio controls src={audioUrl} className="w-full h-9 rounded-md border border-gray-200" />
    </div>
  );
}