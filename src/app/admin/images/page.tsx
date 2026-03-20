export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Image from "@/lib/db/models/Image";
import { IImageDoc } from "@/lib/db/models/Image";

async function getImages(): Promise<IImageDoc[]> {
  await connectDB();
  const images = await Image.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(images));
}

export default async function AdminImagesPage() {
  const images = await getImages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">🖼️ Images</h1>
        <span className="text-sm text-gray-400 font-bold">{images.length} file{images.length !== 1 ? "s" : ""}</span>
      </div>

      {images.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-xl text-gray-400 font-bold">No images uploaded yet</p>
          <p className="text-sm text-gray-300 mt-2">Upload images via the Character or Book forms</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={String(img._id)} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
              <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-gray-700 truncate" title={img.title}>{img.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{img.mimeType.replace("image/", "").toUpperCase()}</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(img.createdAt).toLocaleDateString()}
                </p>
                <a
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-blue-500 hover:underline font-bold"
                >
                  Open ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
