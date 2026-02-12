"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import UserInfoForm from "./profile/profile";
import KeywordRecorder from "./keyword/keyword";
import SentenceRecorder from "./sentence/sentence";
import CrossCheckList from "./cross_check_list/CrossCheckList";
import MicTest from "./test_mic/test_mic";
import WizardLayout from "./components/WizardLayout";
import {
  startSession,
  upsertProgress,
  completeSession,
  getCurrentSession,
  getCurrentSessionByPhone,
  cancelSession,
} from "./lib/sessionApi";
import {
  type Step,
  STORAGE_USER_ID,
  STORAGE_SESSION_ID,
  STEPS_PROGRESS,
  STEP_TITLES,
  computeResumeStep,
} from "./constants";

function UserPageContent() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [userId, setUserId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<unknown>(null);
  const [micTestPassed, setMicTestPassed] = useState(false);
  const [keywordRecordingCompleted, setKeywordRecordingCompleted] = useState(false);
  const [sentenceRecordingCompleted, setSentenceRecordingCompleted] = useState(false);
  const [crossCheckCompleted, setCrossCheckCompleted] = useState(false);
  const [profileValid, setProfileValid] = useState(false);
  const [resumeOffer, setResumeOffer] = useState<{ fromStep: Step; sessionId: number } | null>(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [showPhoneResumeModal, setShowPhoneResumeModal] = useState(false);
  const [phoneResumeInput, setPhoneResumeInput] = useState("");
  const [phoneResumeError, setPhoneResumeError] = useState<string | null>(null);
  const [phoneResumeLoading, setPhoneResumeLoading] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set());
  const profileSubmitRef = React.useRef<(() => Promise<void>) | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setVisitedSteps((prev) => new Set(prev).add(currentStep));
  }, [currentStep]);

  // Mở modal "Tiếp tục phiên trên thiết bị khác" khi vào /user?resume=phone (từ header)
  useEffect(() => {
    if (searchParams?.get("resume") === "phone") {
      setShowPhoneResumeModal(true);
      router.replace("/user", { scroll: false });
    }
  }, [searchParams, router]);

  // Resume: khi có collect_user_id trong localStorage, gọi GET session/current và hiển thị "Tiếp tục từ Bước X"
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_USER_ID) : null;
    if (!stored) {
      setResumeLoading(false);
      return;
    }
    const uid = parseInt(stored, 10);
    if (isNaN(uid)) {
      setResumeLoading(false);
      return;
    }
    getCurrentSession(uid)
      .then((data) => {
        if (!data || data.status === "completed") {
          setResumeLoading(false);
          return;
        }
        const fromStep = computeResumeStep(data.steps);
        setUserId(uid);
        setSessionId(data.session_id);
        setResumeOffer({ fromStep, sessionId: data.session_id });
      })
      .catch(() => {})
      .finally(() => setResumeLoading(false));
  }, []);

  const goNext = async () => {
    if (currentStep === 1 && !userId) {
      if (profileSubmitRef.current) {
        try {
          await profileSubmitRef.current();
        } catch {
          return;
        }
      } else if (!profileValid) {
        return;
      }
    }
    if (currentStep < 5) {
      const nextStep = (currentStep + 1) as Step;
      if (userId && sessionId) {
        if (currentStep === 1) {
          await startSession(userId, sessionId);
          upsertProgress(userId, sessionId, "profile", 100);
        } else {
          upsertProgress(userId, sessionId, STEPS_PROGRESS[currentStep], 100);
        }
      }
      if (currentStep === 2) setKeywordRecordingCompleted(false);
      if (currentStep === 3) setSentenceRecordingCompleted(false);
      if (currentStep === 4) setCrossCheckCompleted(false);
      setCurrentStep(nextStep);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      if (currentStep === 4) setKeywordRecordingCompleted(false);
      if (currentStep === 5) setCrossCheckCompleted(false);
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const renderContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <UserInfoForm
            onCreated={(u: { id: number; session_id?: number }) => {
              setUserId(u.id);
              setUserInfo(u);
              if (u.session_id != null) setSessionId(u.session_id);
              if (u.session_id != null) upsertProgress(u.id, u.session_id, "profile", 100);
              if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_USER_ID, String(u.id));
                if (u.session_id != null) localStorage.setItem(STORAGE_SESSION_ID, String(u.session_id));
              }
            }}
            onValidityChange={setProfileValid}
            onRegisterSubmit={(fn) => (profileSubmitRef.current = fn)}
          />
          <p className="text-center text-sm text-gray-600">
            Đã có tài khoản và muốn tiếp tục hoàn thành các phần còn lại?{" "}
            <button
              type="button"
              onClick={() => setShowPhoneResumeModal(true)}
              className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded"
            >
              Bấm vào đây
            </button>
          </p>
        </div>
      );
    }
    if (userId == null) return null;
    const show = (step: number) => currentStep === step;
    const keepMounted = (step: number) => visitedSteps.has(step);
    return (
      <>
        <div className={show(2) ? "block" : "hidden"} aria-hidden={!show(2)}>
          <MicTest onPassed={() => setMicTestPassed(true)} />
        </div>
        {keepMounted(3) && (
          <div className={show(3) ? "block" : "hidden"} aria-hidden={!show(3)}>
            <KeywordRecorder
              userId={userId}
              sessionId={sessionId}
              onComplete={() => setKeywordRecordingCompleted(true)}
            />
          </div>
        )}
        {keepMounted(4) && (
          <div className={show(4) ? "block" : "hidden"} aria-hidden={!show(4)}>
            <SentenceRecorder
              userId={userId}
              sessionId={sessionId}
              onComplete={() => setSentenceRecordingCompleted(true)}
            />
          </div>
        )}
        {keepMounted(5) && (
          <div className={show(5) ? "block" : "hidden"} aria-hidden={!show(5)}>
            <CrossCheckList
              userId={userId}
              sessionId={sessionId}
              onComplete={() => setCrossCheckCompleted(true)}
            />
          </div>
        )}
      </>
    );
  };

  const handleFinish = async () => {
    if (userId && sessionId) {
      await upsertProgress(userId, sessionId, "cross_check", 100);
      await completeSession(userId, sessionId);
    }
  };

  const handleResume = () => {
    if (!resumeOffer) return;
    if (userId && sessionId) startSession(userId, sessionId);
    if (resumeOffer.fromStep >= 2) setMicTestPassed(true);
    if (resumeOffer.fromStep >= 3) setKeywordRecordingCompleted(true);
    setVisitedSteps((prev) => {
      const next = new Set(prev);
      for (let s = 2; s <= resumeOffer!.fromStep; s++) next.add(s);
      return next;
    });
    setCurrentStep(resumeOffer.fromStep);
    setResumeOffer(null);
  };

  const handleStartNew = async () => {
    if (userId && resumeOffer) await cancelSession(userId, resumeOffer.sessionId);
    setResumeOffer(null);
    setCurrentStep(1);
    setSessionId(null);
  };

  const handlePhoneResumeCheck = async () => {
    const phone = phoneResumeInput.trim().replace(/\D/g, "");
    if (phone.length < 9) {
      setPhoneResumeError("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }
    setPhoneResumeError(null);
    setPhoneResumeLoading(true);
    try {
      const data = await getCurrentSessionByPhone(phoneResumeInput.trim());
      if (!data || data.status === "completed") {
        setPhoneResumeError("Không có phiên thu thập nào đang chờ với SĐT này.");
        return;
      }
      const steps = data.steps ?? [];
      const fromStep = computeResumeStep(steps);
      setUserId(data.user_id);
      setSessionId(data.session_id);
      setUserInfo({ id: data.user_id, name: data.user_name ?? "" });
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_USER_ID, String(data.user_id));
          localStorage.setItem(STORAGE_SESSION_ID, String(data.session_id));
        }
      } catch {
        // Safari private / quota; vẫn tiếp tục phiên
      }
      setVisitedSteps((prev) => {
        const next = new Set(prev);
        for (let s = 2; s <= fromStep; s++) next.add(s);
        return next;
      });
      setResumeOffer({ fromStep, sessionId: data.session_id });
      setShowPhoneResumeModal(false);
      setPhoneResumeInput("");
    } catch {
      setPhoneResumeError("Không có phiên thu thập nào đang chờ hoặc SĐT không đúng.");
    } finally {
      setPhoneResumeLoading(false);
    }
  };

  if (resumeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
        <span>Đang tải…</span>
      </div>
    );
  }

  if (resumeOffer) {
    const stepTitle = STEP_TITLES[resumeOffer.fromStep];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto overscroll-behavior-contain">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 my-auto">
          <h2 className="text-lg font-semibold text-gray-900">Tiếp tục phiên thu thập</h2>
          <p className="text-sm text-gray-600">
            Bạn có phiên thu thập chưa hoàn thành. Tiếp tục từ <strong>Bước {resumeOffer.fromStep}: {stepTitle}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleStartNew}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Bắt đầu mới
            </button>
            <button
              type="button"
              onClick={handleResume}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPhoneResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto overscroll-behavior-contain">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 my-auto">
            <h2 className="text-lg font-semibold text-gray-900">Tiếp tục phiên trên thiết bị khác</h2>
            <p className="text-sm text-gray-600">
              Nhập số điện thoại đã dùng khi đăng ký để tìm phiên thu thập chưa hoàn thành.
            </p>
            <label htmlFor="phone-resume-input" className="sr-only">Số điện thoại đăng ký</label>
            <input
              id="phone-resume-input"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phoneResumeInput}
              onChange={(e) => setPhoneResumeInput(e.target.value)}
              placeholder="Số điện thoại…"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
            />
            {phoneResumeError && (
              <p className="text-sm text-red-600">{phoneResumeError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowPhoneResumeModal(false);
                  setPhoneResumeError(null);
                  setPhoneResumeInput("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handlePhoneResumeCheck}
                disabled={phoneResumeLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {phoneResumeLoading ? "Đang kiểm tra…" : "Kiểm tra"}
              </button>
            </div>
          </div>
        </div>
      )}
      <WizardLayout
        currentStep={currentStep}
        userInfo={userInfo}
        userId={userId}
        micTestPassed={micTestPassed}
        keywordRecordingCompleted={keywordRecordingCompleted}
        sentenceRecordingCompleted={sentenceRecordingCompleted}
        crossCheckCompleted={crossCheckCompleted}
        profileValid={profileValid}
        onStepChange={setCurrentStep}
        onBack={goBack}
        onNext={goNext}
        onFinish={handleFinish}
      >
        {renderContent()}
      </WizardLayout>
    </>
  );
}

export default function UserPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[200px] text-gray-500">
          <span>Đang tải…</span>
        </div>
      }
    >
      <UserPageContent />
    </Suspense>
  );
}