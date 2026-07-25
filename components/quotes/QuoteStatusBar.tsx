"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateQuoteStatus } from "@/app/actions/quotes";
import { QUOTE_STATUSES, QUOTE_STATUS_META, TONE_DOT } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function QuoteStatusBar({ quoteId, current }: { quoteId: string; current: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (status: string) => {
    if (status === current) return;
    start(async () => {
      await updateQuoteStatus(quoteId, status);
      router.refresh();
    });
  };
  return (
    <div className={cn("flex flex-wrap gap-2", pending && "opacity-60 pointer-events-none")}>
      {QUOTE_STATUSES.map((status) => {
        const meta = QUOTE_STATUS_META[status];
        const active = status === current;
        return (
          <button
            key={status}
            onClick={() => set(status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold border transition",
              active ? "bg-plum-800 text-white border-plum-800" : "bg-white text-ink-soft border-line hover:border-brand-300"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[meta.tone])} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
