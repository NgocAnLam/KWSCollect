"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Member = {
  name: string;
  role: string;
  description: string;
  image: string;
};

export function LazyTeamSection({ teamMembers }: { teamMembers: Member[] }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { rootMargin: "100px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="mb-12 md:mb-20 min-h-[320px] md:min-h-[400px]"
      aria-label="Thành viên dự án"
    >
      {inView ? (
        <>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 md:mb-12">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Thành viên
            </span>
          </h2>
          {/* Mobile: dọc, mỗi thành viên 1 hàng — ảnh tròn trái, name/role/description phải */}
          <ul className="sm:hidden space-y-4">
            {teamMembers.map((member, index) => (
              <li
                key={index}
                className="flex gap-4 items-start bg-white rounded-xl shadow-md p-4"
              >
                <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-indigo-100">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {member.name}
                  </h3>
                  <div className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                    {member.role}
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed mt-0.5">
                    {member.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {/* Tablet+ (sm trở lên): grid card như cũ — ảnh lớn trên, chữ dưới */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden hover:shadow-xl md:hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-64 md:h-80 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4 md:p-6 text-center">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                    {member.name}
                  </h3>
                  <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs md:text-sm font-medium mb-2 md:mb-3">
                    {member.role}
                  </div>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          <span aria-hidden>Đang tải…</span>
        </div>
      )}
    </section>
  );
}
