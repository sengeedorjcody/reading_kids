import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-jp",
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "にほんご よもう！ - Learn Japanese Reading",
  description:
    "A fun and interactive Japanese reading website for kids. Learn hiragana, katakana, and more!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${notoSerifJP.variable}`}>
      <body className="bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">
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
      </body>
    </html>
  );
}
