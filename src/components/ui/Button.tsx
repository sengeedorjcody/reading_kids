"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
}

const variantStyles = {
  primary: "bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-pink-200",
  secondary: "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-200",
  ghost: "bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg",
  success: "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-200",
};

const sizeStyles = {
  sm: "text-sm px-3 py-2 rounded-xl",
  md: "text-base px-5 py-3 rounded-2xl",
  lg: "text-xl px-6 py-4 rounded-2xl",
  xl: "text-2xl px-8 py-5 rounded-3xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200",
          "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
