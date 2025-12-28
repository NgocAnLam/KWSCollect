"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { ValidationState } from "../sentence"; // Đảm bảo import đúng path

export default function ValidationResult({
  state,
}: {
  state: ValidationState;
}) {
  // Nếu trạng thái là "idle" hoặc "success", không hiển thị gì cả
  if (state.status === "idle" || state.status === "success") return null;

  let title = "";
  let message = "";
  let icon = null;
  let containerClass = "";

  switch (state.status) {
    case "validating_backend":
      title = "Đang kiểm tra";
      message = "Đang kiểm tra tự động với server...";
      icon = <Loader2 className="h-8 w-8 animate-spin" />;
      containerClass = "bg-blue-50 text-blue-800 border-blue-300";
      break;

    case "frontend_error":
    case "backend_error":
      title = "✗ Chưa đạt yêu cầu";
      message = state.message;
      icon = <AlertCircle className="h-8 w-8" />;
      containerClass = "bg-red-50 text-red-800 border-red-300";
      break;
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl">
        <div
          className={`p-6 rounded-3xl flex items-start gap-5 text-lg font-medium shadow-lg border-4 ${containerClass}`}
        >
          {icon}
          <div>
            <p className="text-xl font-black mb-2">{title}</p>
            <p className="leading-relaxed text-base md:text-lg">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
