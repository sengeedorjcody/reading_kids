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
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 w-full
          bg-white border-t-2 border-pink-100 shadow-2xl shadow-pink-100/50
          md:bottom-5 md:left-1/2 md:right-auto md:w-auto md:-translate-x-1/2
          md:rounded-full md:border-2 md:shadow-2xl md:shadow-black/20"
      >
        <div className="flex items-stretch justify-around px-2 pt-2 pb-3 md:items-center md:justify-center md:gap-2 md:px-3 md:py-2">
          <NavTab href="/" icon="🏠" label="Home" active={isHomeActive} isHome />
          {CATEGORIES.map((c) => (
            <NavTab key={c.id} href={`/category/${c.id}`} icon={c.icon} label={c.label} active={activeCategoryId === c.id} />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavTab({ href, icon, label, active, isHome }: { href: string; icon: string; label: string; active: boolean; isHome?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex-1 md:flex-initial flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all active:scale-95 ${
        isHome ? "md:px-2" : "md:px-4 md:py-2.5"
      } ${
        active
          ? isHome ? "text-pink-600" : "text-pink-600 md:bg-pink-50"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {isHome ? (
        <span
          className={`text-2xl leading-none flex items-center justify-center md:w-14 md:h-14 md:rounded-full md:-mt-7 md:text-3xl md:shadow-lg md:shadow-pink-400/40 md:transition-all ${
            active
              ? "md:bg-gradient-to-br md:from-pink-500 md:to-rose-500"
              : "md:bg-gradient-to-br md:from-gray-300 md:to-gray-400"
          }`}
        >
          {icon}
        </span>
      ) : (
        <span className="text-2xl leading-none">{icon}</span>
      )}
      <span className="text-[11px] font-bold">{label}</span>
    </Link>
  );
}
