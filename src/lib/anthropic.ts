import Anthropic from "@anthropic-ai/sdk";

// Shared Anthropic client for the app's AI features (first one: English AI Tutor).
// Reads ANTHROPIC_API_KEY from the environment automatically.
export const anthropic = new Anthropic();

// Model used by the tutor. Swap in one place.
// `claude-opus-4-8` is the default; `claude-haiku-4-5` is ~5x cheaper and a fine
// fit for this short, high-frequency feedback task if cost matters.
export const TUTOR_MODEL = "claude-opus-4-8";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
