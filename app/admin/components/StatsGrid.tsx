// app/admin/components/StatsGrid.tsx
import StatCard from "./StatCard";

interface StatsGridProps {
  pendingCount: number;
}

export default function StatsGrid({ pendingCount }: StatsGridProps) {
  const stats = [
    { title: "Tổng người dùng", value: "1,245" },
    { title: "Từ khóa đã thu", value: "3,892" },
    { title: "Câu dài đã thu", value: "12,430" },
    { title: "Thanh toán chờ duyệt", value: pendingCount.toString(), highlight: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          highlight={stat.highlight}
        />
      ))}
    </div>
  );
}