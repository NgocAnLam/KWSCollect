// app/admin/components/WelcomeCard.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WelcomeCard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        Xin chào, {session?.user?.name || "Admin"} 👋
      </h2>
      <p className="text-lg text-gray-600">
        Chào mừng bạn đến với hệ thống quản trị <strong>KWS Collection</strong>
      </p>
    </div>
  );
}