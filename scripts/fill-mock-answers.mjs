#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DRAFTS_DIR = join(root, "src/data/driving/drafts");
const DEFAULT_OUT_DIR = join(root, "src/data/driving");

function printHelp() {
  console.log(`Usage:
  node scripts/fill-mock-answers.mjs <answers.json> [--drafts-dir <dir>] [--out-dir <dir>]

Reads an answers JSON file shaped like:
  {
    "301": { "1": true, "2": false, ... },
    "401": { "1": true, ..., "91": [true, false, true], ... }
  }
  (○ = true, × = false; for hazard questions, provide [①, ②, ③] booleans.)

For each set ID present in <answers.json>:
  1. Loads the matching draft JSON from --drafts-dir (default: src/data/driving/drafts).
  2. Checks that every question and hazard statement has a boolean answer.
     Refuses and lists missing items if any answer would still be null.
  3. Writes the filled answers back into the draft JSON file.
  4. Generates <out-dir>/item<id>.ts (default: src/data/driving/item<id>.ts)
     in the same format as src/data/driving/item201.ts.
  5. Prints the lines to add to src/data/drivingTest.ts (does NOT edit drivingTest.ts).

Options:
  -h, --help            Show this help message
  --drafts-dir <dir>    Directory containing draft JSON files
  --out-dir <dir>       Directory where item<id>.ts files will be written`);
}

function parseArgs(argv) {
  let answersPath = null;
  let draftsDir = DEFAULT_DRAFTS_DIR;
  let outDir = DEFAULT_OUT_DIR;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") {
      printHelp();
      process.exit(0);
    } else if (a === "--drafts-dir") {
      draftsDir = resolve(argv[++i]);
    } else if (a === "--out-dir") {
      outDir = resolve(argv[++i]);
    } else if (!a.startsWith("-") && !answersPath) {
      answersPath = resolve(a);
    } else {
      console.error(`Unknown argument: ${a}`);
      printHelp();
      process.exit(1);
    }
  }

  if (!answersPath) {
    console.error("Error: missing <answers.json> path.\n");
    printHelp();
    process.exit(1);
  }

  return { answersPath, draftsDir, outDir };
}

function generateItemTs(draft) {
  const figureNos = draft.questions
    .filter((q) => q.figure !== null && q.figure !== undefined)
    .map((q) => q.no);

  const lines = [
    `import type { Row, Note } from "../drivingTest";`,
    ``,
    `// ${draft.ja}`,
    `export const FIGURE_NOS: number[] = [${figureNos.join(", ")}];`,
    ``,
    `export const ROWS: Row[] = [`,
    ...draft.questions.map(
      (q) =>
        `  [${q.no}, ${JSON.stringify(q.ja)}, ${JSON.stringify(q.mn)}, ${q.answer}],`
    ),
    `];`,
    ``,
    `export const NOTES: Note[] = [];`,
    ``,
    `export const EN: string[] = [`,
    ...draft.questions.map((q) => `  ${JSON.stringify(q.en)},`),
    `];`,
    ``,
    `export const NOTES_EN: string[] = [];`,
    ``,
  ];

  return lines.join("\n");
}

function main() {
  const { answersPath, draftsDir, outDir } = parseArgs(process.argv.slice(2));
  const answersData = JSON.parse(readFileSync(answersPath, "utf8"));

  // Index draft files by set id
  const draftFiles = new Map();
  for (const name of readdirSync(draftsDir)) {
    if (!name.endsWith(".json")) continue;
    const fullPath = join(draftsDir, name);
    const parsed = JSON.parse(readFileSync(fullPath, "utf8"));
    if (parsed && typeof parsed.id === "number") {
      draftFiles.set(String(parsed.id), { path: fullPath, data: parsed });
    }
  }

  const setIds = Object.keys(answersData);
  if (setIds.length === 0) {
    console.error("Error: answers file contains no set IDs.");
    process.exit(1);
  }

  let hadError = false;
  const snippets = { items: [], imports: [], builds: [] };

  for (const setId of setIds) {
    const entry = draftFiles.get(setId);
    if (!entry) {
      console.error(`Error: no draft JSON found for set ID "${setId}" in ${draftsDir}`);
      hadError = true;
      continue;
    }

    const setAnswers = answersData[setId];
    const draft = structuredClone(entry.data);
    const missing = [];

    for (const q of draft.questions) {
      const key = String(q.no);
      if (Object.prototype.hasOwnProperty.call(setAnswers, key)) {
        const val = setAnswers[key];
        if (typeof val !== "boolean") {
          missing.push(`Q${q.no} (expected boolean, got ${typeof val})`);
        } else {
          q.answer = val;
        }
      }
      if (typeof q.answer !== "boolean") {
        missing.push(`Q${q.no}`);
      }
    }

    if (Array.isArray(draft.hazard)) {
      const circleNums = ["①", "②", "③"];
      for (const h of draft.hazard) {
        const key = String(h.no);
        if (Object.prototype.hasOwnProperty.call(setAnswers, key)) {
          const arr = setAnswers[key];
          if (!Array.isArray(arr) || arr.length !== h.statements.length) {
            missing.push(`hazard Q${h.no} (expected array of ${h.statements.length} booleans)`);
          } else {
            h.statements.forEach((st, idx) => {
              if (typeof arr[idx] === "boolean") {
                st.answer = arr[idx];
              }
            });
          }
        }
        h.statements.forEach((st, idx) => {
          if (typeof st.answer !== "boolean") {
            missing.push(`hazard Q${h.no}${circleNums[idx] ?? `[${idx}]`}`);
          }
        });
      }
    }

    if (missing.length > 0) {
      console.error(`Refusing set ${setId} (${draft.ja}) — missing answers: ${missing.join(", ")}`);
      hadError = true;
      continue;
    }

    // Write updated draft JSON and generated item<id>.ts
    writeFileSync(entry.path, JSON.stringify(draft, null, 2) + "\n", "utf8");
    mkdirSync(outDir, { recursive: true });
    const outFile = join(outDir, `item${draft.id}.ts`);
    writeFileSync(outFile, generateItemTs(draft), "utf8");
    console.log(`Updated ${entry.path}`);
    console.log(`Generated ${outFile} (${draft.questions.length} questions)`);
    if (Array.isArray(draft.hazard)) {
      console.log(`  (Also saved ${draft.hazard.length} completed hazard questions in ${entry.path})`);
    }

    const stage = draft.kind === "仮免" ? 1 : 2;
    snippets.items.push(
      `  { id: ${draft.id}, stage: ${stage}, num: 0, ja: ${JSON.stringify(draft.ja)}, mn: ${JSON.stringify(draft.mn)}, en: ${JSON.stringify(draft.en)} },`
    );
    snippets.imports.push(`import * as item${draft.id} from "./driving/item${draft.id}";`);
    snippets.builds.push(
      `  ...build(${draft.id}, item${draft.id}.ROWS, item${draft.id}.NOTES, item${draft.id}.EN, item${draft.id}.NOTES_EN, item${draft.id}.FIGURE_NOS),`
    );
  }

  if (snippets.items.length > 0) {
    console.log(`\n// ── Add to src/data/drivingTest.ts ─────────────────────────────`);
    console.log(`// In ITEMS:`);
    snippets.items.forEach((l) => console.log(l));
    console.log(`\n// In imports:`);
    snippets.imports.forEach((l) => console.log(l));
    console.log(`\n// In QUESTIONS:`);
    snippets.builds.forEach((l) => console.log(l));
  }

  if (hadError) {
    process.exit(1);
  }
}

main();
