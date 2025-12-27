interface StatCardProps {
  title: string;
  value: string;
  highlight?: boolean;
}

export default function StatCard({ title, value, highlight }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 transition-all ${
        highlight
          ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
          : "bg-white hover:shadow-xl"
      }`}
    >
      <p className={`text-sm font-medium ${highlight ? "opacity-90" : "text-gray-600"}`}>
        {title}
      </p>
      
      <p className="text-4xl font-bold mt-3">
        {value}
      </p>

    </div>
  );
}