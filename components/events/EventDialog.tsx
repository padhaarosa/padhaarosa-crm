"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createEvent, updateEvent } from "@/app/actions/events";
import { EVENT_TYPES, EVENT_STATUSES, EVENT_STATUS_META } from "@/lib/constants";
import { dateInputValue, cn } from "@/lib/utils";

type Option = { id: string; name: string };
type EventT = {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  location: string;
  venue: string | null;
  guests: number;
  budget: number;
  leadId: string | null;
  notes: string | null;
};

export function EventDialog({
  leads,
  event,
  variant = "primary",
  label,
  className,
}: {
  leads: Option[];
  event?: EventT;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!event;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/events");
  }

  async function editAction(fd: FormData) {
    await updateEvent(event!.id, fd);
    setOpen(false);
    router.refresh();
  }

  const leadOpts = [{ value: "", label: "— No client linked —" }, ...leads.map((l) => ({ value: l.id, label: l.name }))];

  return (
    <>
      <button onClick={() => setOpen(true)} className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}>
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "New Event")}
      </button>

      <Modal open={open} onClose={close} title={isEdit ? "Edit Event" : "Create Event"} subtitle={isEdit ? event!.title : "Plan a wedding, corporate offsite, MICE or group departure"} size="lg">
        <form action={isEdit ? editAction : createEvent} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Event title" required className="sm:col-span-2">
              <Input name="title" defaultValue={event?.title} placeholder="e.g. Kapoor Royal Wedding" required />
            </Field>
            <Field label="Type">
              <Select name="type" defaultValue={event?.type ?? "Group Tour"} options={EVENT_TYPES} />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={event?.status ?? "PLANNING"} options={EVENT_STATUSES.map((s) => ({ value: s, label: EVENT_STATUS_META[s].label }))} />
            </Field>
            <Field label="Start date" required>
              <Input name="startDate" type="date" defaultValue={dateInputValue(event?.startDate)} required />
            </Field>
            <Field label="End date" required>
              <Input name="endDate" type="date" defaultValue={dateInputValue(event?.endDate)} required />
            </Field>
            <Field label="Location / Route">
              <Input name="location" defaultValue={event?.location ?? "Jaipur"} placeholder="e.g. Udaipur or Jaipur to Goa" />
            </Field>
            <Field label="Venue">
              <Input name="venue" defaultValue={event?.venue ?? ""} placeholder="e.g. The Leela Palace" />
            </Field>
            <Field label="Guests">
              <Input name="guests" type="number" min={0} defaultValue={event?.guests ?? 0} />
            </Field>
            <Field label="Budget (₹)">
              <Input name="budget" type="number" min={0} step={50000} defaultValue={event?.budget ?? ""} placeholder="0" />
            </Field>
            <Field label="Client (optional)" className="sm:col-span-2">
              <Select name="leadId" defaultValue={event?.leadId ?? ""} options={leadOpts} />
            </Field>
          </div>
          <Field label="Notes">
            <Textarea name="notes" defaultValue={event?.notes ?? ""} placeholder="Programme, requirements, key details…" />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save Event" : "Create Event"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
