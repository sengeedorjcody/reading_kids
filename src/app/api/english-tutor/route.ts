import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { anthropic, TUTOR_MODEL, hasAnthropicKey } from "@/lib/anthropic";

// Structured shape the child's UI renders directly (stars, highlighted words, tips).
const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    stars: { type: "integer", enum: [0, 1, 2, 3] },
    heardCorrectly: { type: "boolean" },
    misheardWords: {
      type: "array",
      items: { type: "string" },
      description: "Words from the target the child likely did not say correctly. Empty if perfect.",
    },
    feedback: {
      type: "string",
      description: "One short, warm sentence in simple English for a young child.",
    },
    tip: {
      type: "string",
      description: "One tiny pronunciation tip in simple English, or empty string if none needed.",
    },
    encouragement: {
      type: "string",
      description: "A short cheerful phrase, e.g. 'Great job!' or 'Try again!'.",
    },
  },
  required: ["stars", "heardCorrectly", "misheardWords", "feedback", "tip", "encouragement"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are a friendly, patient English pronunciation coach for a young Mongolian child (about 5 to 8 years old).

The child is practicing saying an English phrase out loud. You are given:
- TARGET: the exact phrase they were asked to say.
- HEARD: what the browser's speech recognizer thinks they said (it can be imperfect).
- CONFIDENCE: the recognizer's confidence from 0 to 1 (may be missing).

Judge how close HEARD is to TARGET and score it:
- 3 stars: essentially correct (ignore capitalization, punctuation, and tiny recognizer slips).
- 2 stars: mostly right, one small word off.
- 1 star: attempted but several words wrong.
- 0 stars: empty, unrelated, or clearly not the phrase.

Rules for your reply:
- Speak in simple, warm English (immersion). Only use a Mongolian word if the child scored 0 and seems stuck.
- Keep "feedback" to ONE short sentence a small child understands.
- Put any words they missed into "misheardWords" (words taken from TARGET). Empty if perfect.
- "tip" is ONE tiny, concrete pronunciation hint (e.g. the "th" sound) — or "" if not needed.
- Always be encouraging. Never scold.
- Low CONFIDENCE alone is not a mistake — the mic may be poor; focus on whether HEARD matches TARGET.`;

export async function POST(req: NextRequest) {
  if (!hasAnthropicKey()) {
    return NextResponse.json(
      { error: "no_key", message: "The tutor is not set up yet. Please add an ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  let body: { target?: unknown; transcript?: unknown; confidence?: unknown; level?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const target = typeof body.target === "string" ? body.target.trim() : "";
  const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
  const confidence =
    typeof body.confidence === "number" && isFinite(body.confidence) ? body.confidence : null;
  const level = typeof body.level === "number" ? body.level : 0;

  if (!target) {
    return NextResponse.json({ error: "missing_target" }, { status: 400 });
  }

  const userContent = [
    `TARGET: ${target}`,
    `HEARD: ${transcript || "(nothing / could not hear)"}`,
    `CONFIDENCE: ${confidence === null ? "unknown" : confidence.toFixed(2)}`,
    `LEVEL: ${level}`,
  ].join("\n");

  try {
    const message = await anthropic.messages.parse({
      model: TUTOR_MODEL,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      output_config: { format: jsonSchemaOutputFormat(OUTPUT_SCHEMA) },
      messages: [{ role: "user", content: userContent }],
    });

    if (!message.parsed_output) {
      return NextResponse.json({ error: "parse_failed" }, { status: 502 });
    }
    return NextResponse.json(message.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "auth", message: "The tutor's API key is invalid." },
        { status: 503 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "rate_limit", message: "The tutor is busy. Please try again in a moment." },
        { status: 429 },
      );
    }
    console.error("[english-tutor] Claude error:", err);
    return NextResponse.json(
      { error: "api", message: "The tutor had a hiccup. Please try again." },
      { status: 502 },
    );
  }
}
