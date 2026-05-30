"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface FoodItem {
  emoji: string;
  japanese: string;
  romaji: string;
  english: string;
  mongolian: string;
  color: string;
}

type Category = "all" | "gohan" | "kudamono" | "yasai" | "nomimono" | "okashi";

const FOODS: Record<Exclude<Category, "all">, FoodItem[]> = {
  gohan: [
    { emoji: "🍚", japanese: "ごはん",     romaji: "gohan",    english: "Rice",         mongolian: "Цагаан будаа",  color: "#f8fafc" },
    { emoji: "🍜", japanese: "ラーメン",   romaji: "raamen",   english: "Ramen",        mongolian: "Рамэн шөл",     color: "#fef3c7" },
    { emoji: "🍣", japanese: "すし",       romaji: "sushi",    english: "Sushi",        mongolian: "Суши",          color: "#fce7f3" },
    { emoji: "🍙", japanese: "おにぎり",   romaji: "onigiri",  english: "Rice ball",    mongolian: "Гурилан бөмбөг",color: "#f0fdf4" },
    { emoji: "🍝", japanese: "スパゲティ", romaji: "supageti", english: "Spaghetti",    mongolian: "Спагетти",      color: "#fff7ed" },
    { emoji: "🍛", japanese: "カレー",     romaji: "karee",    english: "Curry",        mongolian: "Карри",         color: "#fef9c3" },
    { emoji: "🍱", japanese: "べんとう",   romaji: "bentou",   english: "Bento",        mongolian: "Бэнто хайрцаг", color: "#ecfdf5" },
    { emoji: "🥟", japanese: "ぎょうざ",   romaji: "gyouza",   english: "Gyoza",        mongolian: "Гёза",          color: "#fef2f2" },
    { emoji: "🍤", japanese: "てんぷら",   romaji: "tenpura",  english: "Tempura",      mongolian: "Тэмпура",       color: "#fef3c7" },
    { emoji: "🍞", japanese: "パン",       romaji: "pan",      english: "Bread",        mongolian: "Талх",          color: "#fff7ed" },
    { emoji: "🥚", japanese: "たまご",     romaji: "tamago",   english: "Egg",          mongolian: "Өндөг",         color: "#fefce8" },
    { emoji: "🍗", japanese: "とりにく",   romaji: "toriniku", english: "Chicken",      mongolian: "Тахианы мах",   color: "#fef3c7" },
  ],
  kudamono: [
    { emoji: "🍎", japanese: "りんご",     romaji: "ringo",    english: "Apple",        mongolian: "Алим",          color: "#fef2f2" },
    { emoji: "🍌", japanese: "バナナ",     romaji: "banana",   english: "Banana",       mongolian: "Гадил",         color: "#fefce8" },
    { emoji: "🍊", japanese: "みかん",     romaji: "mikan",    english: "Mandarin",     mongolian: "Мандарин",      color: "#fff7ed" },
    { emoji: "🍓", japanese: "いちご",     romaji: "ichigo",   english: "Strawberry",   mongolian: "Гүзээлзгэнэ",  color: "#fef2f2" },
    { emoji: "🍇", japanese: "ぶどう",     romaji: "budou",    english: "Grapes",       mongolian: "Усан үзэм",     color: "#f5f3ff" },
    { emoji: "🍉", japanese: "すいか",     romaji: "suika",    english: "Watermelon",   mongolian: "Тарвас",        color: "#fef2f2" },
    { emoji: "🍑", japanese: "もも",       romaji: "momo",     english: "Peach",        mongolian: "Тоор",          color: "#fff7ed" },
    { emoji: "🍍", japanese: "パイナップル",romaji: "painappuru",english: "Pineapple",  mongolian: "Ананас",        color: "#fefce8" },
    { emoji: "🥭", japanese: "マンゴー",   romaji: "mangoo",   english: "Mango",        mongolian: "Манго",         color: "#fef9c3" },
    { emoji: "🍋", japanese: "レモン",     romaji: "remon",    english: "Lemon",        mongolian: "Нимбэг",        color: "#fefce8" },
    { emoji: "🫐", japanese: "ブルーベリー",romaji: "buruuberii",english: "Blueberry",  mongolian: "Нэрс",          color: "#eff6ff" },
    { emoji: "🍒", japanese: "さくらんぼ", romaji: "sakuranbo",english: "Cherry",       mongolian: "Интоор",        color: "#fef2f2" },
  ],
  yasai: [
    { emoji: "🥕", japanese: "にんじん",   romaji: "ninjin",   english: "Carrot",       mongolian: "Лууван",        color: "#fff7ed" },
    { emoji: "🍅", japanese: "トマト",     romaji: "tomato",   english: "Tomato",       mongolian: "Улаан лооль",   color: "#fef2f2" },
    { emoji: "🌽", japanese: "とうもろこし",romaji: "toumorokoshi",english: "Corn",     mongolian: "Эрдэнэ шиш",    color: "#fefce8" },
    { emoji: "🥦", japanese: "ブロッコリー",romaji: "burokkori",english: "Broccoli",    mongolian: "Броккол",       color: "#f0fdf4" },
    { emoji: "🥔", japanese: "じゃがいも", romaji: "jagaimo",  english: "Potato",       mongolian: "Төмс",          color: "#fef9c3" },
    { emoji: "🧅", japanese: "たまねぎ",   romaji: "tamanegi", english: "Onion",        mongolian: "Сонгино",       color: "#fef3c7" },
    { emoji: "🥒", japanese: "きゅうり",   romaji: "kyuuri",   english: "Cucumber",     mongolian: "Өргөст хэмх",   color: "#f0fdf4" },
    { emoji: "🫑", japanese: "ピーマン",   romaji: "piiman",   english: "Green pepper", mongolian: "Чинжүү",        color: "#f0fdf4" },
    { emoji: "🧄", japanese: "にんにく",   romaji: "ninniku",  english: "Garlic",       mongolian: "Часнай",        color: "#faf5ff" },
    { emoji: "🍄", japanese: "きのこ",     romaji: "kinoko",   english: "Mushroom",     mongolian: "Мөөг",          color: "#f5f5f4" },
  ],
  nomimono: [
    { emoji: "💧", japanese: "みず",       romaji: "mizu",     english: "Water",        mongolian: "Ус",            color: "#eff6ff" },
    { emoji: "🥛", japanese: "ぎゅうにゅう",romaji: "gyuunyuu",english: "Milk",         mongolian: "Сүү",           color: "#f8fafc" },
    { emoji: "🧃", japanese: "ジュース",   romaji: "juusu",    english: "Juice",        mongolian: "Шүүс",          color: "#fef9c3" },
    { emoji: "🍵", japanese: "おちゃ",     romaji: "ocha",     english: "Tea",          mongolian: "Цай",           color: "#f0fdf4" },
    { emoji: "☕",  japanese: "コーヒー",   romaji: "koohii",   english: "Coffee",       mongolian: "Кофе",          color: "#fef3c7" },
    { emoji: "🧋", japanese: "タピオカ",   romaji: "tapioka",  english: "Bubble tea",   mongolian: "Бобл цай",      color: "#fce7f3" },
    { emoji: "🍹", japanese: "ジュース",   romaji: "juusu",    english: "Fruit drink",  mongolian: "Жимсний ундаа", color: "#fef9c3" },
    { emoji: "🥤", japanese: "ソーダ",     romaji: "sooda",    english: "Soda",         mongolian: "Сода ундаа",    color: "#eff6ff" },
  ],
  okashi: [
    { emoji: "🍰", japanese: "ケーキ",     romaji: "keeki",    english: "Cake",         mongolian: "Бялуу",         color: "#fce7f3" },
    { emoji: "🍦", japanese: "アイスクリーム",romaji: "aisu kuriimu",english: "Ice cream",mongolian: "Зайрмаг",     color: "#fefce8" },
    { emoji: "🍫", japanese: "チョコレート",romaji: "chokoreeto",english: "Chocolate",  mongolian: "Шоколад",       color: "#fef2f2" },
    { emoji: "🍪", japanese: "クッキー",   romaji: "kukkii",   english: "Cookie",       mongolian: "Жигнэмэг",      color: "#fff7ed" },
    { emoji: "🍩", japanese: "ドーナツ",   romaji: "doonatsu", english: "Donut",        mongolian: "Донат",         color: "#fef3c7" },
    { emoji: "🍭", japanese: "あめ",       romaji: "ame",      english: "Candy",        mongolian: "Чихэр",         color: "#fdf4ff" },
    { emoji: "🧁", japanese: "カップケーキ",romaji: "kappukeeki",english: "Cupcake",    mongolian: "Капкейк",       color: "#fce7f3" },
    { emoji: "🍮", japanese: "プリン",     romaji: "purin",    english: "Pudding",      mongolian: "Пудинг",        color: "#fef9c3" },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "all",      label: "ぜんぶ",    icon: "🍽️" },
  { id: "gohan",    label: "ごはん",    icon: "🍚" },
  { id: "kudamono", label: "くだもの",  icon: "🍎" },
  { id: "yasai",    label: "やさい",    icon: "🥕" },
  { id: "nomimono", label: "のみもの",  icon: "🥛" },
  { id: "okashi",   label: "おかし",    icon: "🍰" },
];

export default function FoodPage() {
  const [category, setCategory] = useState<Category>("all");
  const [active, setActive] = useState<FoodItem | null>(null);
  const { speak } = useSpeech();

  const allFoods = Object.values(FOODS).flat();
  const items = category === "all" ? allFoods : FOODS[category];

  const handleTap = (food: FoodItem) => {
    speak(food.japanese);
    setActive(food);
    setTimeout(() => setActive(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-black text-gray-800">🍽️ たべもの・のみもの</h1>
          <p className="text-xs text-gray-400 mt-0.5">タップして なまえを きこう！ · Хоол хүнс</p>
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                category === cat.id
                  ? "bg-orange-400 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4 pb-28">
        {items.map((food, i) => (
          <button
            key={`${food.japanese}-${i}`}
            onClick={() => handleTap(food)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-3xl shadow-sm border border-white/80 transition-all active:scale-95 hover:shadow-md"
            style={{ backgroundColor: food.color }}
          >
            <span className="text-5xl leading-none">{food.emoji}</span>
            <span className="text-sm font-black text-gray-800 leading-tight text-center">{food.japanese}</span>
            <span className="text-[10px] text-gray-400 font-bold">{food.romaji}</span>
          </button>
        ))}
      </div>

      {/* Floating detail card */}
      {active && (
        <div
          key={active.japanese + active.emoji}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 px-6 py-4 flex items-center gap-4 min-w-[260px]">
            <span className="text-6xl">{active.emoji}</span>
            <div>
              <p className="text-3xl font-black text-gray-800 leading-tight">{active.japanese}</p>
              <p className="text-sm font-bold text-orange-500">{active.romaji}</p>
              <p className="text-sm text-gray-500">{active.english}</p>
              <p className="text-xs text-blue-400 font-bold mt-0.5">{active.mongolian}</p>
            </div>
            <span className="text-2xl animate-bounce self-start mt-1">🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}
