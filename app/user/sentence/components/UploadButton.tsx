// app/user/sentences/components/UploadButton.tsx
"use client";

import axios from "axios";
import { Upload } from "lucide-react";

type Props = {
  userId: number | null;
  sentenceId: number | undefined;
  audioBlob: Blob | null;
  range: [number, number];
  validation: any;
  isUploading: boolean;
  setIsUploading: (val: boolean) => void;
  onSuccess: () => void;
};

export default function UploadButton({
  userId,
  sentenceId,
  audioBlob,
  range,
  validation,
  isUploading,
  setIsUploading,
  onSuccess,
}: Props) {
  const uploadRecording = async () => {
    if (!audioBlob || !sentenceId || !validation?.valid || !userId) {
      alert("Vui lòng đảm bảo bản thu đã được kiểm tra hợp lệ.");
      return;
    }

    const length = range[1] - range[0];
    if (length > 2.0) {
      alert(`Đoạn keyword hiện tại dài ${length.toFixed(2)} giây.\n\nVui lòng kéo thanh chọn sát hơn để chỉ bao gồm đúng từ khóa cần nhấn mạnh.`);
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("user_id", String(userId));
      fd.append("sentence_id", String(sentenceId));
      fd.append("keyword_start", String(range[0]));
      fd.append("keyword_end", String(range[1]));
      fd.append("file", audioBlob, "recording.webm");

      await axios.post(`${process.env.NEXT_PUBLIC_USER_SENTENCE_URL}/upload`, fd);

      alert("Upload thành công! Chuẩn bị sang câu tiếp theo...");
      onSuccess();
    } catch (err: any) {
      alert("Upload thất bại: " + (err.response?.data?.message || "Lỗi server"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={uploadRecording}
        disabled={!validation?.valid || isUploading}
        className="py-1 px-5 inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-3xl font-bold text-1xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl flex items-center justify-center gap-5"
      >
        <Upload className="h-9 w-9" />
        {isUploading ? "Đang upload..." : "Upload bản thu & Sang câu tiếp theo"}
      </button>
    </div>
    
  );
}