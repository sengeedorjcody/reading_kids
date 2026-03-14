import Badge from "@/components/ui/Badge";
import { LEVEL_CONFIG } from "@/constants/levels";
import { BookLevel } from "@/types";

interface LevelBadgeProps {
  level: BookLevel;
  size?: "sm" | "md";
}

export default function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level] ?? {
    label: level,
    color: "text-gray-700",
    bg: "bg-gray-100",
    emoji: "📚",
  };
  return (
    <Badge color={config.color} bg={config.bg} className={size === "sm" ? "text-xs" : "text-sm"}>
      {config.emoji} {config.label}
    </Badge>
  );
}
