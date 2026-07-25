"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }[size];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-plum-900/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative w-full bg-white rounded-2xl shadow-pop border border-line animate-fade-in",
          "flex flex-col max-h-[92vh] text-left", // text-left: never inherit centering from EmptyState etc.
          width
        )}
      >
        <div className="flex items-start gap-3 px-5 sm:px-6 py-3.5 border-b border-line shrink-0">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink truncate">{title}</h2>
            {subtitle && <p className="text-xs text-ink-soft mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-cream-200 hover:text-ink shrink-0"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body scrolls inside the panel — the dialog itself never exceeds the screen */}
        <div className="px-5 sm:px-6 py-4 overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-3.5 border-t border-line bg-cream-100 rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
