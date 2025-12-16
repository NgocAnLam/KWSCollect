interface RecordingPlaybackProps {
  audioUrl: string | null;
}

export default function RecordingPlayback({ audioUrl }: RecordingPlaybackProps) {
  if (!audioUrl) return null;

  return (
    <div className="w-full max-w-md text-center">
      <p className="font-medium mb-2">Nghe lại bản ghi</p>
      <audio controls src={audioUrl} className="w-full rounded-lg shadow" />
    </div>
  );
}