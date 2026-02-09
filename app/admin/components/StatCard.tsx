interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  highlight?: boolean;
  variant?: "default" | "success" | "warning" | "finance";
}

const variantStyles = {
  default: "bg-white border-gray-100 text-gray-900",
  success: "bg-white border-emerald-100 text-gray-900",
  warning: "bg-white border-amber-100 text-gray-900",
  finance: "bg-white border-indigo-100 text-gray-900",
};

const highlightStyles = "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-transparent";

export default function StatCard({ title, value, subtitle, highlight, variant = "default" }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 transition-shadow hover:shadow-md ${
        highlight ? highlightStyles : `border ${variantStyles[variant]}`
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${highlight ? "text-indigo-100" : "text-gray-500"}`}>
        {title}
      </p>
      <p className={`mt-2 text-2xl font-bold tabular-nums ${highlight ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      {subtitle && (
        <p className={`mt-1 text-sm ${highlight ? "text-indigo-100/90" : "text-gray-500"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}