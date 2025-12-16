// app/admin/sentences/components/SentenceCard.tsx
"use client";

import { Edit2, Trash2, Clock, AlertCircle } from "lucide-react";

function getStatusBadge(used: boolean) {
  if (used) return { label: "Đã dùng", color: "bg-orange-100 text-orange-800", icon: Clock };
  return { label: "Chưa dùng", color: "bg-green-100 text-green-800", icon: AlertCircle };
}

function highlightKeyword(text: string, keyword: string) {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <span key={i} className="font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
}

type Props = {
  sentence: any;
};

export default function SentenceCard({ sentence }: Props) {
  const status = getStatusBadge(sentence.is_used);
  const StatusIcon = status.icon;

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa câu này?\nCâu đã có bản ghi âm sẽ không thể xóa.")) return;

    const resSession = await fetch("/api/auth/session");
    const session = await resSession.json();

    if (!session?.accessToken) {
      alert("Phiên đăng nhập hết hạn");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_SENTENCE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
    
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json();
      alert(data.error || "Xóa thất bại");
    }
  };

  const handleEdit = async (id: number, currentText: string, currentKeyword: string) => {
    const newText = prompt("Sửa nội dung câu:", currentText);
    if (!newText || newText.trim() === currentText) return;

    const newKeyword = prompt("Sửa từ khóa (phải có trong câu):", currentKeyword);
    if (!newKeyword || !newText.toLowerCase().includes(newKeyword.toLowerCase())) {
      alert("Từ khóa phải nằm trong nội dung câu!");
      return;
    }

    const resSession = await fetch("/api/auth/session");
    const session = await resSession.json();

    if (!session?.accessToken) {
      alert("Phiên đăng nhập hết hạn");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_SENTENCE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ text: newText.trim(), keyword: newKeyword.trim() }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json();
      alert(data.error || "Cập nhật thất bại");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-xl font-medium text-gray-900 leading-relaxed mb-4">
              {highlightKeyword(sentence.text, sentence.keyword)}
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-gray-600">
                <strong>Từ khóa:</strong>{" "}
                <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  {sentence.keyword}
                </span>
              </span>
              <span className="text-gray-600">
                ID: <strong>#{sentence.id}</strong>
              </span>
            </div>
          </div>

          
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{sentence.record_count || 0}</p>
            <p className="text-sm text-gray-600">Bản ghi âm</p>
          </div>

          <div className="flex gap-3 ml-4">
            <button
              onClick={() => handleEdit(sentence.id, sentence.text, sentence.keyword)}
              className="p-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition"
              title="Sửa câu"
            >
              <Edit2 className="h-5 w-5" />
            </button>

            {sentence.record_count === 0 && (
              <button
                onClick={() => handleDelete(sentence.id)}
                className="p-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition"
                title="Xóa câu"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <span className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-base font-medium ${status.color}`}>
            <StatusIcon className="h-5 w-5" />
            {status.label}
          </span>
        </div>
      </div>
    </div>
  );
}