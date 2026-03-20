export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db/mongoose";
import Background from "@/lib/db/models/Background";
import { IBackgroundDoc } from "@/lib/db/models/Background";
import BackgroundUploadForm from "@/components/admin/BackgroundUploadForm";
import DeleteBackgroundButton from "@/components/admin/DeleteBackgroundButton";

async function getBackgrounds(): Promise<IBackgroundDoc[]> {
  await connectDB();
  const bgs = await Background.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(bgs));
}

export default async function AdminBackgroundsPage() {
  const backgrounds = await getBackgrounds();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-800">🌅 Backgrounds</h1>
        <span className="text-sm text-gray-400 font-bold">{backgrounds.length} saved</span>
      </div>

      <BackgroundUploadForm />

      {backgrounds.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center">
          <div className="text-6xl mb-4">🌄</div>
          <p className="text-xl text-gray-400 font-bold">No backgrounds yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {backgrounds.map((bg) => (
            <div key={String(bg._id)} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-video overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bg.imageUrl} alt={bg.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-gray-700 truncate">{bg.name}</p>
                <p className="text-xs text-gray-400">{new Date(bg.createdAt).toLocaleDateString()}</p>
                <DeleteBackgroundButton bgId={String(bg._id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
