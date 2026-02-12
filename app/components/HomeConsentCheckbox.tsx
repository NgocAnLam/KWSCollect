"use client";

import { useState, useCallback } from "react";
import { trackEvent, TRACK_EVENTS } from "@/lib/tracking";

/**
 * Checkbox đồng ý optional (micro-commitment) — không chặn CTA, chỉ track khi user tick.
 */
export function HomeConsentCheckbox() {
  const [checked, setChecked] = useState(false);
  const [tracked, setTracked] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;
      setChecked(value);
      if (value && !tracked) {
        setTracked(true);
        trackEvent(TRACK_EVENTS.CONSENT_CHECKBOX_CHECKED);
      }
    },
    [tracked]
  );

  return (
    <label className="inline-flex items-start gap-3 cursor-pointer text-left group">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        aria-describedby="consent-desc"
      />
      <span id="consent-desc" className="text-xs text-gray-600 group-hover:text-gray-800">
        Tôi đã đọc và đồng ý với{" "}
        <a href="#privacy" className="text-indigo-600 hover:underline">
          Chính sách bảo mật
        </a>{" "}
        và{" "}
        <a href="#terms" className="text-indigo-600 hover:underline">
          Điều khoản tham gia
        </a>
        . (Tùy chọn)
      </span>
    </label>
  );
}
