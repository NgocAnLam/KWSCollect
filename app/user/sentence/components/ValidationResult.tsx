// app/user/sentences/components/ValidationResult.tsx
"use client";

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
  validation,
}: {
  validation: any;
}) {
  if (!validation) return null;

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl">
        <div
          className={`p-6 rounded-3xl flex items-start gap-5 text-lg font-medium shadow-lg border-4 ${
            validation.valid
              ? "bg-green-50 text-green-800 border-green-300"
              : "bg-red-50 text-red-800 border-red-300"
          }`}
        >
          <AlertCircle className="h-9 w-9 flex-shrink-0 mt-1" />
          <div>
            <p className="text-xl font-black mb-2">
              {validation.valid ? "✓ Tuyệt vời! Bản thu hợp lệ!" : "✗ Chưa đạt yêu cầu"}
            </p>
            <p className="leading-relaxed text-base md:text-lg">
              {validation.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}