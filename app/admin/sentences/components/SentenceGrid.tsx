import SentenceCard from "./SentenceCard";

type Props = {sentences: any[]};

export default function SentenceGrid({ sentences }: Props) {
  if (sentences.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-16 text-center">
        <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-xl text-gray-500">Chưa có câu nào</p>
        <p className="text-gray-400 mt-2">Hãy thêm câu đầu tiên để bắt đầu!</p>
      </div>
    );
  }

  return (
    <div className={"grid gap-8 grid-cols-1"}>
      {sentences.map((sentence) => (
        <SentenceCard key={sentence.id} sentence={sentence} />
      ))}
    </div>
  );
}