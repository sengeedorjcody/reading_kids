"use client";

import { useState, useRef } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── QWERTY keyboard rows ─────────────────────────────────────────────────────
const QWERTY_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

// ── Simple English word dictionary with emoji ─────────────────────────────────
const WORD_DICT: { word: string; emoji: string; mongolian: string }[] = [
  // Animals
  { word: "CAT",      emoji: "🐱", mongolian: "Муур" },
  { word: "DOG",      emoji: "🐶", mongolian: "Нохой" },
  { word: "COW",      emoji: "🐮", mongolian: "Үхэр" },
  { word: "PIG",      emoji: "🐷", mongolian: "Гахай" },
  { word: "HEN",      emoji: "🐔", mongolian: "Тахиа" },
  { word: "BEE",      emoji: "🐝", mongolian: "Зөгий" },
  { word: "ANT",      emoji: "🐜", mongolian: "Шоргоолж" },
  { word: "OWL",      emoji: "🦉", mongolian: "Шар шувуу" },
  { word: "FOX",      emoji: "🦊", mongolian: "Үнэг" },
  { word: "RAT",      emoji: "🐭", mongolian: "Хулгана" },
  { word: "EWE",      emoji: "🐑", mongolian: "Хонь" },
  { word: "YAK",      emoji: "🐂", mongolian: "Сарлаг" },
  { word: "GNU",      emoji: "🦬", mongolian: "Буйвал" },
  { word: "EMU",      emoji: "🐦", mongolian: "Эму" },
  { word: "ASS",      emoji: "🫏", mongolian: "Илжиг" },
  { word: "COD",      emoji: "🐟", mongolian: "Загас" },
  { word: "FLY",      emoji: "🦟", mongolian: "Ялаа" },
  { word: "JAY",      emoji: "🐦", mongolian: "Хэрээ" },
  { word: "BEAR",     emoji: "🐻", mongolian: "Баавгай" },
  { word: "BIRD",     emoji: "🐦", mongolian: "Шувуу" },
  { word: "CRAB",     emoji: "🦀", mongolian: "Хавч" },
  { word: "DEER",     emoji: "🦌", mongolian: "Буга" },
  { word: "DUCK",     emoji: "🦆", mongolian: "Нугас" },
  { word: "FISH",     emoji: "🐟", mongolian: "Загас" },
  { word: "FROG",     emoji: "🐸", mongolian: "Мэлхий" },
  { word: "GOAT",     emoji: "🐐", mongolian: "Ямаа" },
  { word: "HARE",     emoji: "🐇", mongolian: "Туулай" },
  { word: "LION",     emoji: "🦁", mongolian: "Арслан" },
  { word: "MOLE",     emoji: "🦔", mongolian: "Хорхой" },
  { word: "MULE",     emoji: "🫏", mongolian: "Лус" },
  { word: "PONY",     emoji: "🐴", mongolian: "Унага" },
  { word: "SEAL",     emoji: "🦭", mongolian: "Далайн арслан" },
  { word: "SLUG",     emoji: "🐛", mongolian: "Мэт" },
  { word: "SWAN",     emoji: "🦢", mongolian: "Хун" },
  { word: "TOAD",     emoji: "🐸", mongolian: "Мэлхий" },
  { word: "WOLF",     emoji: "🐺", mongolian: "Чоно" },
  { word: "WORM",     emoji: "🪱", mongolian: "Хорхой" },
  { word: "ZEBRA",    emoji: "🦓", mongolian: "Тахь" },
  { word: "HORSE",    emoji: "🐴", mongolian: "Морь" },
  { word: "MOUSE",    emoji: "🐭", mongolian: "Хулгана" },
  { word: "PANDA",    emoji: "🐼", mongolian: "Панда" },
  { word: "SHARK",    emoji: "🦈", mongolian: "Акула" },
  { word: "SHEEP",    emoji: "🐑", mongolian: "Хонь" },
  { word: "SNAKE",    emoji: "🐍", mongolian: "Могой" },
  { word: "TIGER",    emoji: "🐯", mongolian: "Бар" },
  { word: "WHALE",    emoji: "🐳", mongolian: "Халим" },
  { word: "CAMEL",    emoji: "🐪", mongolian: "Тэмээ" },
  { word: "EAGLE",    emoji: "🦅", mongolian: "Бүргэд" },
  { word: "GECKO",    emoji: "🦎", mongolian: "Гүрвэл" },
  { word: "KOALA",    emoji: "🐨", mongolian: "Коала" },
  { word: "LLAMA",    emoji: "🦙", mongolian: "Лама" },
  { word: "PARROT",   emoji: "🦜", mongolian: "Тотон шувуу" },
  { word: "RABBIT",   emoji: "🐰", mongolian: "Туулай" },
  { word: "MONKEY",   emoji: "🐒", mongolian: "Сармагчин" },
  { word: "DONKEY",   emoji: "🫏", mongolian: "Илжиг" },
  { word: "CHICKEN",  emoji: "🐔", mongolian: "Тахиа" },
  { word: "DOLPHIN",  emoji: "🐬", mongolian: "Усны гахай" },
  { word: "GIRAFFE",  emoji: "🦒", mongolian: "Анааш" },
  { word: "HAMSTER",  emoji: "🐹", mongolian: "Хомяк" },
  { word: "PENGUIN",  emoji: "🐧", mongolian: "Пингвин" },
  { word: "PEACOCK",  emoji: "🦚", mongolian: "Тогос" },
  { word: "GORILLA",  emoji: "🦍", mongolian: "Горилл" },
  { word: "ELEPHANT", emoji: "🐘", mongolian: "Заан" },
  { word: "FLAMINGO", emoji: "🦩", mongolian: "Фламинго" },
  { word: "BUTTERFLY",emoji: "🦋", mongolian: "Эрвээхий" },
  // Food
  { word: "EGG",      emoji: "🥚", mongolian: "Өндөг" },
  { word: "HAM",      emoji: "🍖", mongolian: "Жамбон" },
  { word: "JAM",      emoji: "🍓", mongolian: "Жэм" },
  { word: "NUT",      emoji: "🥜", mongolian: "Самар" },
  { word: "PIE",      emoji: "🥧", mongolian: "Пай" },
  { word: "YAM",      emoji: "🍠", mongolian: "Чихрийн төмс" },
  { word: "CAKE",     emoji: "🎂", mongolian: "Бялуу" },
  { word: "CORN",     emoji: "🌽", mongolian: "Эрдэнэ шиш" },
  { word: "MILK",     emoji: "🥛", mongolian: "Сүү" },
  { word: "PEAR",     emoji: "🍐", mongolian: "Лийр" },
  { word: "PLUM",     emoji: "🫐", mongolian: "Үхрийн нүд" },
  { word: "RICE",     emoji: "🍚", mongolian: "Цагаан будаа" },
  { word: "SOUP",     emoji: "🥣", mongolian: "Шөл" },
  { word: "TACO",     emoji: "🌮", mongolian: "Тако" },
  { word: "APPLE",    emoji: "🍎", mongolian: "Алим" },
  { word: "BREAD",    emoji: "🍞", mongolian: "Талх" },
  { word: "CANDY",    emoji: "🍬", mongolian: "Чихэр" },
  { word: "GRAPE",    emoji: "🍇", mongolian: "Усан үзэм" },
  { word: "HONEY",    emoji: "🍯", mongolian: "Зөгийн бал" },
  { word: "JUICE",    emoji: "🧃", mongolian: "Шүүс" },
  { word: "LEMON",    emoji: "🍋", mongolian: "Нимбэг" },
  { word: "MANGO",    emoji: "🥭", mongolian: "Манго" },
  { word: "MELON",    emoji: "🍈", mongolian: "Зөгийн бал тарвас" },
  { word: "ONION",    emoji: "🧅", mongolian: "Сонгино" },
  { word: "PEACH",    emoji: "🍑", mongolian: "Тоор" },
  { word: "PIZZA",    emoji: "🍕", mongolian: "Пицца" },
  { word: "SALAD",    emoji: "🥗", mongolian: "Салат" },
  { word: "SUGAR",    emoji: "🧁", mongolian: "Элсэн чихэр" },
  { word: "WATER",    emoji: "💧", mongolian: "Ус" },
  { word: "BANANA",   emoji: "🍌", mongolian: "Гадил" },
  { word: "CARROT",   emoji: "🥕", mongolian: "Лууван" },
  { word: "CHEESE",   emoji: "🧀", mongolian: "Бяслаг" },
  { word: "COOKIE",   emoji: "🍪", mongolian: "Жигнэмэг" },
  { word: "COFFEE",   emoji: "☕",  mongolian: "Кофе" },
  { word: "DONUT",    emoji: "🍩", mongolian: "Донат" },
  { word: "POTATO",   emoji: "🥔", mongolian: "Төмс" },
  { word: "TOMATO",   emoji: "🍅", mongolian: "Улаан лооль" },
  { word: "ORANGE",   emoji: "🍊", mongolian: "Жүрж" },
  { word: "CHERRY",   emoji: "🍒", mongolian: "Интоор" },
  { word: "BURGER",   emoji: "🍔", mongolian: "Бургер" },
  { word: "HOTDOG",   emoji: "🌭", mongolian: "Хот дог" },
  { word: "NOODLE",   emoji: "🍜", mongolian: "Гоймон" },
  { word: "PICKLE",   emoji: "🥒", mongolian: "Давслаг өргөст хэмх" },
  { word: "WAFFLE",   emoji: "🧇", mongolian: "Вафель" },
  { word: "YOGURT",   emoji: "🍦", mongolian: "Тараг" },
  { word: "SUSHI",    emoji: "🍣", mongolian: "Суши" },
  { word: "RAMEN",    emoji: "🍜", mongolian: "Рамэн" },
  { word: "STEAK",    emoji: "🥩", mongolian: "Стэйк" },
  { word: "STRAWBERRY",emoji:"🍓", mongolian: "Гүзээлзгэнэ" },
  { word: "CHOCOLATE",emoji: "🍫", mongolian: "Шоколад" },
  { word: "ICECREAM", emoji: "🍦", mongolian: "Зайрмаг" },
  { word: "BROCCOLI", emoji: "🥦", mongolian: "Броккол" },
  { word: "BLUEBERRY",emoji: "🫐", mongolian: "Нэрс" },
  // Colors
  { word: "RED",      emoji: "🔴", mongolian: "Улаан" },
  { word: "BLUE",     emoji: "🔵", mongolian: "Цэнхэр" },
  { word: "PINK",     emoji: "🩷", mongolian: "Ягаан" },
  { word: "GOLD",     emoji: "✨", mongolian: "Алтан" },
  { word: "GRAY",     emoji: "🩶", mongolian: "Саарал" },
  { word: "GREEN",    emoji: "🟢", mongolian: "Ногоон" },
  { word: "BLACK",    emoji: "⚫", mongolian: "Хар" },
  { word: "WHITE",    emoji: "⚪", mongolian: "Цагаан" },
  { word: "BROWN",    emoji: "🟤", mongolian: "Хүрэн" },
  { word: "PURPLE",   emoji: "🟣", mongolian: "Нил ягаан" },
  { word: "YELLOW",   emoji: "🟡", mongolian: "Шар" },
  { word: "ORANGE",   emoji: "🟠", mongolian: "Улбар шар" },
  // Nature
  { word: "SUN",      emoji: "☀️",  mongolian: "Нар" },
  { word: "SKY",      emoji: "🌤️",  mongolian: "Тэнгэр" },
  { word: "SEA",      emoji: "🌊", mongolian: "Тэнгис" },
  { word: "ICE",      emoji: "🧊", mongolian: "Мөс" },
  { word: "DEW",      emoji: "💧", mongolian: "Шүүдэр" },
  { word: "MOON",     emoji: "🌙", mongolian: "Сар" },
  { word: "RAIN",     emoji: "🌧️",  mongolian: "Бороо" },
  { word: "SNOW",     emoji: "❄️",  mongolian: "Цас" },
  { word: "STAR",     emoji: "⭐", mongolian: "Одон" },
  { word: "TREE",     emoji: "🌲", mongolian: "Мод" },
  { word: "WIND",     emoji: "💨", mongolian: "Салхи" },
  { word: "CLOUD",    emoji: "☁️",  mongolian: "Үүл" },
  { word: "EARTH",    emoji: "🌍", mongolian: "Дэлхий" },
  { word: "FLAME",    emoji: "🔥", mongolian: "Гал" },
  { word: "FLOOD",    emoji: "🌊", mongolian: "Үер" },
  { word: "FOREST",   emoji: "🌳", mongolian: "Ой" },
  { word: "FLOWER",   emoji: "🌸", mongolian: "Цэцэг" },
  { word: "RIVER",    emoji: "🏞️",  mongolian: "Гол" },
  { word: "OCEAN",    emoji: "🌊", mongolian: "Далай" },
  { word: "DESERT",   emoji: "🏜️",  mongolian: "Цөл" },
  { word: "ISLAND",   emoji: "🏝️",  mongolian: "Арал" },
  { word: "MOUNTAIN", emoji: "🏔️",  mongolian: "Уул" },
  { word: "RAINBOW",  emoji: "🌈", mongolian: "Солонго" },
  { word: "VOLCANO",  emoji: "🌋", mongolian: "Галт уул" },
  // Common words
  { word: "BUS",      emoji: "🚌", mongolian: "Автобус" },
  { word: "CAR",      emoji: "🚗", mongolian: "Машин" },
  { word: "BAG",      emoji: "👜", mongolian: "Цүнх" },
  { word: "BED",      emoji: "🛏️",  mongolian: "Ортой тавилга" },
  { word: "BOX",      emoji: "📦", mongolian: "Хайрцаг" },
  { word: "CUP",      emoji: "☕",  mongolian: "Аяга" },
  { word: "HAT",      emoji: "🎩", mongolian: "Малгай" },
  { word: "KEY",      emoji: "🔑", mongolian: "Түлхүүр" },
  { word: "MAP",      emoji: "🗺️",  mongolian: "Газрын зураг" },
  { word: "PEN",      emoji: "🖊️",  mongolian: "Үзэг" },
  { word: "POT",      emoji: "🪴", mongolian: "Хувин" },
  { word: "TUB",      emoji: "🛁", mongolian: "Ванн" },
  { word: "VAN",      emoji: "🚐", mongolian: "Жийп" },
  { word: "WIG",      emoji: "💇", mongolian: "Хиймэл үс" },
  { word: "ZOO",      emoji: "🦁", mongolian: "Амьтны хүрээлэн" },
  { word: "BALL",     emoji: "⚽", mongolian: "Бөмбөг" },
  { word: "BELL",     emoji: "🔔", mongolian: "Хонх" },
  { word: "BIKE",     emoji: "🚲", mongolian: "Дугуй" },
  { word: "BOOK",     emoji: "📚", mongolian: "Ном" },
  { word: "BOWL",     emoji: "🥣", mongolian: "Аяга таваг" },
  { word: "COAT",     emoji: "🧥", mongolian: "Пальто" },
  { word: "DESK",     emoji: "🪑", mongolian: "Ширээ" },
  { word: "DOLL",     emoji: "🪆", mongolian: "Хүүхэлдэй" },
  { word: "DOOR",     emoji: "🚪", mongolian: "Хаалга" },
  { word: "DRUM",     emoji: "🥁", mongolian: "Бөмбөр" },
  { word: "FLAG",     emoji: "🚩", mongolian: "Туг" },
  { word: "FORK",     emoji: "🍴", mongolian: "Сэрээ" },
  { word: "GAME",     emoji: "🎮", mongolian: "Тоглоом" },
  { word: "GIFT",     emoji: "🎁", mongolian: "Бэлэг" },
  { word: "GLUE",     emoji: "🖊️",  mongolian: "Цавуу" },
  { word: "HORN",     emoji: "📯", mongolian: "Эвэр" },
  { word: "KITE",     emoji: "🪁", mongolian: "Хий тэрэг" },
  { word: "LAMP",     emoji: "💡", mongolian: "Чийдэн" },
  { word: "LOCK",     emoji: "🔒", mongolian: "Цоож" },
  { word: "MASK",     emoji: "🎭", mongolian: "Маск" },
  { word: "ROPE",     emoji: "🪢", mongolian: "Олс" },
  { word: "SHOE",     emoji: "👟", mongolian: "Гутал" },
  { word: "SHIP",     emoji: "🚢", mongolian: "Хөлөг онгоц" },
  { word: "SOCK",     emoji: "🧦", mongolian: "Оймс" },
  { word: "SOFA",     emoji: "🛋️",  mongolian: "Диван" },
  { word: "STAR",     emoji: "⭐", mongolian: "Одон" },
  { word: "TENT",     emoji: "⛺", mongolian: "Майхан" },
  { word: "VASE",     emoji: "🏺", mongolian: "Ваар" },
  { word: "BIKE",     emoji: "🚲", mongolian: "Дугуй" },
  { word: "TRAIN",    emoji: "🚂", mongolian: "Галт тэрэг" },
  { word: "PLANE",    emoji: "✈️",  mongolian: "Онгоц" },
  { word: "CLOCK",    emoji: "⏰", mongolian: "Цаг" },
  { word: "CLOUD",    emoji: "☁️",  mongolian: "Үүл" },
  { word: "CROWN",    emoji: "👑", mongolian: "Титэм" },
  { word: "KNIFE",    emoji: "🔪", mongolian: "Хутга" },
  { word: "PHONE",    emoji: "📱", mongolian: "Утас" },
  { word: "PIANO",    emoji: "🎹", mongolian: "Төгөлдөр хуур" },
  { word: "ROBOT",    emoji: "🤖", mongolian: "Робот" },
  { word: "RULER",    emoji: "📏", mongolian: "Захирагч" },
  { word: "SPOON",    emoji: "🥄", mongolian: "Халбага" },
  { word: "SWORD",    emoji: "⚔️",  mongolian: "Илд" },
  { word: "TABLE",    emoji: "🪑", mongolian: "Ширээ" },
  { word: "TOWEL",    emoji: "🏖️",  mongolian: "Алчуур" },
  { word: "TRUCK",    emoji: "🚛", mongolian: "Ачааны машин" },
  { word: "BRUSH",    emoji: "🖌️",  mongolian: "Бийр" },
  { word: "CAMERA",   emoji: "📷", mongolian: "Камер" },
  { word: "ERASER",   emoji: "✏️",  mongolian: "Баллуур" },
  { word: "GUITAR",   emoji: "🎸", mongolian: "Гитар" },
  { word: "HAMMER",   emoji: "🔨", mongolian: "Алх" },
  { word: "PENCIL",   emoji: "✏️",  mongolian: "Харандаа" },
  { word: "PILLOW",   emoji: "🛏️",  mongolian: "Дэр" },
  { word: "ROCKET",   emoji: "🚀", mongolian: "Пуужин" },
  { word: "SCHOOL",   emoji: "🏫", mongolian: "Сургууль" },
  { word: "TROPHY",   emoji: "🏆", mongolian: "Цом" },
  { word: "VIOLIN",   emoji: "🎻", mongolian: "Хийл" },
  { word: "WINDOW",   emoji: "🪟", mongolian: "Цонх" },
  { word: "BLANKET",  emoji: "🛏️",  mongolian: "Хөнжил" },
  { word: "COMPASS",  emoji: "🧭", mongolian: "Луужин" },
  { word: "DIAMOND",  emoji: "💎", mongolian: "Алмаз" },
  { word: "FEATHER",  emoji: "🪶", mongolian: "Өд" },
  { word: "GLASSES",  emoji: "👓", mongolian: "Нүдний шил" },
  { word: "LANTERN",  emoji: "🏮", mongolian: "Дэнлүү" },
  { word: "MAGNET",   emoji: "🧲", mongolian: "Соронз" },
  { word: "MIRROR",   emoji: "🪞", mongolian: "Толь" },
  { word: "NEEDLE",   emoji: "🧵", mongolian: "Зүү" },
  { word: "PUZZLE",   emoji: "🧩", mongolian: "Оньсого" },
  { word: "RIBBON",   emoji: "🎀", mongolian: "Тууз" },
  { word: "SEESAW",   emoji: "🎡", mongolian: "Тэнцүүр" },
  { word: "SHOVEL",   emoji: "⛏️",  mongolian: "Хусуур" },
  { word: "TICKET",   emoji: "🎟️",  mongolian: "Тийм" },
  { word: "UMBRELLA", emoji: "☂️",  mongolian: "Шүхэр" },
  // Body
  { word: "ARM",      emoji: "💪", mongolian: "Гар" },
  { word: "EAR",      emoji: "👂", mongolian: "Чих" },
  { word: "EYE",      emoji: "👁️",  mongolian: "Нүд" },
  { word: "JAW",      emoji: "😮", mongolian: "Эрүү" },
  { word: "LEG",      emoji: "🦵", mongolian: "Хөл" },
  { word: "LIP",      emoji: "💋", mongolian: "Уруул" },
  { word: "RIB",      emoji: "🦴", mongolian: "Хавирга" },
  { word: "TOE",      emoji: "🦶", mongolian: "Хуруу" },
  { word: "BACK",     emoji: "🧍", mongolian: "Нуруу" },
  { word: "BONE",     emoji: "🦴", mongolian: "Яс" },
  { word: "CHIN",     emoji: "🧑", mongolian: "Эрүү" },
  { word: "FACE",     emoji: "😊", mongolian: "Царай" },
  { word: "FOOT",     emoji: "🦶", mongolian: "Хөл" },
  { word: "HAIR",     emoji: "💇", mongolian: "Үс" },
  { word: "HAND",     emoji: "🤲", mongolian: "Гар" },
  { word: "HEAD",     emoji: "🧠", mongolian: "Толгой" },
  { word: "KNEE",     emoji: "🦵", mongolian: "Өвдөг" },
  { word: "NAIL",     emoji: "💅", mongolian: "Хумс" },
  { word: "NECK",     emoji: "🧣", mongolian: "Хүзүү" },
  { word: "NOSE",     emoji: "👃", mongolian: "Хамар" },
  { word: "PALM",     emoji: "🤲", mongolian: "Алга" },
  { word: "SKIN",     emoji: "🧑", mongolian: "Арьс" },
  { word: "TOOTH",    emoji: "🦷", mongolian: "Шүд" },
  { word: "THUMB",    emoji: "👍", mongolian: "Эрхий хуруу" },
  { word: "ELBOW",    emoji: "💪", mongolian: "Тохой" },
  { word: "HEART",    emoji: "❤️",  mongolian: "Зүрх" },
  { word: "MOUTH",    emoji: "👄", mongolian: "Ам" },
  { word: "BRAIN",    emoji: "🧠", mongolian: "Тархи" },
  { word: "CHEEK",    emoji: "😊", mongolian: "Хацар" },
  { word: "CHEST",    mongolian: "Цээж", emoji: "🧍" },
  { word: "ANKLE",    emoji: "🦶", mongolian: "Шагай" },
  { word: "FINGER",   emoji: "👆", mongolian: "Хуруу" },
  { word: "TONGUE",   emoji: "👅", mongolian: "Хэл" },
  { word: "THROAT",   emoji: "🗣️",  mongolian: "Хоолой" },
  { word: "STOMACH",  emoji: "🫃", mongolian: "Гэдэс" },
  { word: "FOREHEAD", emoji: "😊", mongolian: "Духи" },
  { word: "SHOULDER", emoji: "🤷", mongolian: "Мөр" },
];

export default function WordsEnglishPage() {
  const [word, setWord] = useState<string[]>([]);
  const [lastChar, setLastChar] = useState<string | null>(null);
  const [caps, setCaps] = useState(true);
  const { speak } = useSpeech();

  const current = word.join("");

  const suggestions = current.length > 0
    ? WORD_DICT.filter((w) => w.word.startsWith(current.toUpperCase())).slice(0, 6)
    : [];
  const exactMatch = WORD_DICT.find((w) => w.word === current.toUpperCase());

  const addChar = (c: string) => {
    const next = [...word, c];
    setWord(next);
    setLastChar(c);
    speak(c.toLowerCase(), "en-US");
  };

  const backspace = () => {
    setWord((w) => {
      const next = w.slice(0, -1);
      setLastChar(next.at(-1) ?? null);
      return next;
    });
  };

  const clear = () => { setWord([]); setLastChar(null); };

  const speakWord = () => {
    if (current) speak(current, "en-US");
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "100dvh", background: "linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)" }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <h1 className="text-xl font-black text-white">🔤 English Word Builder</h1>
      </div>

      {/* ── Word display ── */}
      <div className="flex-shrink-0 mx-4 mt-3 mb-2 rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[70px]"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex-1 flex flex-wrap gap-1 min-h-[40px] items-center">
          {word.length === 0
            ? <span className="text-white/20 text-2xl font-black">type a word…</span>
            : word.map((c, i) => (
                <span key={i} className={`text-4xl font-black leading-none ${
                  i === word.length - 1 ? "text-yellow-300" : "text-white"
                }`}>{c}</span>
              ))
          }
        </div>
        <div className="flex gap-1.5">
          <button onClick={speakWord} disabled={!current}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg active:scale-90 disabled:opacity-30"
            style={{ background: "rgba(59,130,246,0.3)", border: "1px solid rgba(59,130,246,0.5)" }}>
            🔊
          </button>
          <button onClick={backspace} disabled={word.length === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg active:scale-90 disabled:opacity-30"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
            ⌫
          </button>
          <button onClick={clear} disabled={word.length === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm active:scale-90 disabled:opacity-30 text-white/60"
            style={{ background: "rgba(100,116,139,0.2)", border: "1px solid rgba(100,116,139,0.3)" }}>
            ✕
          </button>
        </div>
      </div>

      {/* ── Exact match ── */}
      {exactMatch && (
        <div className="mx-4 mb-2 rounded-2xl px-4 py-2.5 flex items-center gap-3"
          style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)" }}>
          <span className="text-3xl">{exactMatch.emoji}</span>
          <div className="flex-1">
            <span className="text-green-300 font-black text-lg">{exactMatch.word}</span>
            <span className="text-green-300/60 text-sm ml-2">{exactMatch.mongolian}</span>
          </div>
          <button onClick={() => speak(exactMatch.word, "en-US")} className="text-lg active:scale-90">🔊</button>
        </div>
      )}

      {/* ── Suggestions ── */}
      {suggestions.length > 0 && !exactMatch && (
        <div className="mx-4 mb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button key={s.word}
              onClick={() => { setWord(Array.from(caps ? s.word : s.word.toLowerCase())); setLastChar(null); speak(s.word, "en-US"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl active:scale-95"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <span className="text-xl">{s.emoji}</span>
              <span className="text-white font-black text-sm">{s.word}</span>
              <span className="text-white/40 text-xs">{s.mongolian}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── QWERTY Keyboard ── */}
      <div className="flex-1 overflow-y-auto pb-24 px-2 flex flex-col justify-end gap-1.5 pt-2">
        {QWERTY_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((c) => {
              const display = caps ? c : c.toLowerCase();
              const isLast = c === lastChar?.toUpperCase();
              return (
                <button
                  key={c}
                  onClick={() => addChar(display)}
                  className="font-black transition-all active:scale-90 flex items-center justify-center rounded-xl"
                  style={{
                    width: "9.5%",
                    maxWidth: 44,
                    height: 46,
                    fontSize: 18,
                    background: isLast
                      ? "rgba(251,191,36,0.35)"
                      : "rgba(255,255,255,0.12)",
                    border: isLast
                      ? "1.5px solid rgba(251,191,36,0.7)"
                      : "1px solid rgba(255,255,255,0.15)",
                    color: isLast ? "#fbbf24" : "#fff",
                    boxShadow: "0 2px 0 rgba(0,0,0,0.4)",
                  }}
                >
                  {display}
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom row: Caps + Space + Backspace */}
        <div className="flex justify-center gap-1">
          <button
            onClick={() => setCaps((v) => !v)}
            className="font-black rounded-xl active:scale-90 flex items-center justify-center text-sm"
            style={{
              width: "14%", maxWidth: 60, height: 46,
              background: caps ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.1)",
              border: caps ? "1.5px solid rgba(99,102,241,0.7)" : "1px solid rgba(255,255,255,0.15)",
              color: caps ? "#a5b4fc" : "#fff",
              boxShadow: "0 2px 0 rgba(0,0,0,0.4)",
            }}>
            {caps ? "⬆️" : "⬇️"}
          </button>
          <button
            onClick={() => addChar(" ")}
            className="font-black rounded-xl active:scale-90 flex items-center justify-center text-white/60 text-xs"
            style={{
              flex: 1, maxWidth: 200, height: 46,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 2px 0 rgba(0,0,0,0.4)",
            }}>
            SPACE
          </button>
          <button
            onClick={backspace}
            disabled={word.length === 0}
            className="font-black rounded-xl active:scale-90 flex items-center justify-center disabled:opacity-30"
            style={{
              width: "14%", maxWidth: 60, height: 46,
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#fca5a5",
              boxShadow: "0 2px 0 rgba(0,0,0,0.4)",
            }}>
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
