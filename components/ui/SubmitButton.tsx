"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  const cls =
    variant === "danger" ? "btn-danger" : variant === "secondary" ? "btn-secondary" : "btn-primary";
  return (
    <button type="submit" disabled={pending} className={cn(cls, className)}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
