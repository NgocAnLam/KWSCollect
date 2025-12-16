// app/admin/components/QuickActions.tsx
import ActionButton from "./ActionButton";

export default function QuickActions() {
  const actions = [
    { href: "/admin/keywords", label: "Quản lý từ khóa" },
    { href: "/admin/sentences", label: "Quản lý câu dài" },
    { href: "/admin/payments", label: "Duyệt thanh toán" },
    { href: "/admin/cross-check", label: "Kiểm tra chéo" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Thao tác nhanh</h3>
      <div className="flex flex-wrap gap-4">
        {actions.map((action) => (
          <ActionButton key={action.href} href={action.href} label={action.label} />
        ))}
      </div>
    </div>
  );
}