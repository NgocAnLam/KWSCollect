// app/user/sentences/components/CompletionMessage.tsx
export default function CompletionMessage() {
  return (
    <div className="mt-12 text-center py-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl shadow-2xl">
      <h2 className="text-5xl font-black text-green-800 mb-6">Chúc mừng bạn!</h2>
      <p className="text-3xl text-green-700 font-bold">Bạn đã hoàn thành thu âm tất cả 10 câu!</p>
      <p className="text-xl text-green-600 mt-6">Cảm ơn bạn đã đóng góp cho dự án KWS Collection 🎉</p>
    </div>
  );
}