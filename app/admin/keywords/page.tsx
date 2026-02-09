import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import KeywordTable, { type Keyword } from "./components/KeywordTable";
import CreateKeywordModal from "./components/CreateKeywordModal";

async function getKeywords(): Promise<{ keywords: Keyword[]; error?: string }> {
  const session = await getServerSession(authOptions);
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!baseUrl) {
    return { keywords: [], error: "Thiếu cấu hình NEXT_PUBLIC_SERVER_URL" };
  }
  try {
    const res = await fetch(`${baseUrl}/admin/keyword`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "ngrok-skip-browser-warning": "true",
      },
    });
    if (!res.ok) throw new Error("Không lấy được danh sách từ khóa");
    const data = await res.json();
    const raw = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];
    return { keywords: raw as Keyword[] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lỗi không xác định";
    const cause = e instanceof Error && e.cause ? String((e.cause as { code?: string })?.code ?? "") : "";
    if (cause === "ECONNREFUSED" || message.includes("fetch failed")) {
      return {
        keywords: [],
        error: "Không thể kết nối server. Vui lòng kiểm tra backend đã chạy và NEXT_PUBLIC_SERVER_URL đúng chưa.",
      };
    }
    return { keywords: [], error: message };
  }
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
  const { keywords, error } = await getKeywords();

  return (
    <div className="h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Quản lý Từ khóa</h2>
        <CreateKeywordModal createKeyword={createKeyword} />
      </div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {error}
        </div>
      )}
      <KeywordTable
        keywords={keywords}
        updateKeyword={updateKeyword}
        deleteKeyword={deleteKeyword}
      />
    </div>
  );
}