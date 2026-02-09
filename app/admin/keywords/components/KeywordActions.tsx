"use client";

import { useState } from "react";
import type { Keyword } from "./KeywordTable";

type Props = {
  keyword: Keyword;
  updateKeyword: (formData: FormData) => Promise<void>;
  deleteKeyword: (id: number) => Promise<void>;
};

export default function KeywordActions({
  keyword,
  updateKeyword,
  deleteKeyword,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(keyword.text);

  const sentenceCount = (keyword as Record<string, unknown>).sentence_count ?? keyword.sentence_count ?? 0;
  const canUpdate = sentenceCount === 0;

  if (editing) {
    return (
      <form
        action={updateKeyword}
        className="flex items-center gap-3"
        onSubmit={() => setEditing(false)}
      >
        <input type="hidden" name="id" value={keyword.id} />

        <input
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button type="submit" className="text-green-600 hover:text-green-800 text-xl">
          💾
        </button>

        <button
          type="button"
          onClick={() => {
            setText(keyword.text);
            setEditing(false);
          }}
          className="text-gray-600 hover:text-gray-800 text-xl"
        >
          ✖
        </button>
      </form>
    );
  }

  return (
    <div className="flex gap-4">
      {canUpdate ? (
        <button
          onClick={() => setEditing(true)}
          className="text-indigo-600 hover:text-indigo-800 text-xl"
          title="Sửa"
        >
          ✏️
        </button>
      ) : (
        <span className="text-gray-400 text-sm" title="Keyword đã được dùng trong sentence, không thể cập nhật">
          —
        </span>
      )}

      <button
        onClick={() => {
          if (confirm("Bạn có chắc muốn xoá từ khóa này?")) deleteKeyword(keyword.id);
        }}
        className="text-red-600 hover:text-red-800 text-xl"
        title="Xoá"
      >
        🗑
      </button>
    </div>
  );
}
