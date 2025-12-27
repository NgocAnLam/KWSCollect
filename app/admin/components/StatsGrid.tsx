import StatCard from "./StatCard";

interface StatsGridProps {
  totalUser: number;
  totalKeywords: number;
  totalSentences: number;
  totalPendingPayment: number;
}

export default function StatsGrid({ 
  totalUser, 
  totalKeywords, 
  totalSentences, 
  totalPendingPayment 
}: StatsGridProps) {

  const stats = [
    { title: "Tổng người dùng", value: totalUser.toString() },
    { title: "Tổng số audio keyword đã thu", value: totalKeywords.toString() },
    { title: "Tổng số audio Sentence đã thu", value: totalSentences.toString() },
    { title: "Tổng số thanh toán chờ duyệt",
      value: totalPendingPayment.toString(),
      highlight: totalPendingPayment > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          highlight={stat.highlight ?? false}
        />
      ))}
    </div>
  );
}