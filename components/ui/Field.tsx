import { cn } from "@/lib/utils";

export function Field({
  label,
  children,
  hint,
  required,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-brand-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("input", props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("input min-h-[80px] resize-y", props.className)} />;
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[] | string[];
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <select {...props} className={cn("input appearance-none bg-white cursor-pointer", props.className)}>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
