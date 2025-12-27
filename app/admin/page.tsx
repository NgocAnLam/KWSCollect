import StatsGrid from "./components/StatsGrid";
import { getAdminStats } from "./lib/fetchStats";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const totalUser = stats.user_count;
  const totalKeywords = stats.keyword_count;
  const totalSentences = stats.sentence_count;
  const totalPendingPayment = totalUser - stats.paid_user - stats.rejected_user;

  return (
    <div className="space-y-8">
      {/* Thống kê */}
      <StatsGrid
        totalUser={totalUser}
        totalKeywords={totalKeywords}
        totalSentences={totalSentences}
        totalPendingPayment={totalPendingPayment}
      />
    </div>
  );
}