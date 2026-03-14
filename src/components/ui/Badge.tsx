import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  bg?: string;
}

export default function Badge({ children, className, color = "text-gray-700", bg = "bg-gray-100" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
        color,
        bg,
        className
      )}
    >
      {children}
    </span>
  );
}
