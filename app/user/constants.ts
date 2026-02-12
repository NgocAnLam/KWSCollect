/** Bước wizard thu thập (1–5). */
export type Step = 1 | 2 | 3 | 4 | 5;

export const STORAGE_USER_ID = "collect_user_id";
export const STORAGE_SESSION_ID = "collect_session_id";

export const STEPS_PROGRESS: Record<Step, string> = {
  1: "profile",
  2: "mic_test",
  3: "keyword",
  4: "sentence",
  5: "cross_check",
};

export const STEP_TITLES: Record<Step, string> = {
  1: "Thông tin cá nhân",
  2: "Kiểm tra Micro",
  3: "Thu thập keyword",
  4: "Thu thập câu dài",
  5: "Kiểm tra chéo",
};

/** Xác định bước cần resume: bước đầu tiên chưa đạt 100%. Profile = 100% nghĩa là đã đăng ký → resume từ bước 2. */
export function computeResumeStep(
  steps: { step: string; progress: number }[] | undefined
): Step {
  const list = steps ?? [];
  for (let n = 1; n <= 5; n++) {
    const stepName = STEPS_PROGRESS[n as Step];
    const found = list.find((s) => s.step === stepName);
    const progress = found != null ? Number(found.progress) : 0;
    if (progress < 100) return n as Step;
  }
  return 5;
}
