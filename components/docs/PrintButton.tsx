"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Print / PDF", className = "btn-secondary btn-sm sm:text-sm sm:px-4 sm:py-2.5" }: { label?: string; className?: string }) {
  return (
    <button onClick={() => window.print()} className={className}>
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
