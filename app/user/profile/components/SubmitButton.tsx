import { Loader2 } from 'lucide-react';

export default function SubmitButton({loading, onClick,}: {loading: boolean; onClick: () => void;}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-2xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin h-7 w-7" />
          Đang xử lý...
        </>
      ) : (
        'Bắt đầu thu âm ngay'
      )}
    </button>
  );
}