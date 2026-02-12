"use client";

import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import { trackCtaClick } from "@/lib/tracking";

const USER_PATH = "/user";
const UTM = "utm_source=homepage&utm_medium=cta&utm_campaign=collection";

export function HomeCTA({
  variant = "primary",
  source = "intro",
  className = "",
  children,
}: {
  variant?: "primary" | "secondary";
  source?: "hero" | "intro";
  className?: string;
  children?: React.ReactNode;
}) {
  const href = `${USER_PATH}?${UTM}`;

  if (variant === "secondary") {
    return (
      <Link
        href="#faq"
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-700 font-medium text-sm hover:bg-indigo-50 transition-colors ${className}`}
      >
        {children ?? "Tìm hiểu thêm"}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={() => trackCtaClick(source)}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-base shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ${className}`}
    >
      <Mic className="w-5 h-5" aria-hidden />
      {children ?? "Bắt đầu thu âm — Nhận thù lao"}
      <ArrowRight className="w-4 h-4" aria-hidden />
    </Link>
  );
}
