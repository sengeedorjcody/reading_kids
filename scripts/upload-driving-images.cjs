#!/usr/bin/env node
// Uploads every geminiImages/<item>-<no>.jpeg to S3 as driving-test/<item>-<no>.jpeg.
//
//   node --env-file=.env scripts/upload-driving-images.cjs            # upload + verify (HTTP 200)
//   node --env-file=.env scripts/upload-driving-images.cjs --delete   # also delete local files that verified OK
//   node --env-file=.env scripts/upload-driving-images.cjs --dry-run  # only list what would be uploaded
//
// Needs AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME in .env.
// Prints the uploaded ids as JSON on the last line (for updating IMAGE_NOS).

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { readFileSync, readdirSync, unlinkSync } = require("node:fs");
const { join } = require("node:path");

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME } = process.env;
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const del = args.includes("--delete");

if (!dryRun && (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME)) {
  console.error("Missing AWS_* / S3_BUCKET_NAME in .env");
  process.exit(1);
}

const dir = join(__dirname, "..", "geminiImages");
const files = readdirSync(dir)
  .filter((f) => /^\d+-\d+\.jpeg$/.test(f))
  .sort((a, b) => {
    const [ai, an] = a.split(/[-.]/).map(Number);
    const [bi, bn] = b.split(/[-.]/).map(Number);
    return ai - bi || an - bn;
  });

console.log(`${files.length} image(s) in geminiImages`);
if (dryRun) {
  console.log(files.join(" "));
  process.exit(0);
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
});

async function main() {
  const ok = [];
  const failed = [];
  for (const f of files) {
    const id = f.replace(/\.jpeg$/, "");
    const key = `driving-test/${id}.jpeg`;
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          Body: readFileSync(join(dir, f)),
          ContentType: "image/jpeg",
          CacheControl: "public, max-age=31536000",
        }),
      );
      const url = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
      const r = await fetch(url, { method: "HEAD" });
      if (r.status !== 200) throw new Error(`HEAD ${r.status}`);
      ok.push(id);
      console.log("ok", id);
      if (del) unlinkSync(join(dir, f));
    } catch (e) {
      failed.push(id);
      console.error("FAILED", id, e.message);
    }
  }
  console.log(`\nuploaded ${ok.length}, failed ${failed.length}`);
  console.log(JSON.stringify({ ok, failed }));
  if (failed.length) process.exit(2);
}
main();
