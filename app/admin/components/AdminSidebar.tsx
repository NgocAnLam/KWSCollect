"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Key, FileText, DollarSign, CheckSquare, LogOut } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/keywords", label: "Keywords", icon: Key },
  { href: "/admin/sentences", label: "Sentences", icon: FileText },
  { href: "/admin/cross-check", label: "Cross check", icon: CheckSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-[80vh] w-64 bg-indigo-800 text-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-6 py-3 transition ${
                isActive ? "bg-indigo-900 border-l-4 border-white" : "hover:bg-indigo-700"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-6">
        <Link href="/api/auth/signout" className="flex items-center gap-3 text-sm opacity-80 hover:opacity-100">
          <LogOut size={18} />
          Đăng xuất
        </Link>
      </div>
    </aside>
  );
}