"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";

export type PaymentUser = {
  id: number;
  name: string;
  phone: string;
  payment_method: string;
  payment_info: string;
  payment_label: string;
  payment_status: string;
  created_at?: string | null;
  updated_at?: string | null;
  current_step?: string;
  keyword_count?: number;
  keyword_required?: number;
  sentence_count?: number;
  sentence_required?: number;
};

type Props = {
  user: PaymentUser;
  loading: boolean;
  onAction: (userId: number, action: "paid" | "rejected") => void;
  /** Khi true: không hiện nút thanh toán/từ chối, chỉ hiện text (thanh toán qua form bên dưới) */
  hideActionButtons?: boolean;
  processed?: boolean;
};

const getStatusConfig = (status: string) => {
  switch (status || "pending") {
    case "paid":
      return { label: "Đã thanh toán", color: "bg-green-100 text-green-800", icon: CheckCircle };
    default:
      return { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800", icon: Clock };
  }
};

/** Trạng thái "Đã xong" dùng cho trường hợp Không nhận tiền (Bảng đã thực hiện) */
const DONE_STATUS_CONFIG_PROCESSED = {
  label: "Đã xong",
  color: "bg-green-100 text-green-800",
  icon: CheckCircle,
};
const DONE_STATUS_CONFIG_NOT_PROCESSED = {
  label: "Chờ duyệt",
  color: "bg-yellow-100 text-yellow-800",
  icon: Clock,
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case "bank": return "Ngân hàng";
    case "momo": return "Momo";
    case "cash": return "Tiền mặt";
    default: return "Không xác định";
  }
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";

  // hour + 7 hours
  try {
    const d = new Date(iso);
    const d2 = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return d2.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

/** Row background: green = completed, yellow = in progress, none = step 1 only */
function getRowBg(user: PaymentUser) {
  const step = user.current_step ?? "1. Hồ sơ";
  if (step === "5. Hoàn thành") return "bg-green-50";
  if (step === "3. Keywords" || step === "4. Sentences") return "bg-amber-50";
  return "";
}

/** Giá trị cột "Thông tin nhận tiền" khi không nhận tiền */
const NO_PAYMENT_LABEL = "Không nhận tiền";

function isNoPayment(user: PaymentUser): boolean {
  if (user.payment_method === "none") return true;
  const info = (user.payment_label || user.payment_info || "").trim();
  return info.toLowerCase() === NO_PAYMENT_LABEL.toLowerCase();
}

export default function PaymentRow({ user, loading, onAction, hideActionButtons = false, processed = false }: Props) {
  const noPayment = isNoPayment(user);
  const status = user.payment_status || "pending";
  const statusConfig = noPayment ? (processed ? DONE_STATUS_CONFIG_PROCESSED : DONE_STATUS_CONFIG_NOT_PROCESSED) : getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const rowBg = getRowBg(user);
  const paymentInfoDisplay = user.payment_method === "none" ? NO_PAYMENT_LABEL : (user.payment_label || user.payment_info || "-");

  const REPEATS = process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT ? parseInt(process.env.NEXT_PUBLIC_KEYWORD_RECORDING_REPEAT_COUNT) : 2;

  const kwReq = user.keyword_required ?? 0;
  const sentReq = user.sentence_required ?? 10;
  const kwStr = kwReq > 0 ? `${user.keyword_count ?? 0}/${kwReq * REPEATS}` : "-";
  const sentStr = `${user.sentence_count ?? 0}/${sentReq}`;

  return (
    <tr className={`hover:opacity-90 transition ${rowBg}`}>
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-600">{user.phone}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {user.current_step ?? "1. Hồ sơ"}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-800">
        {kwStr}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-800">
        {sentStr}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {formatDateTime(user.updated_at).split(" ")[0]}
        <br />
        {formatDateTime(user.updated_at).split(" ")[1]}
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-medium">{getMethodLabel(user.payment_method)}</span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700 break-all max-w-[140px]">
          {paymentInfoDisplay}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
          <StatusIcon className="h-4 w-4" />
          {statusConfig.label}
        </span>
      </td>
    </tr>
  );
}
