"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import PaymentRow, { type PaymentUser } from "./PaymentRow";

export type SortKey =
  | "name"
  | "current_step"
  | "keyword_count"
  | "sentence_count"
  | "created_at"
  | "updated_at"
  | "payment_method"
  | "payment_status";

type Props = {
  initialData: PaymentUser[];
  searchTerm: string;
  statusFilter: string;
  stepFilter: string;
  /** Bảng "Đã thực hiện": ẩn nút thanh toán/từ chối, thanh toán qua form */
  hideActionButtons?: boolean;
  processed?: boolean;
};

function parseDate(v: string | null | undefined): number {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return isNaN(t) ? 0 : t;
}

function stepOrder(step: string): number {
  if (step === "1. Hồ sơ") return 1;
  if (step === "3. Keywords") return 3;
  if (step === "4. Sentences") return 4;
  if (step === "5. Hoàn thành") return 5;
  return 0;
}

export default function PaymentsTable({
  initialData,
  searchTerm,
  statusFilter,
  stepFilter,
  hideActionButtons = false,
  processed = false,
}: Props) {
  const router = useRouter();
  const [data, setData] = useState<PaymentUser[]>(initialData);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setData(initialData);
  }, [initialData]);
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredData = useMemo(() => {
    let list = data.filter((user) => {
      const matchesSearch =
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)) ?? false;
      const matchesStatus =
        statusFilter === "all" || (user.payment_status || "pending") === statusFilter;
      const step = user.current_step ?? "1. Hồ sơ";
      const matchesStep =
        stepFilter === "all" ||
        (stepFilter === "step1" && step === "1. Hồ sơ") ||
        (stepFilter === "in_progress" && (step === "3. Keywords" || step === "4. Sentences")) ||
        (stepFilter === "completed" && step === "5. Hoàn thành");
      return matchesSearch && matchesStatus && matchesStep;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = (a.name ?? "").localeCompare(b.name ?? "");
          break;
        case "current_step":
          cmp = stepOrder(a.current_step ?? "") - stepOrder(b.current_step ?? "");
          break;
        case "keyword_count":
          cmp = (a.keyword_count ?? 0) - (b.keyword_count ?? 0);
          break;
        case "sentence_count":
          cmp = (a.sentence_count ?? 0) - (b.sentence_count ?? 0);
          break;
        case "updated_at":
          cmp = parseDate(a.updated_at) - parseDate(b.updated_at);
          break;
        case "payment_method":
          cmp = (a.payment_method ?? "").localeCompare(b.payment_method ?? "");
          break;
        case "payment_status":
          cmp = (a.payment_status ?? "pending").localeCompare(b.payment_status ?? "pending");
          break;
        default:
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [data, searchTerm, statusFilter, stepFilter, sortKey, sortDir]);

  const handleAction = async (userId: number, action: "paid" | "rejected") => {
    if (!confirm(`Bạn có chắc muốn ${action === "paid" ? "xác nhận thanh toán" : "từ chối"} yêu cầu này?`))
      return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/payment/mark-${action === "paid" ? "paid" : "rejected"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      if (!res.ok) throw new Error(await res.text() || "Thao tác thất bại");
      setData((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, payment_status: action === "paid" ? "paid" : "rejected" }
            : u
        )
      );
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const Th = ({
    label,
    keyName,
    className = "",
  }: {
    label: string;
    keyName: SortKey;
    className?: string;
  }) => (
    <th className={className}>
      <button
        type="button"
        onClick={() => toggleSort(keyName)}
        className="flex items-center gap-1 text-left text-sm font-semibold text-gray-700 hover:text-indigo-600"
      >
        {label}
        {sortKey === keyName ? (
          sortDir === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : null}
      </button>
    </th>
  );

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
        Không có dữ liệu phù hợp với bộ lọc
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <Th label="Người dùng" keyName="name" className="px-4 py-3" />
              <Th label="Bước hiện tại" keyName="current_step" className="px-4 py-3" />
              <Th label="Keyword" keyName="keyword_count" className="px-4 py-3" />
              <Th label="Sentence" keyName="sentence_count" className="px-4 py-3" />
              <Th label="Cập nhật" keyName="updated_at" className="px-4 py-3" />
              <Th label="Phương thức" keyName="payment_method" className="px-4 py-3" />
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Thông tin nhận tiền
              </th>
              <Th label="Trạng thái" keyName="payment_status" className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((user) => (
              <PaymentRow
                key={user.id}
                user={user}
                loading={loading}
                onAction={handleAction}
                hideActionButtons={hideActionButtons}
                processed={processed}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
