"use client";

import { useState } from "react";
import type { Sentence } from "./SentenceTable";

type Props = {
  sentence: Sentence;
  updateSentence: (formData: FormData) => Promise<void>;
  deleteSentence: (id: number) => Promise<void>;
};

export default function SentenceActions({
  sentence,
  updateSentence,
  deleteSentence,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(sentence.text);
  const [keyword, setKeyword] = useState(sentence.keyword);

  const recordCount = (sentence as Record<string, unknown>).record_count ?? sentence.record_count ?? 0;
  const canDelete = recordCount === 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() || !keyword.trim()) return;
    if (!text.toLowerCase().includes(keyword.toLowerCase())) {
      alert("Từ khóa phải nằm trong câu");
      return;
    }
    const fd = new FormData();
    fd.set("id", String(sentence.id));
    fd.set("text", text.trim());
    fd.set("keyword", keyword.trim());
    try {
      await updateSentence(fd);
      setEditing(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  };

  if (editing) {
    return (
      <form
        className="flex flex-col gap-2 max-w-md"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="id" value={sentence.id} />
        <input
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Script"
        />
        <input
          name="keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Keyword"
        />
        <div className="flex gap-2">
          <button type="submit" className="text-green-600 hover:text-green-800 text-sm">
            Lưu
          </button>
          <button
            type="button"
            onClick={() => {
              setText(sentence.text);
              setKeyword(sentence.keyword);
              setEditing(false);
            }}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Hủy
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-4">
      <button
        onClick={() => setEditing(true)}
        className="text-indigo-600 hover:text-indigo-800 text-xl"
        title="Sửa"
      >
        ✏️
      </button>
      {canDelete ? (
        <button
          onClick={async () => {
            if (!confirm("Bạn có chắc muốn xóa câu này?")) return;
            try {
              await deleteSentence(sentence.id);
            } catch (err: unknown) {
              alert(err instanceof Error ? err.message : "Xóa thất bại");
            }
          }}
          className="text-red-600 hover:text-red-800 text-xl"
          title="Xóa"
        >
          🗑
        </button>
      ) : (
        <span className="text-gray-400 text-sm" title="Câu đã có bản ghi âm, không thể xóa">
          —
        </span>
      )}
    </div>
  );
}
