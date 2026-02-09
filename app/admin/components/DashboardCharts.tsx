"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getApiBase } from "@/lib/api";
import type { AdminStats, StatsPoint } from "../lib/fetchStats";
import StatCard from "./StatCard";

const REFRESH_INTERVAL_MS = 30000;
const CHART_DAYS = 30;

async function fetchStatsClient(accessToken: string): Promise<AdminStats> {
  const res = await fetch(
    `${getApiBase()}/admin/stats`,
    { cache: "no-store", headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json() as Promise<AdminStats>;
}

function formatDateLabel(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  } catch {
    return dateStr;
  }
}

/** 30 ngày gần nhất theo UTC (khớp với backend stats). */
function lastNDays(days: number): string[] {
  const out: string[] = [];
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayUtc - i * 24 * 60 * 60 * 1000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

interface DashboardChartsProps {
  initialStats: AdminStats;
  accessToken: string;
}

const PAYMENT_COLORS = { paid: "#10b981", rejected: "#ef4444", pending: "#f59e0b" };

export default function DashboardCharts({
  initialStats,
  accessToken,
}: DashboardChartsProps) {
  const [stats, setStats] = useState<AdminStats>(initialStats);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const next = await fetchStatsClient(accessToken);
      setStats(next);
    } catch {
      // keep previous
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const pendingPayment = Math.max(
    0,
    stats.user_count - (stats.paid_user ?? 0) - (stats.rejected_user ?? 0)
  );
  const kwReq = stats.keyword_required ?? 0;
  const sentReq = stats.sentence_required ?? 10;
  const completedCount = stats.completed_user_count ?? 0;
  const totalPayout = stats.total_payout_amount ?? 0;

  const dateRange = useMemo(() => lastNDays(CHART_DAYS), []);
  const usersByDate = stats.users_by_date ?? [];
  const kwByDate = stats.keyword_recordings_by_date ?? [];
  const sentByDate = stats.sentence_recordings_by_date ?? [];

  const usersChartData = useMemo(() => {
    const map = new Map(usersByDate.map((p) => [p.date, p.count]));
    return dateRange.map((date) => ({
      date: formatDateLabel(date),
      fullDate: date,
      users: map.get(date) ?? 0,
    }));
  }, [usersByDate, dateRange]);

  const audioChartData = useMemo(() => {
    const kwMap = new Map(kwByDate.map((p) => [p.date, p.count]));
    const sentMap = new Map(sentByDate.map((p) => [p.date, p.count]));
    return dateRange.map((date) => ({
      date: formatDateLabel(date),
      fullDate: date,
      keyword: kwMap.get(date) ?? 0,
      sentence: sentMap.get(date) ?? 0,
    }));
  }, [kwByDate, sentByDate, dateRange]);

  const paymentPieData = useMemo(
    () => [
      { name: "Đã thanh toán", value: stats.paid_user ?? 0, color: PAYMENT_COLORS.paid },
      { name: "Từ chối", value: stats.rejected_user ?? 0, color: PAYMENT_COLORS.rejected },
      { name: "Chờ duyệt", value: pendingPayment, color: PAYMENT_COLORS.pending },
    ].filter((d) => d.value > 0),
    [stats.paid_user, stats.rejected_user, pendingPayment]
  );

  const hasUsersChart = usersChartData.some((d) => d.users > 0);
  const hasAudioChart = audioChartData.some((d) => d.keyword > 0 || d.sentence > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Collect</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tổng quan vận hành thu thập dữ liệu giọng nói — KPIs, xu hướng, thanh toán
          </p>
        </div>
        {loading && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
            Đang cập nhật…
          </span>
        )}
      </div>

      {/* Row 1: KPI Cards — Growth & Collection */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Chỉ số chính
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Tổng người dùng"
            value={stats.user_count.toString()}
            subtitle="Đăng ký collect"
          />
          <StatCard
            title="Hoàn thành thu âm"
            value={completedCount.toString()}
            subtitle={`/ ${stats.user_count} user`}
            variant="success"
          />
          <StatCard
            title="Audio Keyword"
            value={stats.keyword_count.toString()}
            subtitle={kwReq > 0 ? `Mục tiêu: ${kwReq}` : undefined}
            variant="success"
          />
          <StatCard
            title="Audio Sentence"
            value={stats.sentence_count.toString()}
            subtitle={sentReq > 0 ? `Mục tiêu: ${sentReq} / user` : undefined}
            variant="success"
          />
          <StatCard
            title="Đã thanh toán"
            value={(stats.paid_user ?? 0).toString()}
            variant="finance"
          />
          <StatCard
            title="Chờ duyệt"
            value={pendingPayment.toString()}
            highlight={pendingPayment > 0}
          />
        </div>
      </section>

      {/* Row 2: Finance KPI */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Tài chính
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Tổng tiền đã chi"
            value={new Intl.NumberFormat("vi-VN").format(totalPayout) + " đ"}
            subtitle="Từ payouts đã duyệt"
            variant="finance"
          />
        </div>
      </section>

      {/* Row 2b: Session & Progress (user_collection_sessions + collection_progress) */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Phiên thu thập & Tiến độ
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                title="Chờ bắt đầu"
                value={(stats.session_counts?.pending ?? 0).toString()}
                subtitle="pending"
              />
              <StatCard
                title="Đang làm"
                value={(stats.session_counts?.in_progress ?? 0).toString()}
                subtitle="in_progress"
                highlight={(stats.session_counts?.in_progress ?? 0) > 0}
              />
              <StatCard
                title="Hoàn thành"
                value={(stats.session_counts?.completed ?? 0).toString()}
                subtitle="completed"
                variant="success"
              />
              <StatCard
                title="Đã hủy"
                value={(stats.session_counts?.cancelled ?? 0).toString()}
                subtitle="cancelled"
              />
            </div>
            {stats.avg_completion_seconds != null && stats.avg_completion_seconds > 0 && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
                <span className="font-medium">Thời gian TB hoàn thành 1 phiên:</span>{" "}
                {stats.avg_completion_seconds < 60
                  ? `${Math.round(stats.avg_completion_seconds)} giây`
                  : `${(stats.avg_completion_seconds / 60).toFixed(1)} phút`}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-1">Drop-off theo bước</h3>
            <p className="text-xs text-gray-500 mb-4">Số phiên đạt progress 100% tại mỗi bước</p>
            {(stats.drop_off_by_step?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={stats.drop_off_by_step ?? []}
                  layout="vertical"
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 10 }}
                    width={120}
                    tickFormatter={(v) => (v.length > 18 ? v.slice(0, 17) + "…" : v)}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.[0] ? (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                          <p className="font-medium text-gray-800">{payload[0].payload.label}</p>
                          <p className="text-indigo-600">Số phiên: {payload[0].value}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Số phiên" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
                Chưa có dữ liệu tiến độ theo bước
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Row 3: Time-series — Users & Audio (side by side) */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Người dùng đăng ký theo ngày
          </h3>
          <p className="text-xs text-gray-500 mb-4">{CHART_DAYS} ngày gần nhất</p>
          {hasUsersChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={usersChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                        <p className="text-gray-500">{payload[0].payload.fullDate}</p>
                        <p className="font-semibold text-indigo-600">Số người: {payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu theo ngày
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Audio thu theo ngày
          </h3>
          <p className="text-xs text-gray-500 mb-4">Keyword & Sentence — {CHART_DAYS} ngày</p>
          {hasAudioChart ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={audioChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                        <p className="text-gray-500">{payload[0].payload.fullDate}</p>
                        <p className="font-semibold text-emerald-600">Keyword: {payload[0].payload.keyword}</p>
                        <p className="font-semibold text-purple-600">Sentence: {payload[0].payload.sentence}</p>
                      </div>
                    ) : null
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="keyword"
                  name="Keyword"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sentence"
                  name="Sentence"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu theo ngày
            </div>
          )}
        </div>
      </section>

      {/* Row 4: Payment status (donut) + optional sentence bar for consistency */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Trạng thái thanh toán
          </h3>
          <p className="text-xs text-gray-500 mb-4">Phân bố Đã thanh toán / Từ chối / Chờ duyệt</p>
          {paymentPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={paymentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {paymentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // formatter={(value: number ) => [value ?? 0, ""]}
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                        <p className="font-medium text-gray-800">{payload[0].name}</p>
                        <p className="text-gray-600">Số user: {payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu thanh toán
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Audio Sentence thu theo ngày
          </h3>
          <p className="text-xs text-gray-500 mb-4">{CHART_DAYS} ngày gần nhất</p>
          {audioChartData.some((d) => d.sentence > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={audioChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm">
                        <p className="text-gray-500">{payload[0].payload.fullDate}</p>
                        <p className="font-semibold text-purple-600">Sentence: {payload[0].value}</p>
                      </div>
                    ) : null
                  }
                />
                <Bar dataKey="sentence" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sentence" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-gray-400 text-sm">
              Chưa có dữ liệu theo ngày
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
