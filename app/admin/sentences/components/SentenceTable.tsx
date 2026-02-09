"use client";

import { useState, useMemo } from "react";
import SentenceActions from "./SentenceActions";

const PAGE_SIZE = 4;

export type Sentence = {
  id: number;
  text: string;
  keyword: string;
  record_count?: number;
  recordCount?: number;
  is_used?: boolean;
};

type Props = {
  sentences: Sentence[];
  updateSentence: (formData: FormData) => Promise<void>;
  deleteSentence: (id: number) => Promise<void>;
};

export default function SentenceTable({
  sentences,
  updateSentence,
  deleteSentence,
}: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(sentences.length / PAGE_SIZE));
  const paginated = useMemo(
    () => sentences.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sentences, page]
  );

  if (sentences.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
        Chưa có câu nào. Hãy thêm câu đầu tiên để bắt đầu!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">ID</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Script</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Keyword</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Số bản ghi</th>
              <th className="text-right px-6 py-4 font-semibold text-gray-700">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginated.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{s.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900 max-w-md">{s.text}</td>
                <td className="px-6 py-4 text-gray-700">
                  <span className="font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded">
                    {s.keyword}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {s.record_count ?? s.recordCount ?? 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <SentenceActions
                      sentence={s}
                      updateSentence={updateSentence}
                      deleteSentence={deleteSentence}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Trang {page} / {totalPages} ({(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sentences.length)} / {sentences.length})
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
