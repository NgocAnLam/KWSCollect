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
    (currentStep === 1 && userId) ||
    (currentStep === 2 && micTestPassed) ||
    (currentStep === 3 && keywordRecordingCompleted) ||
    currentStep >= 4;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-80 w-full bg-white shadow-lg md:h-screen fixed md:static z-10 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800">Thu thập dữ liệu giọng nói</h1>
        </div>

        <nav className="space-y-3 flex-1 px-6 pb-6 overflow-y-auto">
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

        {userInfo && (
          <div className="mt-auto p-6 pt-4 border-t border-gray-200 hidden md:block">
            <p className="text-sm text-gray-600 mb-2">Người tham gia:</p>
            <p className="font-semibold text-gray-800">
              {userInfo.name || userInfo.fullName} (ID: {userId})
            </p>
            {userInfo.age && <p className="text-sm text-gray-600">Tuổi: {userInfo.age}</p>}
            {userInfo.gender && (
              <p className="text-sm text-gray-600">
                Giới tính: {userInfo.gender === "male" ? "Nam" : "Nữ"}
              </p>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 pt-20 md:pt-0 p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Bước {currentStep}: {currentStepInfo.title}
            </h2>
            <p className="text-base md:text-lg text-gray-600">{currentStepInfo.description}</p>
          </div>

          {currentStep === 3 && !keywordRecordingCompleted && (
            <div className="mb-8 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-amber-800 font-medium">
                ⚠️ Bạn phải hoàn thành <strong>tất cả 50 bản ghi</strong> (10 từ khóa × 5 lần) 
                và mọi bản ghi đều được <strong>chấp nhận</strong> thì mới có thể sang bước tiếp theo.
              </p>
            </div>
          )}

          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-3 gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-3 rounded-full ${
                    index < currentStep - 1
                      ? "bg-green-500"
                      : index === currentStep - 1
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 text-right">
              Bước {currentStep} / {steps.length}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 min-h-96">
            {children}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
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
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all w-full sm:w-auto ${
                  !canGoNext
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Tiếp theo
                <ChevronRight size={20} />
              </button>
            ) : (
              <button className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg 
                                 font-semibold hover:bg-green-700 transition-all w-full sm:w-auto">
                <CheckCircle2 size={20} />
                Nộp và Hoàn tất
              </button>
            )}
          </div>

          {userInfo && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg md:hidden">
              <p className="text-sm font-medium text-gray-700">
                {userInfo.name || userInfo.fullName} (ID: {userId})
              </p>
              {userInfo.age && <p className="text-sm text-gray-600">Tuổi: {userInfo.age}</p>}
              {userInfo.gender && (
                <p className="text-sm text-gray-600">
                  Giới tính: {userInfo.gender === "male" ? "Nam" : "Nữ"}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}