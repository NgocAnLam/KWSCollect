import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import KeywordTable from "./components/KeywordTable";
import CreateKeywordModal from "./components/CreateKeywordModal";

async function getKeywords() {
  const session = await getServerSession(authOptions);

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/keyword`, {
    headers: { Authorization: `Bearer ${session?.accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Không lấy được danh sách từ khóa");
  return res.json();
}

// Server Actions
async function createKeyword(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  const text = formData.get("text")?.toString().trim();

  if (!session?.accessToken || !text) {
    return { error: "Từ khóa không hợp lệ" };
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/keyword`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) return { error: "Tạo từ khóa thất bại" };

  revalidatePath("/admin/keywords");
  return { success: true };
}

async function updateKeyword(formData: FormData) {
  "use server";
  const session = await getServerSession(authOptions);
  const id = formData.get("id")?.toString();
  const text = formData.get("text")?.toString().trim();

  if (!session?.accessToken || !id || !text) return;

  await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/keyword/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  revalidatePath("/admin/keywords");
}

async function deleteKeyword(id: number) {
  "use server";
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return;

  await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/keyword/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  revalidatePath("/admin/keywords");
}

export default async function KeywordManagement() {
  const keywords = await getKeywords();

  return (
    <div className="h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý Từ khóa</h2>
        <CreateKeywordModal createKeyword={createKeyword} />
      </div>

      <KeywordTable
        keywords={keywords}
        updateKeyword={updateKeyword}
        deleteKeyword={deleteKeyword}
      />
    </div>
  );
}