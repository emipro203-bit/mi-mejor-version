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
          "hover:opacity-90": variant === "gold" || variant === "danger",
          "border hover:opacity-80": variant === "ghost",
          "px-3 py-1.5 text-sm": size === "sm",
          "px-4 py-2.5 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      style={{
        background:
          variant === "gold"
            ? "linear-gradient(135deg, var(--gold-dark), var(--gold))"
            : variant === "danger"
            ? "var(--error)"
            : "transparent",
        color:
          variant === "gold"
            ? "var(--background)"
            : variant === "danger"
            ? "#fff"
            : "var(--muted)",
        borderColor: variant === "ghost" ? "var(--border)" : undefined,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
