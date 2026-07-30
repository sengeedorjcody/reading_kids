"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface Word {
  emoji: string;
  word: string;
  mongolian: string;
}

type Category = "all" | "animals" | "food" | "colors" | "numbers" | "body" | "nature" | "transport" | "home" | "actions";

const WORDS: Record<Exclude<Category, "all">, Word[]> = {
  animals: [
    { emoji: "🐶", word: "Dog",       mongolian: "Нохой" },
    { emoji: "🐱", word: "Cat",       mongolian: "Муур" },
    { emoji: "🐭", word: "Mouse",     mongolian: "Хулгана" },
    { emoji: "🐰", word: "Rabbit",    mongolian: "Туулай" },
    { emoji: "🦊", word: "Fox",       mongolian: "Үнэг" },
    { emoji: "🐻", word: "Bear",      mongolian: "Баавгай" },
    { emoji: "🐼", word: "Panda",     mongolian: "Панда" },
    { emoji: "🐯", word: "Tiger",     mongolian: "Бар" },
    { emoji: "🦁", word: "Lion",      mongolian: "Арслан" },
    { emoji: "🐮", word: "Cow",       mongolian: "Үхэр" },
    { emoji: "🐷", word: "Pig",       mongolian: "Гахай" },
    { emoji: "🐸", word: "Frog",      mongolian: "Мэлхий" },
    { emoji: "🐔", word: "Chicken",   mongolian: "Тахиа" },
    { emoji: "🐧", word: "Penguin",   mongolian: "Пингвин" },
    { emoji: "🐦", word: "Bird",      mongolian: "Шувуу" },
    { emoji: "🐟", word: "Fish",      mongolian: "Загас" },
    { emoji: "🐬", word: "Dolphin",   mongolian: "Усны гахай" },
    { emoji: "🐘", word: "Elephant",  mongolian: "Заан" },
    { emoji: "🦒", word: "Giraffe",   mongolian: "Анааш" },
    { emoji: "🦓", word: "Zebra",     mongolian: "Тахь" },
    { emoji: "🐊", word: "Crocodile", mongolian: "Матар" },
    { emoji: "🦋", word: "Butterfly", mongolian: "Эрвээхий" },
    { emoji: "🐝", word: "Bee",       mongolian: "Зөгий" },
    { emoji: "🐌", word: "Snail",     mongolian: "Мэт" },
  ],
  food: [
    { emoji: "🍎", word: "Apple",      mongolian: "Алим" },
    { emoji: "🍌", word: "Banana",     mongolian: "Гадил" },
    { emoji: "🍊", word: "Orange",     mongolian: "Жүрж" },
    { emoji: "🍓", word: "Strawberry", mongolian: "Гүзээлзгэнэ" },
    { emoji: "🍇", word: "Grapes",     mongolian: "Усан үзэм" },
    { emoji: "🍉", word: "Watermelon", mongolian: "Тарвас" },
    { emoji: "🍑", word: "Peach",      mongolian: "Тоор" },
    { emoji: "🥕", word: "Carrot",     mongolian: "Лууван" },
    { emoji: "🌽", word: "Corn",       mongolian: "Эрдэнэ шиш" },
    { emoji: "🍅", word: "Tomato",     mongolian: "Улаан лооль" },
    { emoji: "🥦", word: "Broccoli",   mongolian: "Броккол" },
    { emoji: "🥔", word: "Potato",     mongolian: "Төмс" },
    { emoji: "🍞", word: "Bread",      mongolian: "Талх" },
    { emoji: "🍳", word: "Egg",        mongolian: "Өндөг" },
    { emoji: "🧀", word: "Cheese",     mongolian: "Бяслаг" },
    { emoji: "🥛", word: "Milk",       mongolian: "Сүү" },
    { emoji: "🍰", word: "Cake",       mongolian: "Бялуу" },
    { emoji: "🍪", word: "Cookie",     mongolian: "Жигнэмэг" },
    { emoji: "🍦", word: "Ice cream",  mongolian: "Зайрмаг" },
    { emoji: "🍫", word: "Chocolate",  mongolian: "Шоколад" },
    { emoji: "🧃", word: "Juice",      mongolian: "Шүүс" },
    { emoji: "💧", word: "Water",      mongolian: "Ус" },
    { emoji: "🍵", word: "Tea",        mongolian: "Цай" },
    { emoji: "☕",  word: "Coffee",     mongolian: "Кофе" },
  ],
  colors: [
    { emoji: "🔴", word: "Red",        mongolian: "Улаан" },
    { emoji: "🟠", word: "Orange",     mongolian: "Улбар шар" },
    { emoji: "🟡", word: "Yellow",     mongolian: "Шар" },
    { emoji: "🟢", word: "Green",      mongolian: "Ногоон" },
    { emoji: "🔵", word: "Blue",       mongolian: "Цэнхэр" },
    { emoji: "🟣", word: "Purple",     mongolian: "Нил ягаан" },
    { emoji: "🩷", word: "Pink",       mongolian: "Ягаан" },
    { emoji: "🟤", word: "Brown",      mongolian: "Хүрэн" },
    { emoji: "⚫", word: "Black",      mongolian: "Хар" },
    { emoji: "⚪", word: "White",      mongolian: "Цагаан" },
    { emoji: "🩶", word: "Gray",       mongolian: "Саарал" },
    { emoji: "✨", word: "Gold",       mongolian: "Алтан" },
  ],
  numbers: [
    { emoji: "1️⃣",  word: "One",       mongolian: "Нэг" },
    { emoji: "2️⃣",  word: "Two",       mongolian: "Хоёр" },
    { emoji: "3️⃣",  word: "Three",     mongolian: "Гурав" },
    { emoji: "4️⃣",  word: "Four",      mongolian: "Дөрөв" },
    { emoji: "5️⃣",  word: "Five",      mongolian: "Тав" },
    { emoji: "6️⃣",  word: "Six",       mongolian: "Зургаа" },
    { emoji: "7️⃣",  word: "Seven",     mongolian: "Долоо" },
    { emoji: "8️⃣",  word: "Eight",     mongolian: "Найм" },
    { emoji: "9️⃣",  word: "Nine",      mongolian: "Ес" },
    { emoji: "🔟", word: "Ten",        mongolian: "Арав" },
    { emoji: "💯", word: "Hundred",    mongolian: "Зуу" },
    { emoji: "🔢", word: "Thousand",   mongolian: "Мянга" },
  ],
  body: [
    { emoji: "👁️",  word: "Eye",       mongolian: "Нүд" },
    { emoji: "👃", word: "Nose",       mongolian: "Хамар" },
    { emoji: "👄", word: "Mouth",      mongolian: "Ам" },
    { emoji: "👂", word: "Ear",        mongolian: "Чих" },
    { emoji: "💇", word: "Hair",       mongolian: "Үс" },
    { emoji: "🤲", word: "Hand",       mongolian: "Гар" },
    { emoji: "🦶", word: "Foot",       mongolian: "Хөл" },
    { emoji: "🦷", word: "Tooth",      mongolian: "Шүд" },
    { emoji: "💪", word: "Arm",        mongolian: "Гарын тохой" },
    { emoji: "🧠", word: "Brain",      mongolian: "Тархи" },
    { emoji: "❤️",  word: "Heart",     mongolian: "Зүрх" },
    { emoji: "🧍", word: "Body",       mongolian: "Бие" },
  ],
  nature: [
    { emoji: "☀️",  word: "Sun",        mongolian: "Нар" },
    { emoji: "🌙", word: "Moon",        mongolian: "Сар" },
    { emoji: "⭐", word: "Star",        mongolian: "Одон" },
    { emoji: "☁️",  word: "Cloud",      mongolian: "Үүл" },
    { emoji: "🌧️",  word: "Rain",       mongolian: "Бороо" },
    { emoji: "❄️",  word: "Snow",       mongolian: "Цас" },
    { emoji: "⚡", word: "Lightning",   mongolian: "Аянга" },
    { emoji: "🌈", word: "Rainbow",     mongolian: "Солонго" },
    { emoji: "🌲", word: "Tree",        mongolian: "Мод" },
    { emoji: "🌸", word: "Flower",      mongolian: "Цэцэг" },
    { emoji: "🍂", word: "Leaf",        mongolian: "Навч" },
    { emoji: "🏔️",  word: "Mountain",   mongolian: "Уул" },
    { emoji: "🌊", word: "Ocean",       mongolian: "Далай" },
    { emoji: "🏜️",  word: "Desert",     mongolian: "Цөл" },
    { emoji: "🌋", word: "Volcano",     mongolian: "Галт уул" },
    { emoji: "🌍", word: "Earth",       mongolian: "Дэлхий" },
  ],
  transport: [
    { emoji: "🚗", word: "Car",         mongolian: "Машин" },
    { emoji: "🚌", word: "Bus",         mongolian: "Автобус" },
    { emoji: "🚂", word: "Train",       mongolian: "Галт тэрэг" },
    { emoji: "✈️",  word: "Airplane",   mongolian: "Онгоц" },
    { emoji: "🚢", word: "Ship",        mongolian: "Хөлөг онгоц" },
    { emoji: "🚲", word: "Bicycle",     mongolian: "Дугуй" },
    { emoji: "🛵", word: "Scooter",     mongolian: "Скутер" },
    { emoji: "🚁", word: "Helicopter",  mongolian: "Нисдэг тэрэг" },
    { emoji: "🚀", word: "Rocket",      mongolian: "Пуужин" },
    { emoji: "⛵", word: "Sailboat",    mongolian: "Дарьт завь" },
    { emoji: "🚒", word: "Fire truck",  mongolian: "Гал унтраагч машин" },
    { emoji: "🚑", word: "Ambulance",   mongolian: "Тусламжийн машин" },
  ],
  home: [
    { emoji: "🏠", word: "House",       mongolian: "Байшин" },
    { emoji: "🛋️",  word: "Sofa",       mongolian: "Диван" },
    { emoji: "🪑", word: "Chair",       mongolian: "Сандал" },
    { emoji: "🛏️",  word: "Bed",        mongolian: "Ортой тавилга" },
    { emoji: "🚪", word: "Door",        mongolian: "Хаалга" },
    { emoji: "🪟", word: "Window",      mongolian: "Цонх" },
    { emoji: "💡", word: "Light",       mongolian: "Гэрэл" },
    { emoji: "📺", word: "TV",          mongolian: "Телевиз" },
    { emoji: "📱", word: "Phone",       mongolian: "Утас" },
    { emoji: "💻", word: "Computer",    mongolian: "Компьютер" },
    { emoji: "📚", word: "Book",        mongolian: "Ном" },
    { emoji: "🧸", word: "Toy",         mongolian: "Тоглоом" },
  ],
  actions: [
    { emoji: "🏃", word: "Run",         mongolian: "Гүйх" },
    { emoji: "🚶", word: "Walk",        mongolian: "Явах" },
    { emoji: "🕺", word: "Dance",       mongolian: "Бүжиглэх" },
    { emoji: "🎵", word: "Sing",        mongolian: "Дуулах" },
    { emoji: "😴", word: "Sleep",       mongolian: "Унтах" },
    { emoji: "🍽️",  word: "Eat",        mongolian: "Идэх" },
    { emoji: "🥤", word: "Drink",       mongolian: "Уух" },
    { emoji: "📖", word: "Read",        mongolian: "Унших" },
    { emoji: "✏️",  word: "Write",      mongolian: "Бичих" },
    { emoji: "🎨", word: "Draw",        mongolian: "Зурах" },
    { emoji: "⚽", word: "Play",        mongolian: "Тоглох" },
    { emoji: "🏊", word: "Swim",        mongolian: "Сэлэх" },
    { emoji: "🛁", word: "Wash",        mongolian: "Угаах" },
    { emoji: "😂", word: "Laugh",       mongolian: "Инээх" },
    { emoji: "😭", word: "Cry",         mongolian: "Уйлах" },
    { emoji: "🤔", word: "Think",       mongolian: "Бодох" },
  ],
};

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "all",       label: "All",       icon: "🔤" },
  { id: "animals",   label: "Animals",   icon: "🐾" },
  { id: "food",      label: "Food",      icon: "🍎" },
  { id: "colors",    label: "Colors",    icon: "🎨" },
  { id: "numbers",   label: "Numbers",   icon: "🔢" },
  { id: "body",      label: "Body",      icon: "🧍" },
  { id: "nature",    label: "Nature",    icon: "🌿" },
  { id: "transport", label: "Transport", icon: "🚗" },
  { id: "home",      label: "Home",      icon: "🏠" },
  { id: "actions",   label: "Actions",   icon: "🏃" },
];

export default function EnglishPage() {
  const [category, setCategory] = useState<Category>("all");
  const [active, setActive] = useState<Word | null>(null);
  const { speak } = useSpeech();

  const allWords = Object.values(WORDS).flat();
  const items = category === "all" ? allWords : WORDS[category];

  const handleTap = (word: Word) => {
    speak(word.word, "en-US");
    setActive(word);
    setTimeout(() => setActive(null), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-indigo-100 shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-black text-gray-800">🔤 English Words</h1>
          <p className="text-xs text-gray-400 mt-0.5">Tap any word to hear it! · Дарж сонсоорой!</p>
        </div>
        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                category === cat.id
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Word grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4 pb-28">
        {items.map((word, i) => (
          <button
            key={`${word.word}-${i}`}
            onClick={() => handleTap(word)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-3xl bg-white shadow-sm border border-white/80 transition-all active:scale-95 hover:shadow-md hover:border-indigo-200"
          >
            <span className="text-5xl leading-none">{word.emoji}</span>
            <span className="text-sm font-black text-gray-800 leading-tight text-center">{word.word}</span>
            <span className="text-[10px] text-indigo-400 font-bold text-center leading-tight">{word.mongolian}</span>
          </button>
        ))}
      </div>

      {/* Floating detail card */}
      {active && (
        <div
          key={active.word + active.emoji}
          className="fixed bottom-28 left-1/2 z-50 animate-fade-in"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-indigo-100 px-6 py-4 flex items-center gap-4 min-w-[240px]">
            <span className="text-6xl">{active.emoji}</span>
            <div>
              <p className="text-3xl font-black text-gray-800 leading-tight">{active.word}</p>
              <p className="text-sm font-bold text-indigo-400 mt-0.5">{active.mongolian}</p>
            </div>
            <span className="text-2xl animate-bounce self-start mt-1">🔊</span>
          </div>
        </div>
      )}
    </div>
  );
}
