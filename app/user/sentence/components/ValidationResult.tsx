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
      message = "Đang kiểm tra với server…";
      icon = <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />;
      containerClass = "bg-blue-50 text-blue-800 border-blue-200";
      break;

    case "frontend_error":
    case "backend_error":
      title = "Chưa đạt yêu cầu";
      message = state.message;
      icon = <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      containerClass = "bg-red-50 text-red-800 border-red-200";
      break;
  }

  return (
    <div
      className={`rounded-lg border p-3 flex items-start gap-3 text-sm font-medium ${containerClass}`}
    >
      {icon}
      <div className="min-w-0">
        <p className="font-semibold mb-0.5">{title}</p>
        <p className="leading-snug text-gray-700">{message}</p>
      </div>
    </div>
  );
}
