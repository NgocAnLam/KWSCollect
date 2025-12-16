// app/admin/keywords/components/KeywordTable.tsx
import KeywordActions from "./KeywordActions";

type Keyword = {
  id: number;
  text: string;
  recordCount?: number;
};

type Props = {
  keywords: Keyword[];
  updateKeyword: (formData: FormData) => Promise<void>;
  deleteKeyword: (id: number) => Promise<void>;
};

export default function KeywordTable({ keywords, updateKeyword, deleteKeyword }: Props) {
  if (keywords.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500">
        Chưa có từ khóa nào
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-8 py-4 font-semibold text-gray-700">ID</th>
              <th className="text-left px-8 py-4 font-semibold text-gray-700">Từ khóa</th>
              <th className="text-left px-8 py-4 font-semibold text-gray-700">Số bản ghi</th>
              <th className="text-right px-8 py-4 font-semibold text-gray-700">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {keywords.map((kw) => (
              <tr key={kw.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-5 text-gray-600">{kw.id}</td>
                <td className="px-8 py-5 font-medium text-gray-900">{kw.text}</td>
                <td className="px-8 py-5 text-gray-600">{kw.recordCount || 0}</td>
                <td className="px-8 py-5">
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
    </div>
  );
}