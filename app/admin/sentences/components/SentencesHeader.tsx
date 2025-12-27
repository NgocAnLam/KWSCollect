import CreateSentenceModal from "./CreateSentenceModal";

export default function SentencesHeader() {
  return (
    <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Quản lý Câu Thu Âm</h1>
        <p className="text-lg text-gray-600 mt-2">
          Tạo và quản lý các câu hoàn chỉnh kèm từ khóa cần nhấn mạnh
        </p>
      </div>

      <CreateSentenceModal />
    </div>
  );
}