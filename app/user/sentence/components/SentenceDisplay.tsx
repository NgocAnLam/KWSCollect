export default function SentenceDisplay({ sentence }: { sentence: any }) {
  const highlightedText = sentence.text
    .split(new RegExp(`(${sentence.keyword})`, 'gi'))
    .map((part: string, i: number) =>
      part.toLowerCase() === sentence.keyword.toLowerCase() ? (
        <span key={i}>{part}</span>
      ) : (part)
    );

  return (
    <div className="text-center p-2 bg-gradient-to-br from-indigo-50 to-purple-50">
      <p className="text-xl lg:text-1xl leading-relaxed text-gray-800 font-medium mb-6">
        {highlightedText}
      </p>
    </div>
  );
}