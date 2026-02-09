// app/admin/cross-check/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AlertCircle } from "lucide-react";
import CrossCheckClient from "./CrossCheckClient";

async function getCrossCheckData(accessToken: string) {
  const base = process.env.NEXT_PUBLIC_SERVER_URL;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "ngrok-skip-browser-warning": "true",
  };

  const [summaryRes, pendingRes, acceptedRes, annotatorsRes] = await Promise.all([
    fetch(`${base}/admin/cross-check/summary`, { cache: "no-store", headers }),
    fetch(`${base}/admin/cross-check/recordings?status=pending`, { cache: "no-store", headers }),
    fetch(`${base}/admin/cross-check/recordings?status=accepted`, { cache: "no-store", headers }),
    fetch(`${base}/admin/cross-check/annotators`, { cache: "no-store", headers }),
  ]);

  const summary = summaryRes.ok
    ? ((await summaryRes.json()) as { total_recordings: number; total_annotations: number; total_annotators: number })
    : { total_recordings: 0, total_annotations: 0, total_annotators: 0 };

  const pending = pendingRes.ok
    ? ((await pendingRes.json()) as { recordings: CrossCheckRecording[]; total: number })
    : { recordings: [] as CrossCheckRecording[], total: 0 };

  const accepted = acceptedRes.ok
    ? ((await acceptedRes.json()) as { recordings: CrossCheckRecording[]; total: number })
    : { recordings: [] as CrossCheckRecording[], total: 0 };

  const annotators = annotatorsRes.ok
    ? ((await annotatorsRes.json()) as { annotators: CrossCheckAnnotator[]; total: number })
    : { annotators: [] as CrossCheckAnnotator[], total: 0 };

  return {
    summary,
    recordingsPending: pending.recordings,
    recordingsAccepted: accepted.recordings,
    annotators: annotators.annotators,
  };
}

export type CrossCheckRecording = {
  recording_id: number;
  sentence_text: string;
  keyword_text?: string;
  recorder_user_id: number;
  recorder_name: string;
  recorder_phone: string;
  annotation_count: number;
  created_at: string | null;
  recorder_start?: number;
  recorder_end?: number;
  mean_start?: number;
  mean_end?: number;
  std_start?: number;
  std_end?: number;
};

export type CrossCheckAnnotator = {
  user_id: number;
  name: string;
  phone: string;
  annotation_count: number;
};

export default async function AdminCrossCheckPage() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Không có quyền truy cập</p>
        </div>
      </div>
    );
  }

  let data: Awaited<ReturnType<typeof getCrossCheckData>>;
  try {
    data = await getCrossCheckData(session.accessToken as string);
  } catch (err) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Không tải được dữ liệu cross-check</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kiểm tra chéo (Cross Check)</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi recordings đã thu và số lượng annotation kiểm tra chéo từ người dùng.
          </p>
        </div>
        <CrossCheckClient
          accessToken={session.accessToken as string}
          summary={data.summary}
          recordingsPending={data.recordingsPending}
          recordingsAccepted={data.recordingsAccepted}
          annotators={data.annotators}
        />
      </div>
    </div>
  );
}
