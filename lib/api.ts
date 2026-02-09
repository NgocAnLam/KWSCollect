/**
 * API base URL và helper gọi API (Collect App).
 * Dùng chung cho user, admin để tránh lặp và dễ đổi env.
 */
const BASE =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SERVER_URL || "" : "";

export function getApiBase(): string {
  return BASE;
}

export type ApiFetchOptions = RequestInit & { body?: object };

/**
 * Gọi fetch tới API backend (JSON). Trả về response đã parse hoặc null nếu lỗi.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T | null> {
  const { body, ...init } = options;
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };
  const res = await fetch(url, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).catch(() => null);
  if (!res?.ok) return null;
  return res.json() as Promise<T>;
}

/**
 * Gọi fetch PUT/POST với body JSON, không cần parse response (fire-and-forget).
 */
export async function apiMutate(
  path: string,
  method: "PUT" | "POST" | "PATCH" = "POST",
  body?: object
): Promise<void> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).catch(() => {});
}
