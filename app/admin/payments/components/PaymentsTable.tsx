'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import PaymentRow from "./PaymentRow";

type Props = {
  initialData: any[];
  searchTerm: string;
  statusFilter: string;
};

export default function PaymentsTable({ initialData, searchTerm, statusFilter }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const filteredData = data.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (user.payment_status || "pending") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAction = async (userId: number, action: "paid" | "rejected") => {
    if (!confirm(`Bạn có chắc muốn ${action === "paid" ? "xác nhận thanh toán" : "từ chối"} yêu cầu này?`)) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/payment/mark-${action === "paid" ? "paid" : "rejected"}`, {
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
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

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
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Người dùng</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phương thức</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thông tin nhận tiền</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((user) => (
              <PaymentRow
                key={user.id}
                user={user}
                loading={loading}
                onAction={handleAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}