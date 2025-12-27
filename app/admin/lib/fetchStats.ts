import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AdminStats {
  user_count: number;
  keyword_count: number;
  sentence_count: number;
  paid_user: number;
  rejected_user: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("Không có quyền truy cập");
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/admin/stats`,
      {
        cache: "no-store",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch admin stats:", res.status);
      // Trả về giá trị mặc định để tránh crash UI
      return {
        user_count: 0,
        keyword_count: 0,
        sentence_count: 0,
        paid_user: 0,
        rejected_user: 0,
      };
    }

    const data = await res.json();
    return data as AdminStats;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      user_count: 0,
      keyword_count: 0,
      sentence_count: 0,
      paid_user: 0,
      rejected_user: 0,
    };
  }
}

// Nếu vẫn cần riêng pending count ở nơi khác, có thể export thêm
export async function getPendingPaymentCount(): Promise<number> {
  const stats = await getAdminStats();
  const totalUsers = stats.user_count;
  const paid = stats.paid_user;
  const rejected = stats.rejected_user;
  return totalUsers - paid - rejected;
}