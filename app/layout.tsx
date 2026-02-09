import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Mic } from "lucide-react";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'KWS Collection',
  description: 'Collect audio samples',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen flex flex-col antialiased`}
      >
        <a href="#main-content" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:w-auto focus:h-auto focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-md focus:overflow-visible focus:clip-auto">
          Chuyển tới nội dung chính
        </a>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200/80 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                  <Mic className="w-6 h-6 text-white" aria-hidden />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    KWS Collection
                  </h1>
                  <p className="hidden sm:block text-xs text-slate-500">Audio Sample Collection</p>
                </div>
              </Link>

              {/* Navigation */}
              <Navigation />
            </div>
          </div>
        </header>

        {/* Main Content — không overflow-hidden để trang info/admin kéo được */}
        <main id="main-content" className="flex-1 w-full min-h-0" tabIndex={-1}>
          <div className="w-full min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
