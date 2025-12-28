// app/admin/sentences/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SentencesHeader from "./components/SentencesHeader";
import SentenceGrid from "./components/SentenceGrid";

async function getSentences() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) throw new Error("Unauthorized");

  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/sentence`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    // Nếu không phải 401, thông báo lỗi chi tiết hơn
    const errorText = await res.text(); // Lấy dữ liệu trả về dưới dạng text
    throw new Error(`Không thể tải danh sách câu. Lỗi: ${res.status} - ${errorText}`);
  }

  // Cố gắng phân tích phản hồi dưới dạng JSON
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Dữ liệu trả về không phải JSON. Vui lòng kiểm tra API.");
  }
}

export default async function SentenceManagement() {
  let sentences: any[] = [];

  try {
    sentences = await getSentences();
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-6 inline-block mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</p>
          <p className="text-lg text-gray-600">{err.message || "Đã xảy ra lỗi"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <SentencesHeader />
        <SentenceGrid sentences={sentences} />
      </div>
    </div>
  );
}


// export default async function SentenceManagement() {
//   let sentences: any[] = [];

//   try {
//     sentences = await getSentences();
//   } catch (err: any) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-8">
//         <div className="text-center">
//           <div className="bg-red-100 rounded-full p-6 inline-block mb-6">
//             <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <p className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</p>
//           <p className="text-lg text-gray-600">{err.message || "Đã xảy ra lỗi"}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         <SentencesHeader />
//         <SentenceGrid sentences={sentences} />
//       </div>
//     </div>
//   );
// }