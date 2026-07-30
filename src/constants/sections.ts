export interface SectionMeta {
  href: string;
  icon?: string;
  iconSrc?: string;
  label: string;
  color: string;
  bg: string;
}

// Canonical catalog of all hideable app sections — shared by the home
// screen grid, BottomNav, and the admin "Sections" manager so the three
// never drift out of sync with each other.
export const SECTION_CATALOG: SectionMeta[] = [
  // Row 1 — core learning
  { href: "/exam",       icon: "📝", label: "Exam",        color: "#f97316", bg: "from-orange-500 to-rose-500" },
  { href: "/flashcards", icon: "🃏", label: "Flashcards",  color: "#ec4899", bg: "from-pink-400 to-rose-500" },
  { href: "/alphabet",   icon: "あ", label: "Alphabet",    color: "#f97316", bg: "from-orange-400 to-amber-500" },
  { href: "/writing",    icon: "✍️", label: "Writing",     color: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { href: "/games",      icon: "🎮", label: "Games",       color: "#14b8a6", bg: "from-teal-400 to-green-500" },
  { href: "/game",       icon: "🔍", label: "Find Letter", color: "#22c55e", bg: "from-green-400 to-emerald-500" },
  // Row 2 — vocabulary
  { href: "/animals",    icon: "🐾", label: "Animals",     color: "#f59e0b", bg: "from-amber-400 to-yellow-500" },
  { href: "/body",       icon: "🧑", label: "Body",        color: "#06b6d4", bg: "from-cyan-400 to-sky-500" },
  { href: "/home",       icon: "🏠", label: "Home",        color: "#10b981", bg: "from-emerald-400 to-teal-500" },
  { href: "/colors",     icon: "🎨", label: "Colors",      color: "#a855f7", bg: "from-purple-400 to-fuchsia-500" },
  // Row 3 — topics
  { href: "/directions", icon: "🧭", label: "Directions",  color: "#3b82f6", bg: "from-blue-400 to-indigo-500" },
  { href: "/youtube", iconSrc: "/youtube-icon.svg", label: "YouTube", color: "#ef4444", bg: "from-red-500 to-rose-600" },
  { href: "/family",     icon: "👨‍👩‍👧", label: "Family",    color: "#f43f5e", bg: "from-rose-400 to-pink-500" },
  { href: "/clock",      icon: "🕐", label: "Clock",       color: "#6366f1", bg: "from-indigo-400 to-violet-500" },
  { href: "/math",       icon: "🧮", label: "Math",        color: "#14b8a6", bg: "from-teal-400 to-cyan-500" },
  // Row 4 — themes & library
  { href: "/themes",     icon: "🗂️", label: "Themes",      color: "#f97316", bg: "from-orange-400 to-red-400" },
  { href: "/books",      icon: "📖", label: "Books",       color: "#0ea5e9", bg: "from-sky-400 to-blue-500" },
  { href: "/picture-books", icon: "🖼️", label: "Picture Books", color: "#f59e0b", bg: "from-amber-400 to-orange-500" },
  { href: "/conversations",icon:"💬", label: "Conversations", color: "#8b5cf6", bg: "from-violet-400 to-purple-500" },
  { href: "/dictionary", icon: "📝", label: "Dictionary",  color: "#ec4899", bg: "from-pink-400 to-fuchsia-500" },
  // Row 5 — creative
  { href: "/words",      icon: "🔤", label: "Words",       color: "#f59e0b", bg: "from-yellow-400 to-orange-500" },
  { href: "/draw",       icon: "🎨", label: "Draw",        color: "#a855f7", bg: "from-fuchsia-400 to-purple-600" },
  // Row 6 — sports & food
  { href: "/food",       icon: "🍽️", label: "Food",        color: "#f97316", bg: "from-orange-400 to-yellow-400" },
  { href: "/badminton",  icon: "🏸", label: "Badminton",   color: "#3b82f6", bg: "from-blue-400 to-cyan-500" },
  { href: "/swimming",   icon: "🏊", label: "Swimming",    color: "#06b6d4", bg: "from-cyan-400 to-blue-500" },
  { href: "/volleyball",    icon: "🏐", label: "Volleyball",  color: "#f59e0b", bg: "from-yellow-400 to-orange-400" },
  // Row 7 — English
  { href: "/english",       icon: "🇬🇧", label: "English",    color: "#6366f1", bg: "from-indigo-400 to-blue-500" },
  { href: "/english-tutor", icon: "🎙️", label: "AI Tutor",   color: "#6366f1", bg: "from-indigo-500 to-violet-600" },
  { href: "/words-english", icon: "⌨️",  label: "Words EN",   color: "#8b5cf6", bg: "from-violet-400 to-indigo-500" },
];

export const SECTION_CATALOG_BY_HREF = new Map(SECTION_CATALOG.map((s) => [s.href, s]));
