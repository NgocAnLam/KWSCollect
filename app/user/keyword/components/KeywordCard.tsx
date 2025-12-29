import RecordingRow from "./RecordingRow";

interface KeywordCardProps {
  currentKeyword: string;
  records: { status: string; audioUrl: string | null }[];
  volumes: number[];
  startRecording: (rowIndex: number) => void;
  retry: (rowIndex: number) => void;
}

export default function KeywordCard({
  currentKeyword,
  records,
  volumes,
  startRecording,
  retry,
}: KeywordCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-2">
        Đang thu: <span className="text-indigo-600">{currentKeyword}</span>
      </h2>
      <p className="text-center text-sm md:text-base text-gray-600 mb-4 md:mb-8 px-2">
        Nói to và rõ keyword: "<strong>{currentKeyword}</strong>"
      </p>

      <div className="space-y-3 md:space-y-5">
        {records.map((record, idx) => (
          <RecordingRow
            key={idx}
            index={idx}
            status={record.status as any}
            volume={volumes[idx]}
            audioUrl={record.audioUrl}
            onStartRecording={() => startRecording(idx)}
            onRetry={() => retry(idx)}
            previousRecordStatus={idx > 0 ? (records[idx - 1].status as any) : undefined}
          />
        ))}
      </div>
    </div>
  );
}