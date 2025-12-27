'use client';

import { useState } from "react";
import { Search, Download } from "lucide-react";
import PaymentsTable from "./PaymentsTable";

type Props = {initialData: any[]};

export default function PaymentsFilters({ initialData }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const exportToCSV = () => {
    const headers = ["Tên", "SĐT", "Phương thức", "Thông tin nhận tiền", "Trạng thái"];
    const rows = initialData.map((u) => [
      u.name,
      u.phone,
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
              placeholder="Tìm theo tên hoặc số điện thoại..."
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
        </div>

        <button
          onClick={exportToCSV}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
        >
          <Download className="h-5 w-5" />
          Xuất CSV
        </button>
      </div>

      {/* TRUYỀN ĐẦY ĐỦ PROPS CHO PaymentsTable */}
      <PaymentsTable
        initialData={initialData}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />
    </div>
  );
}