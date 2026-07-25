"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createLead, updateLead } from "@/app/actions/leads";
import { LEAD_SOURCES, LEAD_STAGES, LEAD_STAGE_META, PRIORITIES, PRIORITY_META } from "@/lib/constants";
import { dateInputValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Agent = { id: string; name: string };
type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string;
  stage: string;
  priority: string;
  destination: string | null;
  travelDate: Date | string | null;
  pax: number;
  budget: number | null;
  notes: string | null;
  lostReason: string | null;
  agentId: string | null;
};

export function LeadDialog({
  agents,
  lead,
  label,
  variant = "primary",
  className,
}: {
  agents: Agent[];
  lead?: Lead;
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!lead;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/leads");
  }

  async function editAction(fd: FormData) {
    await updateLead(lead!.id, fd);
    setOpen(false);
    router.refresh();
  }

  const agentOpts = [{ value: "", label: "— Unassigned —" }, ...agents.map((a) => ({ value: a.id, label: a.name }))];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "New Lead")}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={isEdit ? "Edit Lead" : "Add New Lead"}
        subtitle={isEdit ? lead!.name : "Capture a new enquiry into your pipeline"}
        size="lg"
      >
        <form action={isEdit ? editAction : createLead} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Full name" required>
              <Input name="name" defaultValue={lead?.name} placeholder="e.g. Rohan Mehta" required />
            </Field>
            <Field label="Company (optional)">
              <Input name="company" defaultValue={lead?.company ?? ""} placeholder="e.g. Mehta & Co." />
            </Field>
            <Field label="Phone">
              <Input name="phone" defaultValue={lead?.phone ?? ""} placeholder="+91 98xxx xxxxx" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={lead?.email ?? ""} placeholder="name@email.com" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Source">
              <Select name="source" defaultValue={lead?.source ?? "Website"} options={LEAD_SOURCES} />
            </Field>
            <Field label="Stage">
              <Select
                name="stage"
                defaultValue={lead?.stage ?? "NEW"}
                options={LEAD_STAGES.map((s) => ({ value: s, label: LEAD_STAGE_META[s].label }))}
              />
            </Field>
            <Field label="Priority">
              <Select
                name="priority"
                defaultValue={lead?.priority ?? "MEDIUM"}
                options={PRIORITIES.map((p) => ({ value: p, label: PRIORITY_META[p].label }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Destination">
              <Input name="destination" defaultValue={lead?.destination ?? ""} placeholder="e.g. Udaipur & Mount Abu" />
            </Field>
            <Field label="Assigned agent">
              <Select name="agentId" defaultValue={lead?.agentId ?? ""} options={agentOpts} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Travel date">
              <Input name="travelDate" type="date" defaultValue={dateInputValue(lead?.travelDate)} />
            </Field>
            <Field label="Pax">
              <Input name="pax" type="number" min={1} defaultValue={lead?.pax ?? 1} />
            </Field>
            <Field label="Budget (₹)">
              <Input name="budget" type="number" min={0} step={1000} defaultValue={lead?.budget ?? ""} placeholder="0" />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea name="notes" defaultValue={lead?.notes ?? ""} placeholder="Preferences, special requests, context…" className="min-h-[56px]" />
          </Field>

          {isEdit && lead?.stage === "LOST" && (
            <Field label="Reason for loss">
              <Input name="lostReason" defaultValue={lead?.lostReason ?? ""} placeholder="Why did this lead not convert?" />
            </Field>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">
              Cancel
            </button>
            <SubmitButton>{isEdit ? "Save Changes" : "Create Lead"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
