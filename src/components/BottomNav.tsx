"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";

const HIDDEN_PATTERNS = [/^\/draw/, /^\/books\/[^/]+\/read\//, /^\/conversations\/[^/]+\/read\//, /^\/picture-books\/[^/]+\/read\//, /^\/games\/.+/, /^\/animal-match/, /^\/left-right/, /^\/memory-hands/, /^\/minemind-connect/, /^\/numberblocks/, /^\/youtube\/[^/]+/];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PATTERNS.some((re) => re.test(pathname))) return null;

  const activeCategoryId = pathname === "/"
    ? null
    : CATEGORIES.find((c) =>
        pathname === `/category/${c.id}` ||
        c.hrefs.some((h) => pathname === h || pathname.startsWith(h + "/"))
      )?.id ?? null;
  const isHomeActive = pathname === "/";

  return (
    <>
      {/* Spacer so page content isn't hidden behind the fixed nav */}
      <div className="h-24" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-pink-100 shadow-2xl shadow-pink-100/50">
        <div className="flex items-stretch justify-around px-2 pt-2 pb-3">
          <NavTab href="/" icon="🏠" label="Home" active={isHomeActive} />
          {CATEGORIES.map((c) => (
            <NavTab key={c.id} href={`/category/${c.id}`} icon={c.icon} label={c.label} active={activeCategoryId === c.id} />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavTab({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all active:scale-95 ${
        active ? "text-pink-600" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
}
