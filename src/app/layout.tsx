import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { DevInspector } from "@/components/DevInspector";

export const metadata: Metadata = {
  title: "にほんご よもう！ - Learn Japanese Reading",
  description:
    "A fun and interactive Japanese reading website for kids. Learn hiragana, katakana, and more!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Noto+Serif+JP:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">
        <DevInspector>
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-pink-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="text-3xl">📚</span>
                <div>
                  <div className="text-xl font-black text-pink-600">にほんご</div>
                  <div className="text-xs text-gray-400 font-medium -mt-1">よもう！</div>
                </div>
              </Link>

              {/* Nav links */}
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  href="/books"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all font-bold text-sm md:text-base"
                >
                  <span>📖</span>
                  <span className="hidden sm:inline">Books</span>
                </Link>
                <Link
                  href="/alphabet"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-bold text-sm md:text-base"
                >
                  <span>あ</span>
                  <span className="hidden sm:inline">Alphabet</span>
                </Link>
                <Link
                  href="/dictionary"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all font-bold text-sm md:text-base"
                >
                  <span>📝</span>
                  <span className="hidden sm:inline">Dictionary</span>
                </Link>
                <Link
                  href="/flashcards"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all font-bold text-sm md:text-base"
                >
                  <span>🃏</span>
                  <span className="hidden sm:inline">Flashcards</span>
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all font-bold text-sm"
                >
                  ⚙️
                </Link>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </DevInspector>
      </body>
    </html>
  );
}
