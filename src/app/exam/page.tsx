"use client";

import { useState, useRef, useEffect } from "react";
import { useSpeech } from "@/hooks/useSpeech";

// ── Data ──────────────────────────────────────────────────────────────────────
interface CharCard {
  char: string;
  romaji: string;
  type: "hiragana" | "katakana";
  examples: { word: string; meaning: string }[];
}

const HIRAGANA: CharCard[] = [
  { char:"あ", romaji:"a",   type:"hiragana", examples:[{word:"あめ",meaning:"rain"},{word:"あか",meaning:"red"}] },
  { char:"い", romaji:"i",   type:"hiragana", examples:[{word:"いぬ",meaning:"dog"},{word:"いす",meaning:"chair"}] },
  { char:"う", romaji:"u",   type:"hiragana", examples:[{word:"うみ",meaning:"sea"},{word:"うし",meaning:"cow"}] },
  { char:"え", romaji:"e",   type:"hiragana", examples:[{word:"えき",meaning:"station"},{word:"えほん",meaning:"picture book"}] },
  { char:"お", romaji:"o",   type:"hiragana", examples:[{word:"おか",meaning:"hill"},{word:"おに",meaning:"demon"}] },
  { char:"か", romaji:"ka",  type:"hiragana", examples:[{word:"かさ",meaning:"umbrella"},{word:"かに",meaning:"crab"}] },
  { char:"き", romaji:"ki",  type:"hiragana", examples:[{word:"きつね",meaning:"fox"},{word:"き",meaning:"tree"}] },
  { char:"く", romaji:"ku",  type:"hiragana", examples:[{word:"くも",meaning:"cloud"},{word:"くつ",meaning:"shoes"}] },
  { char:"け", romaji:"ke",  type:"hiragana", examples:[{word:"けむり",meaning:"smoke"},{word:"けいさん",meaning:"calc"}] },
  { char:"こ", romaji:"ko",  type:"hiragana", examples:[{word:"こ",meaning:"child"},{word:"こえ",meaning:"voice"}] },
  { char:"さ", romaji:"sa",  type:"hiragana", examples:[{word:"さかな",meaning:"fish"},{word:"さる",meaning:"monkey"}] },
  { char:"し", romaji:"shi", type:"hiragana", examples:[{word:"しか",meaning:"deer"},{word:"しお",meaning:"salt"}] },
  { char:"す", romaji:"su",  type:"hiragana", examples:[{word:"すし",meaning:"sushi"},{word:"すいか",meaning:"watermelon"}] },
  { char:"せ", romaji:"se",  type:"hiragana", examples:[{word:"せかい",meaning:"world"},{word:"せんせい",meaning:"teacher"}] },
  { char:"そ", romaji:"so",  type:"hiragana", examples:[{word:"そら",meaning:"sky"},{word:"そば",meaning:"near"}] },
  { char:"た", romaji:"ta",  type:"hiragana", examples:[{word:"たこ",meaning:"octopus"},{word:"たまご",meaning:"egg"}] },
  { char:"ち", romaji:"chi", type:"hiragana", examples:[{word:"ちず",meaning:"map"},{word:"ちから",meaning:"power"}] },
  { char:"つ", romaji:"tsu", type:"hiragana", examples:[{word:"つき",meaning:"moon"},{word:"つくえ",meaning:"desk"}] },
  { char:"て", romaji:"te",  type:"hiragana", examples:[{word:"て",meaning:"hand"},{word:"てら",meaning:"temple"}] },
  { char:"と", romaji:"to",  type:"hiragana", examples:[{word:"とり",meaning:"bird"},{word:"とけい",meaning:"clock"}] },
  { char:"な", romaji:"na",  type:"hiragana", examples:[{word:"なまえ",meaning:"name"},{word:"なつ",meaning:"summer"}] },
  { char:"に", romaji:"ni",  type:"hiragana", examples:[{word:"にわ",meaning:"garden"},{word:"にほん",meaning:"Japan"}] },
  { char:"ぬ", romaji:"nu",  type:"hiragana", examples:[{word:"ぬの",meaning:"cloth"},{word:"ぬま",meaning:"swamp"}] },
  { char:"ね", romaji:"ne",  type:"hiragana", examples:[{word:"ねこ",meaning:"cat"},{word:"ねむい",meaning:"sleepy"}] },
  { char:"の", romaji:"no",  type:"hiragana", examples:[{word:"のり",meaning:"seaweed"},{word:"のはら",meaning:"field"}] },
  { char:"は", romaji:"ha",  type:"hiragana", examples:[{word:"はな",meaning:"flower"},{word:"はこ",meaning:"box"}] },
  { char:"ひ", romaji:"hi",  type:"hiragana", examples:[{word:"ひ",meaning:"fire"},{word:"ひこうき",meaning:"airplane"}] },
  { char:"ふ", romaji:"fu",  type:"hiragana", examples:[{word:"ふね",meaning:"boat"},{word:"ふゆ",meaning:"winter"}] },
  { char:"へ", romaji:"he",  type:"hiragana", examples:[{word:"へや",meaning:"room"},{word:"へび",meaning:"snake"}] },
  { char:"ほ", romaji:"ho",  type:"hiragana", examples:[{word:"ほし",meaning:"star"},{word:"ほん",meaning:"book"}] },
  { char:"ま", romaji:"ma",  type:"hiragana", examples:[{word:"まど",meaning:"window"},{word:"まち",meaning:"town"}] },
  { char:"み", romaji:"mi",  type:"hiragana", examples:[{word:"みず",meaning:"water"},{word:"みち",meaning:"road"}] },
  { char:"む", romaji:"mu",  type:"hiragana", examples:[{word:"むし",meaning:"insect"},{word:"むすめ",meaning:"daughter"}] },
  { char:"め", romaji:"me",  type:"hiragana", examples:[{word:"め",meaning:"eye"},{word:"めだか",meaning:"killifish"}] },
  { char:"も", romaji:"mo",  type:"hiragana", examples:[{word:"もも",meaning:"peach"},{word:"もり",meaning:"forest"}] },
  { char:"や", romaji:"ya",  type:"hiragana", examples:[{word:"やま",meaning:"mountain"},{word:"やさい",meaning:"vegetable"}] },
  { char:"ゆ", romaji:"yu",  type:"hiragana", examples:[{word:"ゆき",meaning:"snow"},{word:"ゆびわ",meaning:"ring"}] },
  { char:"よ", romaji:"yo",  type:"hiragana", examples:[{word:"よる",meaning:"night"},{word:"よん",meaning:"four"}] },
  { char:"ら", romaji:"ra",  type:"hiragana", examples:[{word:"らいおん",meaning:"lion"},{word:"らく",meaning:"easy"}] },
  { char:"り", romaji:"ri",  type:"hiragana", examples:[{word:"りんご",meaning:"apple"},{word:"りゅう",meaning:"dragon"}] },
  { char:"る", romaji:"ru",  type:"hiragana", examples:[{word:"るす",meaning:"absence"},{word:"るいじ",meaning:"similar"}] },
  { char:"れ", romaji:"re",  type:"hiragana", examples:[{word:"れいぞうこ",meaning:"fridge"},{word:"れんしゅう",meaning:"practice"}] },
  { char:"ろ", romaji:"ro",  type:"hiragana", examples:[{word:"ろうそく",meaning:"candle"},{word:"ろく",meaning:"six"}] },
  { char:"わ", romaji:"wa",  type:"hiragana", examples:[{word:"わに",meaning:"crocodile"},{word:"わたし",meaning:"I/me"}] },
  { char:"を", romaji:"wo",  type:"hiragana", examples:[{word:"〜を",meaning:"(object marker)"}] },
  { char:"ん", romaji:"n",   type:"hiragana", examples:[{word:"ほん",meaning:"book"},{word:"えんぴつ",meaning:"pencil"}] },
];

const KATAKANA: CharCard[] = [
  { char:"ア", romaji:"a",   type:"katakana", examples:[{word:"アイス",meaning:"ice cream"},{word:"アメリカ",meaning:"America"}] },
  { char:"イ", romaji:"i",   type:"katakana", examples:[{word:"イス",meaning:"chair"},{word:"イギリス",meaning:"England"}] },
  { char:"ウ", romaji:"u",   type:"katakana", examples:[{word:"ウサギ",meaning:"rabbit"},{word:"ウイルス",meaning:"virus"}] },
  { char:"エ", romaji:"e",   type:"katakana", examples:[{word:"エレベーター",meaning:"elevator"},{word:"エアコン",meaning:"air con"}] },
  { char:"オ", romaji:"o",   type:"katakana", examples:[{word:"オレンジ",meaning:"orange"},{word:"オーブン",meaning:"oven"}] },
  { char:"カ", romaji:"ka",  type:"katakana", examples:[{word:"カメラ",meaning:"camera"},{word:"カップ",meaning:"cup"}] },
  { char:"キ", romaji:"ki",  type:"katakana", examples:[{word:"キーボード",meaning:"keyboard"},{word:"キャット",meaning:"cat"}] },
  { char:"ク", romaji:"ku",  type:"katakana", examples:[{word:"クラス",meaning:"class"},{word:"クッキー",meaning:"cookie"}] },
  { char:"ケ", romaji:"ke",  type:"katakana", examples:[{word:"ケーキ",meaning:"cake"},{word:"ケータイ",meaning:"mobile"}] },
  { char:"コ", romaji:"ko",  type:"katakana", examples:[{word:"コーヒー",meaning:"coffee"},{word:"コップ",meaning:"cup"}] },
  { char:"サ", romaji:"sa",  type:"katakana", examples:[{word:"サッカー",meaning:"soccer"},{word:"サラダ",meaning:"salad"}] },
  { char:"シ", romaji:"shi", type:"katakana", examples:[{word:"シャツ",meaning:"shirt"},{word:"シール",meaning:"sticker"}] },
  { char:"ス", romaji:"su",  type:"katakana", examples:[{word:"スポーツ",meaning:"sports"},{word:"スマホ",meaning:"smartphone"}] },
  { char:"セ", romaji:"se",  type:"katakana", examples:[{word:"セーター",meaning:"sweater"},{word:"センター",meaning:"center"}] },
  { char:"ソ", romaji:"so",  type:"katakana", examples:[{word:"ソファ",meaning:"sofa"},{word:"ソース",meaning:"sauce"}] },
  { char:"タ", romaji:"ta",  type:"katakana", examples:[{word:"タクシー",meaning:"taxi"},{word:"タオル",meaning:"towel"}] },
  { char:"チ", romaji:"chi", type:"katakana", examples:[{word:"チーズ",meaning:"cheese"},{word:"チョコ",meaning:"choco"}] },
  { char:"ツ", romaji:"tsu", type:"katakana", examples:[{word:"ツアー",meaning:"tour"},{word:"ツナ",meaning:"tuna"}] },
  { char:"テ", romaji:"te",  type:"katakana", examples:[{word:"テレビ",meaning:"TV"},{word:"テスト",meaning:"test"}] },
  { char:"ト", romaji:"to",  type:"katakana", examples:[{word:"トイレ",meaning:"toilet"},{word:"トマト",meaning:"tomato"}] },
  { char:"ナ", romaji:"na",  type:"katakana", examples:[{word:"ナイフ",meaning:"knife"},{word:"ナンバー",meaning:"number"}] },
  { char:"ニ", romaji:"ni",  type:"katakana", examples:[{word:"ニュース",meaning:"news"},{word:"ニンジャ",meaning:"ninja"}] },
  { char:"ヌ", romaji:"nu",  type:"katakana", examples:[{word:"ヌードル",meaning:"noodle"}] },
  { char:"ネ", romaji:"ne",  type:"katakana", examples:[{word:"ネコ",meaning:"cat"},{word:"ネクタイ",meaning:"necktie"}] },
  { char:"ノ", romaji:"no",  type:"katakana", examples:[{word:"ノート",meaning:"notebook"},{word:"ノック",meaning:"knock"}] },
  { char:"ハ", romaji:"ha",  type:"katakana", examples:[{word:"ハンバーガー",meaning:"hamburger"},{word:"ハット",meaning:"hat"}] },
  { char:"ヒ", romaji:"hi",  type:"katakana", examples:[{word:"ヒーロー",meaning:"hero"},{word:"ヒント",meaning:"hint"}] },
  { char:"フ", romaji:"fu",  type:"katakana", examples:[{word:"フルーツ",meaning:"fruit"},{word:"フォーク",meaning:"fork"}] },
  { char:"ヘ", romaji:"he",  type:"katakana", examples:[{word:"ヘルメット",meaning:"helmet"},{word:"ヘリ",meaning:"helicopter"}] },
  { char:"ホ", romaji:"ho",  type:"katakana", examples:[{word:"ホテル",meaning:"hotel"},{word:"ホットドッグ",meaning:"hot dog"}] },
  { char:"マ", romaji:"ma",  type:"katakana", examples:[{word:"マップ",meaning:"map"},{word:"マスク",meaning:"mask"}] },
  { char:"ミ", romaji:"mi",  type:"katakana", examples:[{word:"ミルク",meaning:"milk"},{word:"ミュージック",meaning:"music"}] },
  { char:"ム", romaji:"mu",  type:"katakana", examples:[{word:"ムービー",meaning:"movie"},{word:"ムード",meaning:"mood"}] },
  { char:"メ", romaji:"me",  type:"katakana", examples:[{word:"メール",meaning:"email"},{word:"メニュー",meaning:"menu"}] },
  { char:"モ", romaji:"mo",  type:"katakana", examples:[{word:"モデル",meaning:"model"},{word:"モンスター",meaning:"monster"}] },
  { char:"ヤ", romaji:"ya",  type:"katakana", examples:[{word:"ヤング",meaning:"young"},{word:"ヤード",meaning:"yard"}] },
  { char:"ユ", romaji:"yu",  type:"katakana", examples:[{word:"ユニフォーム",meaning:"uniform"},{word:"ユーモア",meaning:"humor"}] },
  { char:"ヨ", romaji:"yo",  type:"katakana", examples:[{word:"ヨーグルト",meaning:"yogurt"},{word:"ヨット",meaning:"yacht"}] },
  { char:"ラ", romaji:"ra",  type:"katakana", examples:[{word:"ラーメン",meaning:"ramen"},{word:"ライオン",meaning:"lion"}] },
  { char:"リ", romaji:"ri",  type:"katakana", examples:[{word:"リンゴ",meaning:"apple"},{word:"リモコン",meaning:"remote"}] },
  { char:"ル", romaji:"ru",  type:"katakana", examples:[{word:"ルール",meaning:"rule"},{word:"ルーム",meaning:"room"}] },
  { char:"レ", romaji:"re",  type:"katakana", examples:[{word:"レストラン",meaning:"restaurant"},{word:"レモン",meaning:"lemon"}] },
  { char:"ロ", romaji:"ro",  type:"katakana", examples:[{word:"ロボット",meaning:"robot"},{word:"ロック",meaning:"rock"}] },
  { char:"ワ", romaji:"wa",  type:"katakana", examples:[{word:"ワイン",meaning:"wine"},{word:"ワールド",meaning:"world"}] },
  { char:"ヲ", romaji:"wo",  type:"katakana", examples:[{word:"〜ヲ",meaning:"(object marker)"}] },
  { char:"ン", romaji:"n",   type:"katakana", examples:[{word:"パン",meaning:"bread"},{word:"ラーメン",meaning:"ramen"}] },
];

type Phase = "select" | "exam" | "roundResult" | "done";
type Category = "hiragana" | "katakana" | "both";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Select screen ─────────────────────────────────────────────────────────────
function SelectScreen({ onStart }: { onStart: (cat: Category) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <div className="text-6xl mb-3">📝</div>
        <h1 className="text-4xl font-black text-white mb-1">もじ テスト</h1>
        <p className="text-white/60 text-sm">Swipe right = know it ✓　Swipe left = not yet ✗</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => onStart("hiragana")}
          className="w-full py-5 rounded-3xl font-black text-2xl text-white transition-all active:scale-95 shadow-xl"
          style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
        >
          ひらがな
          <p className="text-sm font-bold opacity-80 mt-1">Hiragana · 46 chars</p>
        </button>
        <button
          onClick={() => onStart("katakana")}
          className="w-full py-5 rounded-3xl font-black text-2xl text-white transition-all active:scale-95 shadow-xl"
          style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
        >
          カタカナ
          <p className="text-sm font-bold opacity-80 mt-1">Katakana · 46 chars</p>
        </button>
        <button
          onClick={() => onStart("both")}
          className="w-full py-5 rounded-3xl font-black text-xl text-white transition-all active:scale-95 shadow-xl"
          style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}
        >
          ひらがな + カタカナ
          <p className="text-sm font-bold opacity-80 mt-1">Both · 92 chars</p>
        </button>
      </div>
    </div>
  );
}

// ── Exam card ─────────────────────────────────────────────────────────────────
function ExamScreen({
  deck,
  currentIndex,
  round,
  onSwipe,
}: {
  deck: CharCard[];
  currentIndex: number;
  round: number;
  onSwipe: (dir: "left" | "right") => void;
}) {
  const { speak } = useSpeech();
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [flyDir, setFlyDir] = useState<"left" | "right" | null>(null);
  const isDragging = useRef(false);
  const dragXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const card = deck[currentIndex];
  const progress = currentIndex / deck.length;

  const triggerSwipe = (dir: "left" | "right") => {
    setFlyDir(dir);
    setTimeout(() => {
      setFlyDir(null);
      setDragX(0);
      dragXRef.current = 0;
      onSwipe(dir);
    }, 280);
  };

  // Non-passive touch listeners so preventDefault() actually works
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      isDragging.current = true;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault(); // works because listener is non-passive
        dragXRef.current = dx;
        setDragX(dx);
      }
    };
    const handleTouchEnd = () => {
      isDragging.current = false;
      if (Math.abs(dragXRef.current) > 70) {
        triggerSwipe(dragXRef.current > 0 ? "right" : "left");
      } else {
        setDragX(0);
        dragXRef.current = 0;
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card]);

  const rotation = flyDir
    ? (flyDir === "right" ? 25 : -25)
    : (dragX / 10);
  const translateX = flyDir
    ? (flyDir === "right" ? 600 : -600)
    : dragX;
  const cardOpacity = flyDir ? 0 : 1;

  const knowOpacity = Math.min(1, Math.max(0, dragX / 100));
  const dontOpacity = Math.min(1, Math.max(0, -dragX / 100));

  return (
    <div className="flex flex-col px-4 pt-6 pb-4 select-none overflow-hidden"
      style={{ height: "100dvh" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-white font-black text-lg">
            {round === 1 ? "ラウンド 1" : "ラウンド 2 🔁"}
          </span>
          <span className="text-white/50 text-xs">
            {currentIndex + 1} / {deck.length}
          </span>
        </div>
        <button
          onClick={() => speak(card.char)}
          className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl active:scale-90"
        >
          🔊
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress * 100}%`,
            background: round === 1
              ? "linear-gradient(90deg, #f97316, #ec4899)"
              : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          }}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Know / Don't know overlays */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-3xl"
          style={{ opacity: knowOpacity, background: "rgba(34,197,94,0.15)" }}
        >
          <span className="text-green-400 font-black text-3xl border-4 border-green-400 px-6 py-2 rounded-2xl rotate-[-20deg]">
            しってる ✓
          </span>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 rounded-3xl"
          style={{ opacity: dontOpacity, background: "rgba(239,68,68,0.15)" }}
        >
          <span className="text-red-400 font-black text-3xl border-4 border-red-400 px-6 py-2 rounded-2xl rotate-[20deg]">
            まだ ✗
          </span>
        </div>

        {/* The card */}
        <div
          ref={cardRef}
          className="w-full max-w-xs"
          style={{
            transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
            opacity: cardOpacity,
            transition: flyDir ? "transform 0.28s ease-out, opacity 0.28s ease-out" : "none",
            touchAction: "pan-y",
          }}
        >
          <div
            className="rounded-3xl flex flex-col items-center justify-center py-12 px-8 shadow-2xl"
            style={{
              background: card.type === "hiragana"
                ? "linear-gradient(135deg, rgba(249,115,22,0.25), rgba(236,72,153,0.25))"
                : "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))",
              border: `2px solid ${card.type === "hiragana" ? "rgba(249,115,22,0.4)" : "rgba(139,92,246,0.4)"}`,
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Type badge */}
            <span className={`text-xs font-black uppercase tracking-widest mb-6 px-3 py-1 rounded-full ${
              card.type === "hiragana"
                ? "bg-orange-500/20 text-orange-300"
                : "bg-violet-500/20 text-violet-300"
            }`}>
              {card.type === "hiragana" ? "ひらがな" : "カタカナ"}
            </span>

            {/* Big character */}
            <span className="text-[120px] leading-none font-black text-white mb-6"
              style={{ textShadow: "0 4px 30px rgba(255,255,255,0.2)" }}>
              {card.char}
            </span>

            {/* Speak button */}
            <button
              onClick={(e) => { e.stopPropagation(); speak(card.char); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm active:scale-90 transition-transform"
              style={{
                background: card.type === "hiragana"
                  ? "rgba(249,115,22,0.25)"
                  : "rgba(139,92,246,0.25)",
                border: `1px solid ${card.type === "hiragana" ? "rgba(249,115,22,0.5)" : "rgba(139,92,246,0.5)"}`,
                color: card.type === "hiragana" ? "#fb923c" : "#c084fc",
              }}
            >
              🔊 きく
            </button>
          </div>
        </div>
      </div>

      {/* Swipe hint + buttons */}
      <div className="mt-6 flex flex-col items-center gap-4">
        <p className="text-white/30 text-xs">← まだ　｜　しってる →</p>
        <div className="flex gap-6">
          <button
            onClick={() => triggerSwipe("left")}
            className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400/50 text-red-400 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform"
          >
            ✗
          </button>
          <button
            onClick={() => triggerSwipe("right")}
            className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/50 text-green-400 text-2xl font-black flex items-center justify-center active:scale-90 transition-transform"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Round result screen ───────────────────────────────────────────────────────
function RoundResultScreen({
  round,
  known,
  unknown,
  onNextRound,
  onFinish,
}: {
  round: number;
  known: CharCard[];
  unknown: CharCard[];
  onNextRound: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-12 pb-28 gap-6">
      <div className="text-center">
        <div className="text-5xl mb-3">{round === 1 ? "🎯" : "🎊"}</div>
        <h2 className="text-3xl font-black text-white mb-1">
          ラウンド {round} おわり！
        </h2>
        <p className="text-white/50 text-sm">Round {round} complete</p>
      </div>

      {/* Score */}
      <div className="flex gap-4 w-full max-w-xs">
        <div className="flex-1 rounded-2xl py-5 text-center"
          style={{ background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)" }}>
          <div className="text-4xl font-black text-green-400">{known.length}</div>
          <div className="text-xs font-bold text-green-400/70 mt-1">しってる ✓</div>
        </div>
        <div className="flex-1 rounded-2xl py-5 text-center"
          style={{ background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.3)" }}>
          <div className="text-4xl font-black text-red-400">{unknown.length}</div>
          <div className="text-xs font-bold text-red-400/70 mt-1">まだ ✗</div>
        </div>
      </div>

      {/* Unknown chars preview */}
      {unknown.length > 0 && (
        <div className="w-full max-w-xs">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wide mb-3 text-center">
            もういちど れんしゅう
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {unknown.map((c) => (
              <span key={c.char}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black text-white"
                style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
                {c.char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-auto">
        {round === 1 && unknown.length > 0 && (
          <button
            onClick={onNextRound}
            className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 shadow-lg"
            style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
          >
            🔁 まだのもじ を れんしゅう
          </button>
        )}
        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 shadow-lg"
          style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}
        >
          📊 けっか を みる
        </button>
      </div>
    </div>
  );
}

// ── Done / Results screen ─────────────────────────────────────────────────────
function DoneScreen({
  round1Unknown,
  finalUnknown,
  totalCards,
  onRestart,
}: {
  round1Unknown: CharCard[];
  finalUnknown: CharCard[];
  totalCards: number;
  onRestart: () => void;
}) {
  const { speak } = useSpeech();
  const score = totalCards - finalUnknown.length;
  const pct = Math.round((score / totalCards) * 100);

  return (
    <div className="min-h-screen flex flex-col px-4 pt-10 pb-28 gap-6">
      {/* Score banner */}
      <div className="rounded-3xl p-6 text-center"
        style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.2))", border: "2px solid rgba(16,185,129,0.3)" }}>
        <div className="text-6xl mb-2">{pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : pct >= 50 ? "💪" : "📚"}</div>
        <p className="text-5xl font-black text-white">{pct}%</p>
        <p className="text-white/60 text-sm mt-1">{score} / {totalCards} もじ</p>
        <p className="text-white/40 text-xs mt-1">
          {pct >= 90 ? "すごい！かんぺき！" : pct >= 70 ? "よくできました！" : pct >= 50 ? "がんばって！" : "もっとれんしゅうしよう！"}
        </p>
      </div>

      {/* Still unknown — with examples */}
      {finalUnknown.length > 0 && (
        <div>
          <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-3 text-center">
            まだ おぼえていない もじ
          </p>
          <div className="flex flex-col gap-3">
            {finalUnknown.map((c) => (
              <div key={c.char}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                {/* Character */}
                <button
                  onClick={() => speak(c.char)}
                  className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl font-black text-white active:scale-90"
                  style={{
                    background: c.type === "hiragana"
                      ? "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(236,72,153,0.3))"
                      : "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))",
                  }}>
                  {c.char}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-black text-lg">{c.romaji}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      c.type === "hiragana" ? "bg-orange-500/20 text-orange-300" : "bg-violet-500/20 text-violet-300"
                    }`}>
                      {c.type === "hiragana" ? "ひらがな" : "カタカナ"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => speak(ex.word)}
                        className="text-xs rounded-xl px-2 py-1 active:scale-95"
                        style={{ background: "rgba(255,255,255,0.1)" }}>
                        <span className="text-white font-bold">{ex.word}</span>
                        <span className="text-white/50 ml-1">{ex.meaning}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {finalUnknown.length === 0 && (
        <div className="text-center py-8">
          <div className="text-6xl mb-3">🎉</div>
          <p className="text-2xl font-black text-green-400">ぜんぶ しってる！</p>
          <p className="text-white/50 text-sm">You know them all!</p>
        </div>
      )}

      <button
        onClick={onRestart}
        className="w-full py-4 rounded-2xl font-black text-white text-lg active:scale-95 mt-2"
        style={{ background: "linear-gradient(135deg, #f97316, #ec4899)" }}
      >
        🔄 もういちど
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ExamPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [round, setRound] = useState(1);
  const [deck, setDeck] = useState<CharCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState<CharCard[]>([]);
  const [unknown, setUnknown] = useState<CharCard[]>([]);
  const [round1Unknown, setRound1Unknown] = useState<CharCard[]>([]);
  const [totalCards, setTotalCards] = useState(0);

  const startExam = (cat: Category) => {
    const base = cat === "hiragana" ? HIRAGANA : cat === "katakana" ? KATAKANA : [...HIRAGANA, ...KATAKANA];
    const cards = shuffle(base);
    setDeck(cards);
    setTotalCards(cards.length);
    setCurrentIndex(0);
    setKnown([]);
    setUnknown([]);
    setRound1Unknown([]);
    setRound(1);
    setPhase("exam");
  };

  const handleSwipe = (dir: "left" | "right") => {
    const card = deck[currentIndex];
    const newKnown = dir === "right" ? [...known, card] : known;
    const newUnknown = dir === "left" ? [...unknown, card] : unknown;
    setKnown(newKnown);
    setUnknown(newUnknown);

    if (currentIndex + 1 >= deck.length) {
      if (round === 1) setRound1Unknown(newUnknown);
      setKnown(newKnown);
      setUnknown(newUnknown);
      setPhase("roundResult");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const startRound2 = () => {
    const cards = shuffle(unknown);
    setDeck(cards);
    setCurrentIndex(0);
    setKnown([]);
    setUnknown([]);
    setRound(2);
    setPhase("exam");
  };

  const goToResults = () => setPhase("done");

  const restart = () => {
    setPhase("select");
    setKnown([]);
    setUnknown([]);
    setRound1Unknown([]);
    setCurrentIndex(0);
  };

  if (phase === "select") return <SelectScreen onStart={startExam} />;

  if (phase === "exam") return (
    <ExamScreen
      deck={deck}
      currentIndex={currentIndex}
      round={round}
      onSwipe={handleSwipe}
    />
  );

  if (phase === "roundResult") return (
    <RoundResultScreen
      round={round}
      known={known}
      unknown={unknown}
      onNextRound={startRound2}
      onFinish={goToResults}
    />
  );

  return (
    <DoneScreen
      round1Unknown={round1Unknown}
      finalUnknown={unknown}
      totalCards={totalCards}
      onRestart={restart}
    />
  );
}
