"use client";

import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";
import { addAssignment, removeAssignment } from "@/app/actions/events";
import { Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EVENT_ROLES } from "@/lib/constants";
import { Avatar } from "@/components/ui/primitives";

type Agent = { id: string; name: string };
type Assignment = { id: string; role: string; agent: { id: string; name: string; designation: string } };

export function TeamAssign({
  eventId,
  assignments,
  agents,
}: {
  eventId: string;
  assignments: Assignment[];
  agents: Agent[];
}) {
  const router = useRouter();
  const assignedIds = new Set(assignments.map((a) => a.agent.id));
  const available = agents.filter((a) => !assignedIds.has(a.id));

  async function add(fd: FormData) {
    await addAssignment(eventId, fd);
    router.refresh();
  }

  return (
    <div className="p-5">
      <div className="space-y-2 mb-4">
        {assignments.map((a) => (
          <div key={a.id} className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <Avatar name={a.agent.name} size={38} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-ink truncate">{a.agent.name}</div>
              <div className="text-xs text-ink-faint truncate">{a.agent.designation}</div>
            </div>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 rounded-full px-2.5 py-1">{a.role}</span>
            <ConfirmButton
              action={async () => {
                await removeAssignment(a.id, eventId);
                router.refresh();
              }}
              confirm={`Remove ${a.agent.name} from this event?`}
              className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rose-500 transition shrink-0"
            >
              <X className="h-4 w-4" />
            </ConfirmButton>
          </div>
        ))}
        {assignments.length === 0 && <p className="text-sm text-ink-soft text-center py-3">No team assigned yet.</p>}
      </div>

      {available.length > 0 && (
        <form action={add} className="flex flex-col sm:flex-row gap-2 items-end rounded-xl bg-cream-100 border border-line p-3">
          <div className="flex-1 w-full">
            <label className="label">Member</label>
            <Select name="agentId" options={available.map((a) => ({ value: a.id, label: a.name }))} />
          </div>
          <div className="flex-1 w-full">
            <label className="label">Role</label>
            <Select name="role" defaultValue="Coordinator" options={EVENT_ROLES} />
          </div>
          <SubmitButton className="btn-sm w-full sm:w-auto"><UserPlus className="h-4 w-4" /> Assign</SubmitButton>
        </form>
      )}
    </div>
  );
}
