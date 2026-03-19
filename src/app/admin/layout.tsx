import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-black text-pink-400">⚙️ Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">にほんご よもう！</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin" icon="🏠" label="Dashboard" />
          <NavLink href="/admin/books" icon="📚" label="Books" />
          <NavLink href="/admin/books/upload" icon="📤" label="Upload Book" />
          <NavLink href="/admin/dictionary" icon="📝" label="Dictionary" />
          <NavLink href="/admin/dictionary/new" icon="➕" label="Add Word" />
          <div className="pt-4 mt-4 border-t border-gray-700">
            <NavLink href="/admin/characters" icon="🎭" label="Characters" />
            <NavLink href="/admin/characters/new" icon="🎭" label="New Character" />
          </div>
          <div className="pt-2">
            <NavLink href="/admin/conversations" icon="💬" label="Conversations" />
            <NavLink href="/admin/conversations/create" icon="💬" label="New Conversation" />
          </div>
          <div className="pt-4 mt-4 border-t border-gray-700">
            <NavLink href="/" icon="👁" label="View Site" />
          </div>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 p-3 bg-gray-900 overflow-x-auto">
          {[
            { href: "/admin", icon: "🏠", label: "Home" },
            { href: "/admin/books", icon: "📚", label: "Books" },
            { href: "/admin/books/upload", icon: "📤", label: "Upload" },
            { href: "/admin/dictionary", icon: "📝", label: "Dict" },
            { href: "/admin/characters", icon: "🎭", label: "Chars" },
            { href: "/admin/conversations", icon: "💬", label: "Convos" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 text-xs font-bold whitespace-nowrap">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-gray-700 transition-all font-medium">
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
