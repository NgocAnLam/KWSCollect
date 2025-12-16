// export default function SentenceDisplay({ sentence }: { sentence: any }) {
//   const highlightedText = sentence.text.split(new RegExp(`(${sentence.keyword})`, 'gi')).map((part: string, i: number) =>
//     part.toLowerCase() === sentence.keyword.toLowerCase() ? (
//       <span key={i} className="inline-block px-4 py-2 text-2xl font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-lg">
//         {part}
//       </span>
//     ) : part
//   );

//   return (
//     <div className="text-center p-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl">
//       <p className="text-3xl lg:text-4xl leading-relaxed text-gray-900 font-medium mb-8">
//         {highlightedText}
//       </p>
//       <p className="text-xl text-purple-700 font-bold">
//         Hãy nhấn mạnh từ khóa: <span className="text-2xl">"{sentence.keyword}"</span>
//       </p>
//     </div>
//   );
// }

export default function SentenceDisplay({ sentence }: { sentence: any }) {
  const highlightedText = sentence.text
    .split(new RegExp(`(${sentence.keyword})`, 'gi'))
    .map((part: string, i: number) =>
      part.toLowerCase() === sentence.keyword.toLowerCase() ? (
        <span
          key={i}
          className="inline-block px-3 py-1 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md"
        >
          {part}
        </span>
      ) : (
        part
      )
    );

  return (
    <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl">
      <p className="text-xl lg:text-2xl leading-relaxed text-gray-800 font-medium mb-6">
        {highlightedText}
      </p>
      <p className="text-lg text-purple-700 font-semibold">
        Hãy nhấn mạnh từ khóa:{' '}
        <span className="text-xl font-bold">"{sentence.keyword}"</span>
      </p>
    </div>
  );
}