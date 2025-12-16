// app/admin/components/AdminHeader.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 md:px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:inline">Chào mừng,</span>
          <span className="font-semibold text-indigo-600">
            {session?.user?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}