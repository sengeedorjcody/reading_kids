export default function LoadingSpinner({ message = "よんでいます..." }: { message?: string }) {
  const chars = ["あ", "い", "う", "え", "お"];
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="flex gap-3">
        {chars.map((char, i) => (
          <span
            key={char}
            className="text-4xl font-bold text-pink-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            {char}
          </span>
        ))}
      </div>
      <p className="text-xl text-gray-500 font-medium">{message}</p>
    </div>
  );
}
