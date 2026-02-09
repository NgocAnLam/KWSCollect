'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Download } from "lucide-react";
import PaymentsTable from "./PaymentsTable";
import PaymentForm from "./PaymentForm";
import type { PaymentUser } from "./PaymentRow";

type Props = { initialData: PaymentUser[] };

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return "-";
  }
}

export default function PaymentsFilters({ initialData }: Props) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stepFilter, setStepFilter] = useState<string>("all");

  const inProgress = useMemo(
    () => initialData.filter((u) => (u.current_step ?? "") !== "5. Hoàn thành"),
    [initialData]
  );
  const completed = useMemo(
    () => initialData.filter((u) => (u.current_step ?? "") === "5. Hoàn thành"),
    [initialData]
  );

  const exportToCSV = () => {
    const headers = [
      "Tên",
      "SĐT",
      "Bước hiện tại",
      "Keyword",
      "Sentence",
      "Cập nhật",
      "Phương thức",
      "Thông tin nhận tiền",
      "Trạng thái",
    ];
    const rows = initialData.map((u) => [
      u.name,
      u.phone,
      u.current_step ?? "1. Hồ sơ",
      u.keyword_required ? `${u.keyword_count ?? 0}/${u.keyword_required}` : "-",
      `${u.sentence_count ?? 0}/${u.sentence_required ?? 10}`,
      formatDateTime(u.created_at),
      formatDateTime(u.updated_at),
      u.payment_method === "bank" ? "Ngân hàng" : u.payment_method === "momo" ? "Momo" : u.payment_method === "cash" ? "Tiền mặt" : "Không xác định",
      u.payment_label || u.payment_info || "-",
      u.payment_status === "paid" ? "Đã thanh toán" : u.payment_status === "rejected" ? "Bị từ chối" : "Chờ duyệt",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${(cell + "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `thanh-toan-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Thanh filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="paid">Đã thanh toán</option>
            <option value="rejected">Bị từ chối</option>
          </select>

          <select
            value={stepFilter}
            onChange={(e) => setStepFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả bước</option>
            <option value="step1">Chỉ bước 1 (Hồ sơ)</option>
            <option value="in_progress">Đang thu thập</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>

        <button
          onClick={exportToCSV}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
        >
          <Download className="h-5 w-5" />
          Xuất CSV
        </button>
      </div>

      {/* Bảng 1: Đang thực hiện (dòng vàng/trắng) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Bảng đang thực hiện</h2>
        <PaymentsTable
          initialData={inProgress}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          stepFilter={stepFilter}
          processed={false}
        />
      </section>

      {/* Bảng 2: Đã thực hiện (dòng xanh) */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Bảng đã thực hiện</h2>
        <PaymentsTable
          initialData={completed}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          stepFilter={stepFilter}
          hideActionButtons
          processed={true}
        />
      </section>

      {/* Form thanh toán cho user trong bảng đã thực hiện */}
      <PaymentForm
        completedUsers={completed}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}