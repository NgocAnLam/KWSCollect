"use client";
import { useState, useEffect } from "react";

export default function CreateSentenceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchKeywords = async () => {
      setFetchError(false);
      try {
        const resSession = await fetch("/api/auth/session");
        const session = await resSession.json();

        if (!session?.accessToken) {
          alert("Phiên đăng nhập hết hạn");
          setIsOpen(false);
          return;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/sentence/keywords`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setKeywords(data);
      } catch (err) {
        console.error("Không tải được danh sách từ khóa:", err);
        setFetchError(true);
      }
    };

    fetchKeywords();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const text = formData.get("text")?.toString().trim();
    const keyword = formData.get("keyword")?.toString().trim();

    if (!text || !keyword) {
      alert("Vui lòng nhập đầy đủ câu và chọn từ khóa");
      setLoading(false);
      return;
    }

    if (!text.toLowerCase().includes(keyword.toLowerCase())) {
      alert("Từ khóa được chọn phải có trong nội dung câu!");
      setLoading(false);
      return;
    }

    const resSession = await fetch("/api/auth/session");
    const session = await resSession.json();

    if (!session?.accessToken) {
      alert("Phiên đăng nhập hết hạn");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/sentence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ text, keyword }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.detail || "Tạo câu thất bại");
      }
    } catch (err) {
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition shadow-xl flex items-center gap-3"
      >
        + Thêm câu mới
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 max-h-screen overflow-y-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Thêm câu thu âm mới</h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Nội dung câu đầy đủ
                </label>
                <textarea
                  name="text"
                  required
                  rows={6}
                  placeholder="Ví dụ: Hà Nội là thủ đô ngàn năm văn hiến của Việt Nam"
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Từ khóa cần nhấn mạnh
                </label>

                {fetchError ? (
                  <p className="text-red-600 mb-3">Không tải được danh sách từ khóa</p>
                ) : keywords.length === 0 ? (
                  <p className="text-gray-500 mb-3">Đang tải danh sách từ khóa...</p>
                ) : (
                  <select
                    name="keyword"
                    required
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                  >
                    <option value="">-- Chọn từ khóa --</option>
                    {keywords.map((kw) => (
                      <option key={kw} value={kw}>
                        {kw}
                      </option>
                    ))}
                  </select>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  Người thu âm sẽ được yêu cầu nhấn mạnh từ khóa này khi đọc
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-8 py-4 text-gray-700 bg-gray-200 rounded-2xl hover:bg-gray-300 transition text-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || fetchError || keywords.length === 0}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70 text-lg flex items-center gap-3"
                >
                  {loading ? "Đang tạo..." : "Tạo câu mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}