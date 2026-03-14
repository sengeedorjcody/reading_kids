"use client";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
  className?: string;
  label?: string;
}

export default function DeleteButton({
  action,
  confirmMessage,
  className = "text-red-400 font-bold text-sm hover:text-red-600 hover:underline",
  label = "Delete",
}: DeleteButtonProps) {
  return (
    <form action={action}>
      <button
        type="submit"
        className={className}
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault();
        }}
      >
        {label}
      </button>
    </form>
  );
}
