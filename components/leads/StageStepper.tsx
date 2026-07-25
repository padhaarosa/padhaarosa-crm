"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { updateLeadStage } from "@/app/actions/leads";
import { LEAD_STAGES, LEAD_STAGE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StageStepper({ leadId, current }: { leadId: string; current: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const set = (stage: string) => {
    if (stage === current) return;
    start(async () => {
      await updateLeadStage(leadId, stage);
      router.refresh();
    });
  };

  return (
    <div className={cn("flex flex-wrap gap-2", pending && "opacity-60 pointer-events-none")}>
      {LEAD_STAGES.map((stage) => {
        const meta = LEAD_STAGE_META[stage];
        const activeStage = stage === current;
        return (
          <button
            key={stage}
            onClick={() => set(stage)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold border transition",
              activeStage
                ? "text-white border-transparent shadow-soft"
                : "bg-white text-ink-soft border-line hover:border-brand-300"
            )}
            style={activeStage ? { background: meta.color } : undefined}
          >
            {activeStage && <Check className="h-3.5 w-3.5" />}
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
