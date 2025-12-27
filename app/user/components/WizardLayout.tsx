// app/user/components/WizardLayout.tsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

interface StepInfo {
  id: Step;
  title: string;
  description: string;
}

const steps: StepInfo[] = [
  { id: 1, title: "Thông tin cá nhân", description: "Khai báo thông tin người dùng" },
  { id: 2, title: "Kiểm tra micro", description: "Test micro và mức âm thanh" },
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
  profileValid?: boolean;
  onStepChange: (step: Step) => void;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
}

export default function WizardLayout({
  currentStep,
  userInfo,
  userId,
  micTestPassed,
  keywordRecordingCompleted,
  onStepChange,
  onBack,
  onNext,
  children,
  profileValid,
}: WizardLayoutProps) {
  const isStepCompleted = (step: Step): boolean => {
    if (step === 1) return userId !== null;
    if (step === 2) return micTestPassed;
    if (step === 3) return keywordRecordingCompleted;
    if (step < currentStep) return true;
    return false;
  };

  const currentStepInfo = steps.find((s) => s.id === currentStep)!;

  const canGoNext =
    (currentStep === 1 && (userId || profileValid)) ||
    (currentStep === 2 && micTestPassed) ||
    (currentStep === 3 && keywordRecordingCompleted) ||
    currentStep >= 4;

  return (
    <div className="h-[80vh] w-full flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Sidebar - Mobile: trên top, Desktop: fixed trái full height */}
      <aside className="w-full md:w-80 bg-white shadow-lg flex flex-col h-auto md:h-full overflow-y-auto">
        <nav className="space-y-3 flex-1 px-6 py-6">
          {steps.map((step) => {
            const completed = isStepCompleted(step.id);
            const active = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all cursor-pointer ${
                  active
                    ? "bg-blue-50 border-2 border-blue-500"
                    : completed
                    ? "bg-green-50 border-2 border-green-500"
                    : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                }`}
                onClick={() => {
                  if (step.id === 1 || (step.id <= currentStep && (step.id === 2 ? micTestPassed : true))) {
                    onStepChange(step.id);
                  }
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${
                    completed ? "bg-green-500" : active ? "bg-blue-500" : "bg-gray-400"
                  }`}
                >
                  {completed ? <CheckCircle2 size={20} /> : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${active ? "text-blue-700" : "text-gray-800"}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{step.description}</p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User info - chỉ hiển thị desktop */}
        {userInfo && (
          <div className="mt-auto p-6 border-t hidden md:block">
            <p className="font-semibold text-gray-800">
              {userInfo.name || userInfo.fullName} (ID: {userId})
            </p>
          </div>
        )}
      </aside>

      {/* Main Content - chiếm hết phần còn lại, full height, scroll nội dung */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-0">
          <div className="max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Bước {currentStep}: {currentStepInfo.title}
              </h2>
            </div>

            {currentStep === 3 && !keywordRecordingCompleted && (
              <div className="mb-8 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                <p className="text-amber-800 font-medium">
                  ⚠️ Bạn phải hoàn thành <strong>tất cả 50 bản ghi</strong> (10 từ khóa × 5 lần) 
                  và mọi bản ghi đều được <strong>chấp nhận</strong> thì mới có thể sang bước tiếp theo.
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm h-auto max-h-[90vh] p-0 overflow-auto">
              {children}
            </div>
          </div>
        </div>

        {/* Footer buttons - fixed dưới cùng trên mobile nếu cần, nhưng ở đây giữ linh hoạt */}
        <div className="border-t bg-gray p-0">
          <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
            <button
              onClick={onBack}
              disabled={currentStep === 1}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all w-full sm:w-auto ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft size={20} />
              Quay lại
            </button>

            {currentStep < 5 ? (
              <button
                onClick={onNext}
                disabled={!canGoNext}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all w-full sm:w-auto order-first sm:order-last ${
                  !canGoNext
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Tiếp theo
                <ChevronRight size={20} />
              </button>
            ) : (
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all w-full sm:w-auto">
                <CheckCircle2 size={20} />
                Nộp và Hoàn tất
              </button>
            )}

            {/* User info mobile */}
            {userInfo && (
              <div className="md:hidden w-full sm:w-auto text-left sm:text-center">
                <p className="text-sm font-medium text-gray-700">
                  {userInfo.name || userInfo.fullName} (ID: {userId})
                </p>
                {userInfo.age && <p className="text-sm text-gray-600">Tuổi: {userInfo.age}</p>}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}