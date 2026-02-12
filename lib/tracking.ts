/**
 * Tracking events cho funnel: trang chủ → CTA → đăng ký.
 * Gắn vào Google Analytics / Vercel Analytics / custom backend bằng cách lắng nghe custom event.
 */
export const TRACK_EVENTS = {
  HOME_CTA_CLICK: "click_cta_tham_gia",
  HOME_VIEW: "home_view",
  SCROLL_50: "scroll_50",
  SCROLL_90: "scroll_90",
  /** Funnel: hoàn thành bước 1 (đăng ký profile) trên /user */
  USER_STEP1_COMPLETE: "user_step1_complete",
  /** Micro-commitment: user tick checkbox đồng ý trên trang chủ */
  CONSENT_CHECKBOX_CHECKED: "consent_checkbox_checked",
} as const;

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("track", { detail: { event: eventName, ...params } })
    );
    if (process.env.NODE_ENV === "development") {
      console.debug("[track]", eventName, params);
    }
  } catch {
    // ignore
  }
}

export function trackCtaClick(source: "hero" | "intro" = "intro"): void {
  trackEvent(TRACK_EVENTS.HOME_CTA_CLICK, { source });
}
