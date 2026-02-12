import RecordingRow from "./RecordingRow";

interface KeywordCardProps {
  currentKeyword: string;
  records: { status: string; audioUrl: string | null; rejectReason?: string; transcriptDisplay?: string }[];
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Hero: keyword + hướng dẫn ngắn */}
      <div className="bg-gradient-to-b from-indigo-50 to-white px-4 py-4 border-b border-gray-100">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
          Từ khóa hiện tại
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {currentKeyword}
        </h2>
        <p className="text-sm text-gray-600">
          Nói to và rõ &quot;<strong>{currentKeyword}</strong>&quot; — mỗi lần ~3 giây.
        </p>
      </div>

      {/* Danh sách lần ghi */}
      <div className="p-4 space-y-3">
        {records.map((record, idx) => (
          <RecordingRow
            key={idx}
            index={idx}
            status={record.status as "idle" | "recording" | "processing" | "accepted" | "rejected"}
            volume={volumes[idx]}
            audioUrl={record.audioUrl}
            rejectReason={record.rejectReason}
            transcriptDisplay={record.transcriptDisplay}
            onStartRecording={() => startRecording(idx)}
            onRetry={() => retry(idx)}
            previousRecordStatus={idx > 0 ? (records[idx - 1].status as "idle" | "recording" | "processing" | "accepted" | "rejected") : undefined}
          />
        ))}
      </div>
    </div>
  );
}
