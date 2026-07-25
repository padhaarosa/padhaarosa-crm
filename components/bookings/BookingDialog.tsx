"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createBooking, updateBooking } from "@/app/actions/bookings";
import { BOOKING_STATUSES, BOOKING_STATUS_META } from "@/lib/constants";
import { dateInputValue, cn } from "@/lib/utils";

type Option = { id: string; name: string };
type Booking = {
  id: string;
  title: string;
  destination: string;
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  adults: number;
  children: number;
  totalAmount: number;
  notes: string | null;
  agentId: string | null;
};

export function BookingDialog({
  leads,
  agents,
  booking,
  variant = "primary",
  label,
  className,
}: {
  leads: Option[];
  agents: Option[];
  booking?: Booking;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!booking;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/bookings");
  }

  async function editAction(fd: FormData) {
    await updateBooking(booking!.id, fd);
    setOpen(false);
    router.refresh();
  }

  const leadOpts = leads.map((l) => ({ value: l.id, label: l.name }));
  const agentOpts = [{ value: "", label: "— Unassigned —" }, ...agents.map((a) => ({ value: a.id, label: a.name }))];
  const presetLead = searchParams.get("leadId") ?? undefined;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "New Booking")}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={isEdit ? "Edit Booking" : "Create Booking"}
        subtitle={isEdit ? booking!.title : "Set up a new trip for a customer"}
        size="lg"
      >
        <form action={isEdit ? editAction : createBooking} className="space-y-5">
          {!isEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Customer name" required={leads.length === 0} hint={leads.length > 0 ? "Or pick an existing customer →" : "A new contact will be created"}>
                <Input name="customerName" placeholder="e.g. Rohan Mehta" />
              </Field>
              {leads.length > 0 && (
                <Field label="Existing customer">
                  <Select name="leadId" defaultValue={presetLead} options={[{ value: "", label: "— Use name typed on the left —" }, ...leadOpts]} />
                </Field>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Trip title" required>
              <Input name="title" defaultValue={booking?.title} placeholder="e.g. Jaisalmer Desert Safari" required />
            </Field>
            <Field label="Destination" required>
              <Input name="destination" defaultValue={booking?.destination} placeholder="e.g. Jaisalmer" required />
            </Field>
            <Field label="Start date" required>
              <Input name="startDate" type="date" defaultValue={dateInputValue(booking?.startDate)} required />
            </Field>
            <Field label="End date" required>
              <Input name="endDate" type="date" defaultValue={dateInputValue(booking?.endDate)} required />
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Adults">
              <Input name="adults" type="number" min={0} defaultValue={booking?.adults ?? 2} />
            </Field>
            <Field label="Children">
              <Input name="children" type="number" min={0} defaultValue={booking?.children ?? 0} />
            </Field>
            <Field label="Status">
              <Select
                name="status"
                defaultValue={booking?.status ?? "DRAFT"}
                options={BOOKING_STATUSES.map((s) => ({ value: s, label: BOOKING_STATUS_META[s].label }))}
              />
            </Field>
            <Field label="Agent">
              <Select name="agentId" defaultValue={booking?.agentId ?? ""} options={agentOpts} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Package amount (₹)" hint="Total trip cost quoted to the customer">
              <Input name="totalAmount" type="number" min={0} step={1000} defaultValue={booking?.totalAmount ?? ""} placeholder="0" />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea name="notes" defaultValue={booking?.notes ?? ""} placeholder="Inclusions, special requests, internal notes…" />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save Changes" : "Create Booking"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
