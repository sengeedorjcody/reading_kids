import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(urlOrKey: string): Promise<string> {
  let key = urlOrKey;
  if (urlOrKey.startsWith("http")) {
    const urlObj = new URL(urlOrKey);
    key = urlObj.pathname.slice(1); // strip leading slash
  }
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  return key;
}
