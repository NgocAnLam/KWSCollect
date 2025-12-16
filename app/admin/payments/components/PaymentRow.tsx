// app/admin/payments/components/PaymentRow.tsx
import { CheckCircle, XCircle, Clock } from "lucide-react";

type Props = {
  user: any;
  loading: boolean;
  onAction: (userId: number, action: "paid" | "rejected") => void;
};

const getStatusConfig = (status: string) => {
  switch (status || "pending") {
    case "paid":
      return { label: "Đã thanh toán", color: "bg-green-100 text-green-800", icon: CheckCircle };
    case "rejected":
      return { label: "Bị từ chối", color: "bg-red-100 text-red-800", icon: XCircle };
    default:
      return { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800", icon: Clock };
  }
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case "bank": return "Ngân hàng";
    case "momo": return "Momo";
    case "cash": return "Tiền mặt";
    default: return "Không xác định";
  }
};

export default function PaymentRow({ user, loading, onAction }: Props) {
  const status = user.payment_status || "pending";
  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-5">
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-600">{user.phone}</p>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="text-sm font-medium">{getMethodLabel(user.payment_method)}</span>
      </td>
      <td className="px-6 py-5">
        <p className="font-mono text-sm text-gray-700 break-all max-w-xs">
          {user.payment_label || user.payment_info || "-"}
        </p>
      </td>
      <td className="px-6 py-5">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
          <StatusIcon className="h-4 w-4" />
          {statusConfig.label}
        </span>
      </td>
      <td className="px-6 py-5 text-center">
        {status === "pending" ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => onAction(user.id, "paid")}
              disabled={loading}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              title="Xác nhận thanh toán"
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => onAction(user.id, "rejected")}
              disabled={loading}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              title="Từ chối"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Đã xử lý</span>
        )}
      </td>
    </tr>
  );
}