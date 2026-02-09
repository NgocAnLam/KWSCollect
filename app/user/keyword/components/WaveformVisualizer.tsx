interface WaveformVisualizerProps {
  volume: number;
  isRecording: boolean;
}

export default function WaveformVisualizer({
  volume,
  isRecording,
}: WaveformVisualizerProps) {
  return (
    <div className="flex-1 h-full min-h-[3rem] bg-gray-900 rounded-lg overflow-hidden relative">
      <div className="absolute inset-0 flex items-center justify-center gap-1 px-2">
        {Array(30)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-1 bg-indigo-400 rounded-full transition-[height] duration-75"
              style={{
                height: `${volume > 10 ? volume * 1.2 : 10}%`,
                opacity: isRecording ? 1 : 0.4,
              }}
            />
          ))}
      </div>
      {isRecording && (
        <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
      )}
    </div>
  );
}