"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IYoutubeVideo } from "@/lib/db/models/YoutubeVideo";

export default function YoutubeListPage() {
  const [videos, setVideos] = useState<IYoutubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/youtube")
      .then((r) => r.json())
      .then((data) => { setVideos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black pb-28">
      <div className="px-5 pt-6 pb-4 max-w-xl mx-auto w-full">
        <h1 className="text-3xl font-black text-white">📺 YouTube</h1>
        <p className="text-sm text-gray-400 mt-1">Видео үзэж, транскриптийг дагаж сур</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <span className="text-4xl animate-spin">📺</span>
        </div>
      )}

      {!loading && videos.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">📺</div>
          <p className="font-bold">Видео байхгүй байна</p>
          <p className="text-sm mt-1">Admin хэсгээс нэмнэ үү</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-5 max-w-xl mx-auto w-full">
        {videos.map((v) => (
          <button
            key={v._id}
            onClick={() => router.push(`/youtube/${v._id}`)}
            className="flex flex-col rounded-3xl overflow-hidden shadow-xl active:scale-95 transition-all text-left"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-full aspect-video bg-cover bg-center"
              style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg)` }}
            />
            <div className="p-3">
              <h2 className="text-sm font-black text-white leading-tight line-clamp-2">{v.title}</h2>
              <p className="text-[11px] text-gray-400 mt-1">{v.transcript.length} lines</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
