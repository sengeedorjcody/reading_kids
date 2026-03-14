import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl shadow-md overflow-hidden",
        hover && "hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
