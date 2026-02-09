"use client";

import axios from "axios";
import { Upload } from "lucide-react";
import { getApiBase } from "@/lib/api";

// Định nghĩa type cho các props
type Props = {
  userId: number | null;
  sentenceId: number | undefined;
  audioBlob: Blob | null;
  range: [number, number];
  validation: any; // Bạn có thể thay `any` bằng BackendValidationResult nếu muốn rõ ràng hơn
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
  
  // Hàm upload bản thu âm
  const uploadRecording = async () => {
    if (!audioBlob || !sentenceId || !validation?.valid || !userId) {
      alert("Vui lòng đảm bảo bản thu đã được kiểm tra hợp lệ.");
      return;
    }

    const length = range[1] - range[0];
    // Kiểm tra độ dài đoạn keyword có đúng không
    if (length > 2.0) {
      alert(`Đoạn keyword hiện tại dài ${length.toFixed(2)} giây.\n\nVui lòng kéo thanh chọn sát hơn để chỉ bao gồm đúng từ khóa cần nhấn mạnh.`);
      return;
    }

    // Bắt đầu upload
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("user_id", String(userId));
      fd.append("sentence_id", String(sentenceId));
      fd.append("keyword_start", String(range[0]));
      fd.append("keyword_end", String(range[1]));
      fd.append("file", audioBlob, "recording.webm");

      // Gửi yêu cầu upload lên server
      await axios.post(`${getApiBase()}/user/sentence/upload`, fd);
      onSuccess(); // Thực hiện hành động khi upload thành công
    } catch (err: any) {
      alert("Upload thất bại: " + (err.response?.data?.message || "Lỗi server"));
    } finally {
      setIsUploading(false); // Kết thúc trạng thái upload
    }
  };

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={uploadRecording}
        disabled={!validation?.valid || isUploading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
      >
        {isUploading ? "Đang gửi…" : "Câu tiếp theo"}
      </button>
    </div>
  );
}
