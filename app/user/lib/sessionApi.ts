import { getApiBase } from "@/lib/api";

const BASE = getApiBase();

export type CurrentSession = {
  session_id: number;
  status: string;
  steps: { step: string; progress: number }[];
};

export type CurrentSessionByPhone = CurrentSession & { user_id: number; user_name?: string };

export async function startSession(userId: number, sessionId: number): Promise<void> {
  await fetch(`${BASE}/user/session/start`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_id: sessionId }),
  }).catch(() => {});
}

export async function upsertProgress(
  userId: number,
  sessionId: number,
  step: string,
  progress: number
): Promise<void> {
  await fetch(`${BASE}/user/session/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_id: sessionId, step, progress }),
  }).catch(() => {});
}

export async function completeSession(userId: number, sessionId: number): Promise<void> {
  await fetch(`${BASE}/user/session/complete`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_id: sessionId }),
  }).catch(() => {});
}

export async function getCurrentSession(userId: number): Promise<CurrentSession | null> {
  const res = await fetch(`${BASE}/user/session/current?user_id=${userId}`).catch(() => null);
  if (!res?.ok) return null;
  return res.json();
}

export async function getCurrentSessionByPhone(phone: string): Promise<CurrentSessionByPhone | null> {
  const q = new URLSearchParams({ phone: phone.trim() });
  const res = await fetch(`${BASE}/user/session/current-by-phone?${q}`).catch(() => null);
  if (!res?.ok) return null;
  return res.json();
}

export async function cancelSession(userId: number, sessionId: number): Promise<void> {
  await fetch(`${BASE}/user/session/cancel`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, session_id: sessionId }),
  }).catch(() => {});
}
