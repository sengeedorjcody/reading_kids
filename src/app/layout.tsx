import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { DevInspector } from "@/components/DevInspector";
import BottomNav from "@/components/BottomNav";

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
        <main className="min-h-screen">{children}</main>

        <BottomNav />
        </DevInspector>
      </body>
    </html>
  );
}

