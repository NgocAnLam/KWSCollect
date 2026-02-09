"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PaymentUser } from "./PaymentRow";

/** Map tên ngân hàng (user profile) sang mã SePay VietQR - https://qr.sepay.vn/ */
const BANK_NAME_TO_SEPAY: Record<string, string> = {
  "Vietcombank - Ngân hàng TMCP Ngoại thương Việt Nam": "Vietcombank",
  "BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam": "BIDV",
  "VietinBank - Ngân hàng TMCP Công Thương Việt Nam": "VietinBank",
  "Agribank - Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam": "Agribank",
  "Techcombank - Ngân hàng TMCP Kỹ thương Việt Nam": "Techcombank",
  "MB Bank - Ngân hàng TMCP Quân Đội": "MBBank",
  "ACB - Ngân hàng TMCP Á Châu": "ACB",
  "Sacombank - Ngân hàng TMCP Sài Gòn Thương Tín": "Sacombank",
  "VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng": "VPBank",
  "SHB - Ngân hàng TMCP Sài Gòn - Hà Nội": "SHB",
  "TPBank - Ngân hàng TMCP Tiên Phong": "TPBank",
  "Eximbank - Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam": "Eximbank",
  "HDBank - Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh": "HDBank",
};

type UserDetail = {
  id: number;
  name: string;
  payment_method: string;
  payment_info: string;
  amount: number;
  payment_status: string;
};

const getMethodLabel = (method: string) => {
  switch (method) {
    case "bank": return "Ngân hàng";
    case "momo": return "Momo";
    case "cash": return "Tiền mặt";
    default: return method || "Không xác định";
  }
};

/** payment_info bank format: "bankName|accNum|accName" */
function buildVietQrUrl(detail: UserDetail): string | null {
  if (detail.payment_method !== "bank" || !detail.payment_info?.trim()) return null;
  const parts = detail.payment_info.split("|").map((p) => p.trim());
  const acc = parts[1] || parts[0];
  const bankName = parts[0] || "";
  if (!acc) return null;
  const sepayBank = BANK_NAME_TO_SEPAY[bankName] || bankName;
  const params = new URLSearchParams();
  params.set("acc", acc);
  params.set("bank", sepayBank);
  params.set("amount", String(detail.amount));
  params.set("des", "THANH TOAN KWS COLLECT");
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

type Props = {
  completedUsers: PaymentUser[];
  onSuccess: () => void;
};

/** Chỉ user chưa thanh toán mới xuất hiện trong dropdown */
function pendingCompletedUsers(users: PaymentUser[]) {
  return users.filter((u) => (u.payment_status || "pending") === "pending");
}

export default function PaymentForm({ completedUsers, onSuccess }: Props) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [transactionCode, setTransactionCode] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const dropdownUsers = useMemo(() => pendingCompletedUsers(completedUsers), [completedUsers]);

  const fetchDetail = useCallback(async (userId: number) => {
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const token = session?.accessToken;
      if (!token) throw new Error("Phiên đăng nhập hết hạn");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/payment/user/${userId}/detail`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Không tải được thông tin");
      const data: UserDetail = await res.json();
      setDetail(data);
    } catch {
      setDetail(null);
    }
  }, []);

  const vietQrUrl = useMemo(() => (detail ? buildVietQrUrl(detail) : null), [detail]);

  useEffect(() => {
    if (!selectedUserId) {
      setDetail(null);
      return;
    }
    fetchDetail(Number(selectedUserId));
  }, [selectedUserId, fetchDetail]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const resetForm = () => {
    setSelectedUserId("");
    setDetail(null);
    setTransactionCode("");
    setProofFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || detail.payment_status !== "pending") {
      alert("Vui lòng chọn user chưa thanh toán và thử lại.");
      return;
    }
    if (!transactionCode.trim()) {
      alert("Vui lòng nhập mã giao dịch.");
      return;
    }
    if (!proofFile) {
      alert("Vui lòng chọn ảnh chụp màn hình giao dịch.");
      return;
    }
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (!session?.accessToken) throw new Error("Phiên đăng nhập hết hạn");

      const formData = new FormData();
      formData.append("file", proofFile);
      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/payment/upload-proof`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.accessToken}` },
          body: formData,
        }
      );
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail || "Upload ảnh thất bại");
      }
      const { path } = await uploadRes.json();

      const payoutRes = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/payment/payout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            user_id: detail.id,
            amount: detail.amount,
            transaction_code: transactionCode.trim(),
            proof_image_path: path,
          }),
        }
      );
      if (!payoutRes.ok) {
        const err = await payoutRes.json().catch(() => ({}));
        throw new Error(err.detail || "Xác nhận thanh toán thất bại");
      }

      const amountStr = new Intl.NumberFormat("vi-VN").format(detail.amount);
      setToast({
        message: `Đã thanh toán thành công cho ${detail.name} với số tiền ${amountStr} đồng`,
      });
      resetForm();
      onSuccess();
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Form thanh toán</h3>
          <p className="text-indigo-100 text-sm mt-0.5">Chọn user chờ thanh toán (đã hoàn thành thu âm)</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn user</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="">-- Chọn user chờ thanh toán --</option>
              {dropdownUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.id} - {u.name}
                </option>
              ))}
              {dropdownUsers.length === 0 && (
                <option value="" disabled>Không có user chờ thanh toán</option>
              )}
            </select>
          </div>

          {detail && detail.payment_status === "pending" && (
            <>
              <div className="border-t border-gray-100 pt-5 mb-5">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Thông tin nhận tiền</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phương thức</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{getMethodLabel(detail.payment_method)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Thông tin nhận tiền</p>
                    <p className="font-mono font-medium text-gray-900 break-all mt-0.5">{detail.payment_info}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-indigo-600 uppercase tracking-wide">Số tiền</p>
                    <p className="font-bold text-indigo-800 text-lg mt-0.5">
                      {new Intl.NumberFormat("vi-VN").format(detail.amount)} đ
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 mb-5">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Mã QR VietQR</h4>
                {vietQrUrl ? (
                  <div className="inline-flex flex-col items-start gap-2">
                    <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <img src={vietQrUrl} alt="VietQR" className="w-44 h-44" />
                    </div>
                    <a href="https://qr.sepay.vn/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">Nguồn: qr.sepay.vn</a>
                  </div>
                ) : (
                  <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 max-w-md">
                    QR VietQR chỉ hỗ trợ chuyển khoản ngân hàng. User chọn Momo/tiền mặt — chuyển thủ công theo thông tin trên.
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã giao dịch</label>
                  <input
                    type="text"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    placeholder="Mã từ app/SMS ngân hàng"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh chụp màn hình giao dịch</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-100 file:font-medium hover:file:bg-gray-200"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !transactionCode.trim() || !proofFile}
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  {loading ? "Đang xử lý…" : "Xác nhận đã thanh toán"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-4 bg-green-700 text-white rounded-xl shadow-lg flex items-center gap-3 max-w-md"
          role="alert"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">✓</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
