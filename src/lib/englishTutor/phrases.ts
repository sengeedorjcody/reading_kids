// Leveled phrase bank for the English AI Tutor (speaking & pronunciation coach).
// Content is curated so it stays age-appropriate and we don't spend tokens
// generating phrases — Claude's job is scoped to evaluating what the child said.

export interface Phrase {
  text: string;   // what the child should say
  emoji: string;  // a friendly visual cue
}

export interface Level {
  name: string;   // shown to the child
  phrases: Phrase[];
}

// Level 1 — single words (seeded from the existing /english word lists).
const WORDS: Phrase[] = [
  { text: "Dog", emoji: "🐶" },
  { text: "Cat", emoji: "🐱" },
  { text: "Fish", emoji: "🐟" },
  { text: "Bird", emoji: "🐦" },
  { text: "Bear", emoji: "🐻" },
  { text: "Apple", emoji: "🍎" },
  { text: "Banana", emoji: "🍌" },
  { text: "Milk", emoji: "🥛" },
  { text: "Cake", emoji: "🍰" },
  { text: "Red", emoji: "🔴" },
  { text: "Blue", emoji: "🔵" },
  { text: "Green", emoji: "🟢" },
  { text: "Sun", emoji: "☀️" },
  { text: "Moon", emoji: "🌙" },
  { text: "Star", emoji: "⭐" },
  { text: "Car", emoji: "🚗" },
  { text: "House", emoji: "🏠" },
  { text: "Book", emoji: "📖" },
];

// Level 2 — short everyday phrases.
const PHRASES: Phrase[] = [
  { text: "Hello!", emoji: "👋" },
  { text: "Good morning", emoji: "🌅" },
  { text: "Thank you", emoji: "🙏" },
  { text: "How are you?", emoji: "🙂" },
  { text: "I am happy", emoji: "😄" },
  { text: "See you later", emoji: "👋" },
  { text: "My name is...", emoji: "🧒" },
  { text: "Nice to meet you", emoji: "🤝" },
  { text: "I am hungry", emoji: "🍽️" },
  { text: "Let's play", emoji: "🧸" },
];

// Level 3 — short sentences.
const SENTENCES: Phrase[] = [
  { text: "I like apples", emoji: "🍎" },
  { text: "The cat is big", emoji: "🐱" },
  { text: "I can run fast", emoji: "🏃" },
  { text: "The sky is blue", emoji: "🌤️" },
  { text: "I love my family", emoji: "👨‍👩‍👧" },
  { text: "The dog is happy", emoji: "🐶" },
  { text: "I want some water", emoji: "💧" },
  { text: "We go to school", emoji: "🏫" },
];

export const LEVELS: Level[] = [
  { name: "Words", phrases: WORDS },
  { name: "Phrases", phrases: PHRASES },
  { name: "Sentences", phrases: SENTENCES },
];

// Correct answers in a row before leveling up.
export const CORRECT_TO_LEVEL_UP = 4;
