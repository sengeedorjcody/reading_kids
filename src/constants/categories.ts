export interface Category {
  id: string;
  label: string;
  icon: string;
  bg: string;
  hrefs: string[];
}

// Groups the section catalog into the 4 tabs shown in the bottom nav
// (alongside a fixed Home tab). Each category page renders its hrefs as a
// home-style icon grid.
export const CATEGORIES: Category[] = [
  {
    id: "learn",
    label: "Learn",
    icon: "📝",
    bg: "from-orange-500 to-pink-500",
    hrefs: ["/exam", "/flashcards", "/alphabet", "/writing", "/dictionary", "/words", "/words-english"],
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    icon: "🗂️",
    bg: "from-purple-500 to-indigo-500",
    hrefs: [
      "/animals", "/body", "/home", "/colors", "/directions", "/family", "/clock", "/math",
      "/themes", "/food", "/badminton", "/swimming", "/volleyball", "/english",
    ],
  },
  {
    id: "play",
    label: "Play",
    icon: "🎮",
    bg: "from-green-500 to-teal-500",
    hrefs: ["/games", "/game", "/draw"],
  },
  {
    id: "read",
    label: "Read",
    icon: "📖",
    bg: "from-blue-500 to-cyan-500",
    hrefs: ["/books", "/picture-books", "/conversations", "/youtube", "/english-tutor"],
  },
];

export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));
