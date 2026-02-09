import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getApiBase } from "@/lib/api";

export interface StatsPoint {
  date: string;
  count: number;
}

export interface SessionCountsByStatus {
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface DropOffStepPoint {
  step: string;
  label: string;
  count: number;
}

export interface AdminStats {
  user_count: number;
  keyword_count: number;
  sentence_count: number;
  paid_user: number;
  rejected_user: number;
  keyword_required?: number;
  sentence_required?: number;
  completed_user_count?: number;
  total_payout_amount?: number;
  users_by_date?: StatsPoint[];
  keyword_recordings_by_date?: StatsPoint[];
  sentence_recordings_by_date?: StatsPoint[];
  session_counts?: SessionCountsByStatus;
  drop_off_by_step?: DropOffStepPoint[];
  avg_completion_seconds?: number | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("Không có quyền truy cập");
  }

  try {
    const res = await fetch(`${getApiBase()}/admin/stats`,
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
        completed_user_count: 0,
        total_payout_amount: 0,
        users_by_date: [],
        keyword_recordings_by_date: [],
        sentence_recordings_by_date: [],
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
      completed_user_count: 0,
      total_payout_amount: 0,
      users_by_date: [],
      keyword_recordings_by_date: [],
      sentence_recordings_by_date: [],
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