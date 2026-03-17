import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          className="block text-sm font-medium"
          style={{ color: "#A89880" }}
        >
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-1",
          className
        )}
        style={{
          background: "#242018",
          border: "1px solid #2E2A22",
          color: "#F5F0E8",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#C9A84C";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#2E2A22";
        }}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "#E05C5C" }}>
          {error}
        </p>
      )}
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
        <label
          className="block text-sm font-medium"
          style={{ color: "#A89880" }}
        >
          {label}
        </label>
      )}
      <textarea
        className={cn("w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none", className)}
        style={{
          background: "#242018",
          border: "1px solid #2E2A22",
          color: "#F5F0E8",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#C9A84C";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#2E2A22";
        }}
        rows={3}
        {...props}
      />
      {error && (
        <p className="text-xs" style={{ color: "#E05C5C" }}>
          {error}
        </p>
      )}
    </div>
  );
}
