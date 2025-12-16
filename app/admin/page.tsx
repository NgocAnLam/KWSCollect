// app/admin/page.tsx
import WelcomeCard from "./components/WelcomeCard";
import StatsGrid from "./components/StatsGrid";
import QuickActions from "./components/QuickActions";
import { getPendingPaymentCount } from "./lib/fetchStats";

export default async function AdminDashboardPage() {
  const pendingCount = await getPendingPaymentCount();

  return (
    <div className="space-y-8">
      {/* Chào mừng */}
      <WelcomeCard />

      {/* Thống kê */}
      <StatsGrid pendingCount={pendingCount} />

      {/* Thao tác nhanh */}
      <QuickActions />
    </div>
  );
}