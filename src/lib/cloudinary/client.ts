import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 120000, // 120 seconds — large PDF uploads can be slow
});

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" | "raw" | "auto" = "auto",
  publicId?: string
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
      timeout: 120000,
    };
    if (publicId) uploadOptions.public_id = publicId;

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({ url: result.secure_url, public_id: result.public_id });
      })
      .end(buffer);
  });
}

/** Test Cloudinary connection — resolves true or throws */
export async function testCloudinaryConnection(): Promise<boolean> {
  const result = await cloudinary.api.ping();
  if (result?.status !== "ok") throw new Error("Cloudinary ping failed");
  return true;
}

export async function deleteAsset(publicId: string, resourceType: "image" | "video" | "raw" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
