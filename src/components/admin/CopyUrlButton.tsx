"use client";

import { useState } from "react";

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full text-xs font-bold py-1.5 rounded-lg transition-colors bg-gray-100 hover:bg-blue-50 text-gray-500 hover:text-blue-600"
    >
      {copied ? "✓ Copied!" : "📋 Copy URL"}
    </button>
  );
}
