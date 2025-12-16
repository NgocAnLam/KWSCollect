// app/user/sentences/components/ValidationResult.tsx
"use client";

import axios from "axios";
import { AlertCircle } from "lucide-react";

type Props = {
  audioBlob: Blob | null;
  sentenceId: number | undefined;
  validation: any;
  setValidation: (val: any) => void;
  isValidating: boolean;
  setIsValidating: (val: boolean) => void;
  setRange: (range: [number, number]) => void;
};

export default function ValidationResult({
  audioBlob,
  sentenceId,
  validation,
  setValidation,
  isValidating,
  setIsValidating,
  setRange,
}: Props) {
  const validateRecording = async () => {
    if (!audioBlob || !sentenceId) return;

    setIsValidating(true);
    try {
      const fd = new FormData();
      fd.append("file", audioBlob, "recording.webm");
      fd.append("sentence_id", String(sentenceId));

      const resp = await axios.post(`${process.env.NEXT_PUBLIC_USER_SENTENCE_URL}/validate`, fd);
      const result = resp.data;

      setValidation(result);

      if (result.suggested_start !== undefined && result.suggested_end !== undefined) {
        setRange([result.suggested_start, result.suggested_end]);
      }
    } catch (err: any) {
      alert("Lỗi kiểm tra: " + (err.response?.data?.message || "Server error"));
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={validateRecording}
        disabled={isValidating}
        className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl font-bold text-2xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-70 transition shadow-2xl"
      >
        {isValidating ? "Đang kiểm tra tự động..." : "Kiểm tra bản thu (bắt buộc)"}
      </button>

      {validation && (
        <div
          className={`p-8 rounded-3xl flex items-start gap-6 text-xl font-medium shadow-lg border-4 ${
            validation.valid
              ? "bg-green-50 text-green-800 border-green-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          <AlertCircle className="h-12 w-12 flex-shrink-0" />
          <div>
            <p className="text-2xl font-black mb-2">
              {validation.valid ? "✓ Tuyệt vời! Bản thu hợp lệ!" : "✗ Chưa đạt yêu cầu"}
            </p>
            <p className="leading-relaxed">{validation.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}