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
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900">
        <div className="max-w-5xl mx-auto p-4">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">KWS Collection</h1>
            <nav className="space-x-4">
              <a href="/user" className="text-sm text-slate-600">User</a>
              <a href="/admin" className="text-sm text-slate-600">Admin</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
