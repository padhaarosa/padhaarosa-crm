"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, MapPin } from "lucide-react";
import { updateLeadStage } from "@/app/actions/leads";
import { LEAD_STAGES, LEAD_STAGE_META, PRIORITY_META } from "@/lib/constants";
import { inrCompact, cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";

type BoardLead = {
  id: string;
  name: string;
  destination: string | null;
  budget: number | null;
  priority: string;
  stage: string;
  agentName: string | null;
};

export function LeadBoard({ leads }: { leads: BoardLead[] }) {
  const [items, setItems] = useState<BoardLead[]>(leads);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => setItems(leads), [leads]);

  function onDrop(stage: string) {
    setOverStage(null);
    if (!dragId) return;
    const current = items.find((l) => l.id === dragId);
    setDragId(null);
    if (!current || current.stage === stage) return;
    setItems((prev) => prev.map((l) => (l.id === dragId ? { ...l, stage } : l)));
    updateLeadStage(dragId, stage).then(() => router.refresh());
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1">
      {LEAD_STAGES.map((stage) => {
        const meta = LEAD_STAGE_META[stage];
        const colLeads = items.filter((l) => l.stage === stage);
        const value = colLeads.reduce((s, l) => s + (l.budget ?? 0), 0);
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => onDrop(stage)}
            className={cn(
              "w-[270px] shrink-0 rounded-2xl border bg-cream-100/60 transition-colors",
              overStage === stage ? "border-brand-400 bg-brand-50/60" : "border-line"
            )}
          >
            <div className="flex items-center gap-2 px-3.5 py-3 border-b border-line/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
              <span className="font-semibold text-sm text-ink">{meta.label}</span>
              <span className="text-xs font-semibold text-ink-faint bg-white rounded-full px-2 py-0.5 ml-1">
                {colLeads.length}
              </span>
              <span className="ml-auto text-[11px] text-ink-faint">{inrCompact(value)}</span>
            </div>

            <div className="p-2.5 space-y-2.5 min-h-[120px] max-h-[calc(100vh-320px)] overflow-y-auto">
              {colLeads.map((l) => (
                <div
                  key={l.id}
                  draggable
                  onDragStart={() => setDragId(l.id)}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group rounded-xl bg-white border border-line shadow-soft p-3 cursor-grab active:cursor-grabbing transition",
                    dragId === l.id && "opacity-40 rotate-1"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-ink-faint/50 mt-0.5 shrink-0 group-hover:text-ink-faint" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/leads/${l.id}`}
                        className="font-semibold text-sm text-ink hover:text-brand-600 truncate block"
                      >
                        {l.name}
                      </Link>
                      {l.destination && (
                        <div className="text-xs text-ink-soft flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{l.destination}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs font-semibold text-brand-700">
                          {l.budget ? inrCompact(l.budget) : "—"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            title={PRIORITY_META[l.priority]?.label}
                            style={{
                              background:
                                l.priority === "HIGH" ? "#F43F5E" : l.priority === "MEDIUM" ? "#0EA5E9" : "#94A3B8",
                            }}
                          />
                          {l.agentName && <Avatar name={l.agentName} size={22} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {colLeads.length === 0 && (
                <div className="text-center text-xs text-ink-faint/70 py-6 border border-dashed border-line rounded-xl">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
