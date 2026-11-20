#!/usr/bin/env node
// Lists driving-test image prompts that have no image yet.
//
// A prompt `<item>-<no>` (from src/data/driving_test_image_prompts.md) counts as
// DONE when either
//   • geminiImages/<item>-<no>.jpeg exists locally (generated, not yet uploaded), or
//   • https://<bucket>/driving-test/<item>-<no>.jpeg answers HTTP 200 (already on S3).
// Everything else is MISSING and is printed with its prompt, in book order.
//
// Usage:
//   node scripts/driving-missing-images.mjs            # summary + missing list
//   node scripts/driving-missing-images.mjs --json     # machine-readable
//   node scripts/driving-missing-images.mjs --limit 20 # only the first 20 missing
//   node scripts/driving-missing-images.mjs --offline  # skip the S3 check (local files only)
//
// Optional env: DRIVING_IMAGE_BASE (default: the project's S3 folder URL).

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS = join(root, "src/data/driving_test_image_prompts.md");
const LOCAL_DIR = join(root, "geminiImages");
const BASE = (process.env.DRIVING_IMAGE_BASE ?? "https://aktstore-cdn.s3.ap-southeast-1.amazonaws.com/driving-test").replace(/\/$/, "");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const offline = args.includes("--offline");
const limitIdx = args.indexOf("--limit");
const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;

// "*   **2-14:** Illustration of ... --ar 16:9"
const LINE = /^\*\s+\*\*(\d+)-(\d+):\*\*\s+(.+?)\s*$/;
const items = [];
for (const line of readFileSync(PROMPTS, "utf8").split("\n")) {
  const m = line.match(LINE);
  if (!m) continue;
  items.push({
    id: `${m[1]}-${m[2]}`,
    item: Number(m[1]),
    no: Number(m[2]),
    prompt: m[3].replace(/\s*--ar\s+\S+\s*$/, "").trim(),
  });
}
items.sort((a, b) => a.item - b.item || a.no - b.no);

const dupes = items.filter((x, i) => items.findIndex((y) => y.id === x.id) !== i).map((x) => x.id);

async function onS3(id) {
  try {
    const r = await fetch(`${BASE}/${id}.jpeg`, { method: "HEAD" });
    return r.status === 200;
  } catch {
    return false;
  }
}

async function status(x) {
  if (existsSync(join(LOCAL_DIR, `${x.id}.jpeg`))) return "local";
  if (!offline && (await onS3(x.id))) return "s3";
  return "missing";
}

// Check in small batches so we don't hammer S3.
const results = [];
for (let i = 0; i < items.length; i += 10) {
  const batch = items.slice(i, i + 10);
  const st = await Promise.all(batch.map(status));
  batch.forEach((x, j) => results.push({ ...x, status: st[j] }));
}

const missing = results.filter((x) => x.status === "missing");
const perItem = new Map();
for (const r of results) {
  const e = perItem.get(r.item) ?? { total: 0, local: 0, s3: 0, missing: 0 };
  e.total++;
  e[r.status]++;
  perItem.set(r.item, e);
}

if (asJson) {
  console.log(
    JSON.stringify(
      {
        base: BASE,
        offline,
        duplicates: dupes,
        perItem: Object.fromEntries(perItem),
        missing: missing.slice(0, limit).map(({ id, prompt }) => ({ id, file: `geminiImages/${id}.jpeg`, prompt })),
      },
      null,
      2,
    ),
  );
} else {
  console.log(`Prompts: ${results.length} · done: ${results.length - missing.length} · missing: ${missing.length}${offline ? " (offline: S3 not checked)" : ""}`);
  if (dupes.length) console.log(`WARNING duplicate prompt ids: ${dupes.join(", ")}`);
  console.log("\nitem  total  on-S3  local  missing");
  for (const [item, e] of [...perItem].sort((a, b) => a[0] - b[0])) {
    console.log(`${String(item).padEnd(5)} ${String(e.total).padEnd(6)} ${String(e.s3).padEnd(6)} ${String(e.local).padEnd(6)} ${e.missing}`);
  }
  console.log(`\nMissing (first ${Math.min(limit, missing.length)}):`);
  for (const x of missing.slice(0, limit)) console.log(`${x.id}\t${x.prompt}`);
}
