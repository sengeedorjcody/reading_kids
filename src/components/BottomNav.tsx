"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_PATTERNS = [/^\/books\/[^/]+\/read\//, /^\/conversations\/[^/]+\/read\//];

export default function BottomNav() {
  const pathname = usePathname();
  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed nav */}
      <div className="h-24" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-pink-100 shadow-2xl shadow-pink-100/50">
        <div className="flex items-center gap-1 px-2 py-2 overflow-x-auto scrollbar-none">
          <BottomNavLink href="/flashcards" icon="🃏" label="Flashcards" />
          <BottomNavLink href="/books" icon="📖" label="Books" />
          <BottomNavLink href="/conversations" icon="💬" label="会話" />
          <BottomNavLink href="/alphabet" icon="あ" label="Alphabet" />
          <BottomNavLink href="/game" icon="🎮" label="Game" />
          <BottomNavLink href="/family" icon="👨‍👩‍👧" label="Family" />
          <BottomNavLink href="/animals" icon="🐾" label="Animals" />
          <BottomNavLink href="/body" icon="🧑" label="Body" />
          <BottomNavLink href="/home" icon="🏠" label="Home" />
          <BottomNavLink href="/colors" icon="🎨" label="Colors" />
          <BottomNavLink href="/directions" icon="🧭" label="Direction" />
          <BottomNavLink href="/clock" icon="🕐" label="Clock" />
          <BottomNavLink href="/themes" icon="🗂️" label="Themes" />
          <BottomNavLink href="/math" icon="🧮" label="Math" />
          <BottomNavLink href="/writing" icon="✍️" label="Writing" />
          <BottomNavLink href="/dictionary" icon="📝" label="Dictionary" />
          <BottomNavLink href="/admin" icon="⚙️" label="Admin" isAdmin />
        </div>
      </nav>
    </>
  );
}

function BottomNavLink({ href, icon, label, isAdmin }: { href: string; icon: string; label: string; isAdmin?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all active:scale-95 ${
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
