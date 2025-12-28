import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    <html lang="vi">
      <body className={`bg-slate-50 text-slate-900 h-screen flex flex-col overflow-hidden ${geistSans.variable} ${geistMono.variable}`}>
        <header className="w-full h-[10vh] flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <h1 className="text-xl font-semibold">KWS Collection</h1>
          <nav className="space-x-6">
            <a href="/user" className="text-sm text-slate-600 hover:text-slate-900">User</a>
            <a href="/admin" className="text-sm text-slate-600 hover:text-slate-900">Admin</a>
            <a href="/info" className="text-sm text-slate-600 hover:text-slate-900">Info</a>
          </nav>
        </header>

        <main className="flex-1 w-full min-h-0 bg-slate-50 overflow-auto">
          <div className="h-[80vh] w-full px-6 py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}