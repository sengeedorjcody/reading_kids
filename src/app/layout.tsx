import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { DevInspector } from "@/components/DevInspector";

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
  description: "A fun and interactive Japanese reading website for kids.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${notoSerifJP.variable}`}>
      <body className="bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">
        <DevInspector>
        {/* Main content — leave room for bottom nav */}
        <main className="min-h-screen pb-24">{children}</main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-pink-100 shadow-2xl shadow-pink-100/50">
          <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
            <BottomNavLink href="/" icon="🏠" label="ホーム" />
            <BottomNavLink href="/books" icon="📖" label="Books" />
            <BottomNavLink href="/conversations" icon="💬" label="会話" />
            <BottomNavLink href="/alphabet" icon="あ" label="Alphabet" />
            <BottomNavLink href="/dictionary" icon="📝" label="Dictionary" />
            <BottomNavLink href="/admin" icon="⚙️" label="Admin" isAdmin />
          </div>
        </nav>
        </DevInspector>
      </body>
    </html>
  );
}

function BottomNavLink({ href, icon, label, isAdmin }: { href: string; icon: string; label: string; isAdmin?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all active:scale-95 ${
        isAdmin
          ? "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
      }`}
    >
      <span className="text-3xl leading-none">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}
