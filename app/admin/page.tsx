import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardCharts from "./components/DashboardCharts";
import { getAdminStats } from "./lib/fetchStats";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getAdminStats();
  const accessToken = (session?.accessToken as string) ?? "";

  return (
    <div className="space-y-8">
      <DashboardCharts initialStats={stats} accessToken={accessToken} />
    </div>
  );
}