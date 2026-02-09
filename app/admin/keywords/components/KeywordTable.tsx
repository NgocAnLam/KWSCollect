"use client";

import { useState, useMemo } from "react";
import KeywordActions from "./KeywordActions";

const PAGE_SIZE = 10;

export type Keyword = {
  id: number;
  text: string;
  record_count?: number;
  recordCount?: number;
  sentence_count?: number;
};

type Props = {
  keywords: Keyword[];
  updateKeyword: (formData: FormData) => Promise<void>;
  deleteKeyword: (id: number) => Promise<void>;
};

export default function KeywordTable({ keywords, updateKeyword, deleteKeyword }: Props) {
  const [page, setPage] = useState(1);
  const list = Array.isArray(keywords) ? keywords : [];

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const paginated = useMemo(
    () => list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [list, page]
  );

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
        Chưa có từ khóa nào
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
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Từ khóa</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Số bản ghi</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-700">Số sentence dùng</th>
              <th className="text-right px-6 py-4 font-semibold text-gray-700">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {paginated.map((kw) => (
              <tr key={kw.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-600">{kw.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{kw.text}</td>
                <td className="px-6 py-4 text-gray-600">
                  {(kw as Keyword).record_count ?? kw.recordCount ?? 0}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {(kw as Keyword).sentence_count ?? kw.sentence_count ?? 0}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <KeywordActions
                      keyword={kw}
                      updateKeyword={updateKeyword}
                      deleteKeyword={deleteKeyword}
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
            Trang {page} / {totalPages} ({(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, list.length)} / {list.length})
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
