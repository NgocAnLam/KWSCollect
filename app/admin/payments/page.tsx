// app/admin/payments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getApiBase } from "@/lib/api";
import { AlertCircle } from "lucide-react";
import PaymentsHeader from "./components/PaymentsHeader";
import PaymentsFilters from "./components/PaymentsFilters";

async function getPayments(): Promise<{ payments: unknown[] }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) throw new Error("Không có quyền truy cập");

  const baseUrl = getApiBase();
  if (!baseUrl) return { payments: [] };

  try {
    const res = await fetch(`${baseUrl}/admin/payment`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (!res.ok) return { payments: [] };
    const data = await res.json();
    return { payments: Array.isArray(data?.payments) ? data.payments : [] };
  } catch {
    return { payments: [] };
  }
}

export default async function PaymentManagement() {
  let paymentResponse: any = {};

  try {
    paymentResponse = await getPayments();
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">{err.message || "Đã xảy ra lỗi"}</p>
        </div>
      </div>
    );
  }

  // TRÍCH XUẤT ARRAY ĐÚNG
  const payments = paymentResponse.payments || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PaymentsHeader />
        
        <PaymentsFilters initialData={payments} />  {/* ← truyền array */}
      </div>
    </div>
  );
}