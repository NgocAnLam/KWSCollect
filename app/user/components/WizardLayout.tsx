// app/user/components/WizardLayout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Home } from "lucide-react";
import type { Step } from "../constants";

interface StepInfo {
  id: Step;
  title: string;
  description: string;
}

const steps: StepInfo[] = [
  { id: 1, title: "Thông tin cá nhân", description: "Khai báo thông tin người dùng" },
  { id: 2, title: "Kiểm tra Micro", description: "Kiểm tra Micro và mức âm thanh" },
  { id: 3, title: "Thu thập keyword", description: "Ghi âm các từ khóa ngắn" },
  { id: 4, title: "Thu thập câu dài", description: "Ghi âm các câu nói dài" },
  { id: 5, title: "Kiểm tra chéo", description: "Xem lại và xác nhận dữ liệu" },
];

interface WizardLayoutProps {
  currentStep: Step;
  userInfo: any;
  userId: number | null;
  micTestPassed: boolean;
  keywordRecordingCompleted: boolean;
  sentenceRecordingCompleted: boolean;
  crossCheckCompleted: boolean;
  profileValid?: boolean;
  onStepChange: (step: Step) => void;
  onBack: () => void;
  onNext: () => void;
  onFinish?: () => Promise<void>;
  children: React.ReactNode;
}

export default function WizardLayout({
  currentStep,
  userInfo,
  userId,
  micTestPassed,
  keywordRecordingCompleted,
  sentenceRecordingCompleted,
  crossCheckCompleted,
  onStepChange,
  onBack,
  onNext,
  onFinish,
  children,
  profileValid,
}: WizardLayoutProps) {
  const isStepCompleted = (step: Step): boolean => {
    if (step === 1) return userId !== null;
    if (step === 2) return micTestPassed;
    if (step === 3) return keywordRecordingCompleted;
    if (step === 4) return sentenceRecordingCompleted;
    if (step === 5) return crossCheckCompleted;
    return false;
  };

  const currentStepInfo = steps.find((s) => s.id === currentStep)!;

  /**
   * Cho phép "Tiếp theo" khi có thể hoàn thành bước hiện tại.
   * Bước 1: form hợp lệ (profileValid) hoặc đã đăng ký (userId) — bấm Tiếp theo sẽ gửi form rồi chuyển bước.
   * Bước 2–5: phải hoàn thành bước đó (mic/keyword/sentence/crossCheck).
   */
  const canGoNext =
    currentStep === 1
      ? (userId !== null || (profileValid === true))
      : isStepCompleted(currentStep);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  return (
    <>
      <div className="h-full min-h-0 w-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
        {/* Sidebar — Mobile: ngang, Desktop: dọc (đồng bộ indigo/emerald với Bước 1–5) */}
        <aside className="w-full md:w-72 lg:w-80 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shrink-0">
          {/* Mobile: thanh bước ngang (chỉ hiển thị, không nhấn được — chuyển bước bằng nút Tiếp theo) */}
          <div className="flex md:hidden">
            <nav className="flex items-center gap-1 px-3 py-3 overflow-x-auto hide-scrollbar w-full" aria-label="Tiến độ các bước">
              {steps.map((step) => {
                const completed = isStepCompleted(step.id);
                const active = currentStep === step.id;
                return (
                  <div
                    key={step.id}
                    role="presentation"
                    aria-label={completed ? `Bước ${step.id}: ${step.title} (đã hoàn thành)` : active ? `Bước ${step.id}: ${step.title} (đang thực hiện)` : `Bước ${step.id}: ${step.title}`}
                    className={`flex flex-col items-center justify-center min-w-[52px] py-2 px-2 rounded-md transition-colors pointer-events-none select-none ${
                      active
                        ? "bg-indigo-50 border-2 border-indigo-500 text-indigo-700"
                        : completed
                        ? "bg-emerald-50 border-2 border-emerald-200 text-emerald-700"
                        : "bg-gray-50 border-2 border-transparent text-gray-500"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        completed ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-gray-300 text-white"
                      }`}
                    >
                      {completed ? <CheckCircle2 size={14} /> : step.id}
                    </span>
                    <span className="text-[10px] font-medium mt-1 truncate max-w-[52px]">{step.title.split(" ")[0]}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Desktop: danh sách bước dọc (chỉ hiển thị, không nhấn được — chuyển bước bằng nút Tiếp theo) */}
          <nav className="hidden md:flex flex-col flex-1 px-4 py-5 space-y-2" aria-label="Tiến độ các bước">
            {steps.map((step) => {
              const completed = isStepCompleted(step.id);
              const active = currentStep === step.id;
              return (
                <div
                  key={step.id}
                  role="presentation"
                  aria-label={completed ? `Bước ${step.id}: ${step.title} (đã hoàn thành)` : active ? `Bước ${step.id}: ${step.title} (đang thực hiện)` : `Bước ${step.id}: ${step.title}`}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors w-full pointer-events-none select-none ${
                    active
                      ? "bg-indigo-50 border-2 border-indigo-500"
                      : completed
                      ? "bg-emerald-50 border-2 border-emerald-200"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      completed ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-gray-300 text-white"
                    }`}
                  >
                    {completed ? <CheckCircle2 size={18} /> : step.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${active ? "text-indigo-800" : completed ? "text-emerald-800" : "text-gray-700"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User info — desktop only (hiển thị khi có userId, kể cả resume bằng SĐT) */}
          {userId != null && (
            <div className="mt-auto p-4 border-t border-gray-100 hidden md:block">
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Người dùng</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {(userInfo as { name?: string; fullName?: string } | null)?.name
                  ?? (userInfo as { fullName?: string } | null)?.fullName
                  ?? `User ${userId}`}
              </p>
              <p className="text-xs text-gray-500">ID: {userId}</p>
            </div>
          )}
        </aside>

        {/* Main: nội dung cuộn + footer luôn dính dưới màn hình (không cần lăn chuột) */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="w-full px-4 md:px-6 py-4 md:py-6 pb-6">
              <p className="text-xs text-gray-500 mb-2 px-0.5">
                Bước {currentStep} — {currentStepInfo.title}
              </p>
              {children}
            </div>
          </div>

          {/* Footer: luôn hiển thị dưới màn hình (flex-shrink-0 trong main) */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200">
            <div className="max-w-5xl mx-auto w-full flex flex-row justify-between items-center gap-3 p-4">
              <button
                type="button"
                onClick={onBack}
                disabled={currentStep === 1}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    currentStep === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                <ChevronLeft size={18} />
                Quay lại
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    !canGoNext
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                  }`}
                >
                  Tiếp theo
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onFinish?.();
                    } finally {
                      setShowCompletionModal(true);
                    }
                  }}
                  disabled={!crossCheckCompleted}
                  className={
                    crossCheckCompleted
                      ? "inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                      : "inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-500 rounded-md text-sm font-semibold cursor-not-allowed transition-colors shadow-sm"
                  }
                >
                  <CheckCircle2 size={18} />
                  Nộp và Hoàn tất
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal hoàn thành (đồng bộ emerald/indigo) */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto overscroll-behavior-contain">
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl max-w-md w-full p-6 text-center my-auto" role="status" aria-live="polite" aria-atomic="true">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" aria-hidden />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Chúc mừng bạn đã hoàn thành
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Cảm ơn bạn đã tham gia thu thập dữ liệu giọng nói KWS Collection. Chúng tôi đã ghi nhận thông tin. Vui lòng chờ admin xác nhận và chuyển tiền theo phương thức bạn đã đăng ký.
            </p>
            <Link
              href="/info"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Home size={18} />
              Quay lại trang giới thiệu
            </Link>
          </div>
        </div>
      )}
    </>
  );
}