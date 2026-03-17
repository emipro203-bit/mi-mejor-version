import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "font-medium rounded-xl transition-all duration-200 active:scale-95",
        {
          // Variants
          "text-black hover:opacity-90": variant === "gold",
          "hover:text-white border": variant === "ghost",
          "text-white hover:opacity-90": variant === "danger",

          // Sizes
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2.5 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      style={{
        background:
          variant === "gold"
            ? "linear-gradient(135deg, #9A7A35, #C9A84C)"
            : variant === "danger"
            ? "#E05C5C"
            : "transparent",
        borderColor: variant === "ghost" ? "#2E2A22" : undefined,
        color: variant === "ghost" ? "#6B6355" : undefined,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
