"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  StickyNote,
  Phone,
  Mail,
  MessageCircle,
  Users,
  CheckSquare,
  Check,
  Trash2,
  Plus,
} from "lucide-react";
import { addActivity, toggleActivity, deleteActivity } from "@/app/actions/leads";
import { ACTIVITY_TYPES, ACTIVITY_META } from "@/lib/constants";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { fmtDate, relativeDay, daysFromNow, cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  NOTE: StickyNote,
  CALL: Phone,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  MEETING: Users,
  TASK: CheckSquare,
};

type Activity = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  dueDate: Date | string | null;
  done: boolean;
  createdAt: Date | string;
};

export function ActivityPanel({ leadId, activities }: { leadId: string; activities: Activity[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const toggle = (id: string, done: boolean) =>
    start(async () => {
      await toggleActivity(id, leadId, done);
      router.refresh();
    });

  const remove = (id: string) =>
    start(async () => {
      await deleteActivity(id, leadId);
      router.refresh();
    });

  const open = activities.filter((a) => !a.done);
  const done = activities.filter((a) => a.done);

  return (
    <div>
      {/* Add form */}
      <form action={addActivity.bind(null, leadId)} className="rounded-xl bg-cream-100 border border-line p-4 space-y-3 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Type">
            <Select name="type" defaultValue="CALL" options={ACTIVITY_TYPES.map((t) => ({ value: t, label: ACTIVITY_META[t].label }))} />
          </Field>
          <Field label="Title" className="sm:col-span-2">
            <Input name="title" placeholder="e.g. Follow-up call about quote" required />
          </Field>
        </div>
        <Textarea name="detail" placeholder="Details (optional)" className="min-h-[56px]" />
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <Field label="Due date" className="flex-1">
            <Input name="dueDate" type="date" />
          </Field>
          <SubmitButton>
            <Plus className="h-4 w-4" /> Add Activity
          </SubmitButton>
        </div>
      </form>

      {/* Timeline */}
      <div className={cn("space-y-2", pending && "opacity-70")}>
        {open.length === 0 && done.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-6">No activities yet. Log your first interaction above.</p>
        )}

        {open.map((a) => {
          const Icon = ICONS[a.type] ?? StickyNote;
          const overdue = a.dueDate && (daysFromNow(a.dueDate) ?? 0) < 0;
          return (
            <div key={a.id} className="group flex gap-3 rounded-xl border border-line bg-white p-3 hover:shadow-soft transition">
              <button
                onClick={() => toggle(a.id, true)}
                className="mt-0.5 grid h-5 w-5 place-items-center rounded-md border-2 border-line hover:border-brand-400 shrink-0"
                title="Mark done"
              />
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600 shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-ink">{a.title}</span>
                  <span className="text-[10px] uppercase tracking-wide text-ink-faint bg-cream-200 rounded px-1.5 py-0.5">
                    {ACTIVITY_META[a.type]?.label ?? a.type}
                  </span>
                </div>
                {a.detail && <p className="text-sm text-ink-soft mt-0.5">{a.detail}</p>}
                {a.dueDate && (
                  <p className={cn("text-xs mt-1 font-medium", overdue ? "text-rose-500" : "text-ink-faint")}>
                    Due {fmtDate(a.dueDate)} · {relativeDay(a.dueDate)}
                  </p>
                )}
              </div>
              <button
                onClick={() => remove(a.id)}
                className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rose-500 transition shrink-0"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}

        {done.length > 0 && (
          <div className="pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-2">Completed</p>
            {done.map((a) => (
              <div key={a.id} className="group flex gap-3 items-center rounded-xl px-3 py-2 hover:bg-cream-100 transition">
                <button
                  onClick={() => toggle(a.id, false)}
                  className="grid h-5 w-5 place-items-center rounded-md bg-emerald-500 text-white shrink-0"
                  title="Mark not done"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm text-ink-faint line-through flex-1 min-w-0 truncate">{a.title}</span>
                <button
                  onClick={() => remove(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rose-500 transition shrink-0"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
