import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium" style={{ color: "var(--muted-2, var(--muted))" }}>
          {label}
        </label>
      )}
      <input
        className={cn("w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200", className)}
        style={{
          background: "var(--surface-2, var(--surface))",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: "var(--error)" }}>{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium" style={{ color: "var(--muted-2, var(--muted))" }}>
          {label}
        </label>
      )}
      <textarea
        className={cn("w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none", className)}
        style={{
          background: "var(--surface-2, var(--surface))",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--gold)"; }}
        onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: "var(--error)" }}>{error}</p>}
    </div>
  );
}
