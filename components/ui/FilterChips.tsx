"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export type Chip = { href: string; label: string; active: boolean };



/**
 * Filter chips that navigate client-side and KEEP the user's scroll position.
 * Next's scroll:false is unreliable when all query params are removed, so we
 * remember scrollY at module level and restore it when the new page mounts.
 */
export function FilterChips({ chips, small = false }: { chips: Chip[]; small?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const go = (href: string) => {
    // Flag the in-flight navigation so the global ScrollKeeper undoes any
    // framework-initiated jump back to the top (scroll:false alone is not
    // honoured on streamed dynamic routes in Next 15).
    (window as any).__keepScrollY = { y: window.scrollY, until: Date.now() + 6000 };
    start(() => router.replace(href, { scroll: false }));
  };

  return (
    <div className={cn("flex flex-wrap gap-2", pending && "opacity-70")}>
      {chips.map((c) => (
        <button
          key={c.href + c.label}
          onClick={() => go(c.href)}
          className={cn(
            small ? "px-3 py-1 rounded-full text-xs font-medium border transition" : "px-3.5 py-1.5 rounded-full text-sm font-medium border transition",
            c.active
              ? "bg-plum-800 text-white border-plum-800"
              : "bg-white text-ink-soft border-line hover:border-brand-300"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
