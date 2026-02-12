"use client";

import { useEffect, useRef } from "react";
import { trackEvent, TRACK_EVENTS } from "@/lib/tracking";

export function HomeTracking() {
  const scroll50 = useRef(false);
  const scroll90 = useRef(false);

  useEffect(() => {
    trackEvent(TRACK_EVENTS.HOME_VIEW);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = (scrollTop / docHeight) * 100;
      if (!scroll50.current && pct >= 50) {
        scroll50.current = true;
        trackEvent(TRACK_EVENTS.SCROLL_50);
      }
      if (!scroll90.current && pct >= 90) {
        scroll90.current = true;
        trackEvent(TRACK_EVENTS.SCROLL_90);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
