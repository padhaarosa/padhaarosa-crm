"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LineItemsEditor, type EditorItem } from "@/components/docs/LineItemsEditor";
import { createInvoice, updateInvoice } from "@/app/actions/invoices";
import { INVOICE_STATUSES, INVOICE_STATUS_META } from "@/lib/constants";
import { dateInputValue, cn } from "@/lib/utils";

type Option = { id: string; name: string };
type BookingOption = { id: string; label: string };
type Invoice = {
  id: string;
  status: string;
  issueDate: Date | string;
  dueDate: Date | string | null;
  bookingId: string | null;
  taxRate: number;
  discount: number;
  notes: string | null;
  terms: string | null;
  showBank?: boolean;
  items: { label: string; detail: string | null; quantity: number; unitPrice: number }[];
};

export function InvoiceDialog({
  leads,
  bookings,
  invoice,
  variant = "primary",
  label,
  className,
}: {
  leads: Option[];
  bookings: BookingOption[];
  invoice?: Invoice;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!invoice;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/invoices");
  }

  async function editAction(fd: FormData) {
    await updateInvoice(invoice!.id, fd);
    setOpen(false);
    router.refresh();
  }

  const leadOpts = leads.map((l) => ({ value: l.id, label: l.name }));
  const bookingOpts = [{ value: "", label: "— No booking —" }, ...bookings.map((b) => ({ value: b.id, label: b.label }))];
  const presetLead = searchParams.get("leadId") ?? undefined;
  const presetBooking = searchParams.get("bookingId") ?? invoice?.bookingId ?? undefined;
  const initialItems: EditorItem[] | undefined = invoice?.items.map((it) => ({
    label: it.label,
    detail: it.detail ?? "",
    quantity: it.quantity,
    unitPrice: it.unitPrice,
  }));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}
      >
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "New Invoice")}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={isEdit ? "Edit Invoice" : "Create Invoice"}
        subtitle={isEdit ? "Update items, dates and terms" : "Raise a branded GST invoice"}
        size="xl"
      >
        <form action={isEdit ? editAction : createInvoice} className="space-y-5">
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
            <Field label="Linked booking (optional)">
              <Select name="bookingId" defaultValue={presetBooking} options={bookingOpts} />
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Status">
              <Select name="status" defaultValue={invoice?.status ?? "UNPAID"} options={INVOICE_STATUSES.map((s) => ({ value: s, label: INVOICE_STATUS_META[s].label }))} />
            </Field>
            <Field label="Issue date">
              <Input name="issueDate" type="date" defaultValue={dateInputValue(invoice?.issueDate ?? new Date())} />
            </Field>
            <Field label="Due date">
              <Input name="dueDate" type="date" defaultValue={dateInputValue(invoice?.dueDate)} />
            </Field>
          </div>

          <div>
            <p className="label">Line items</p>
            <LineItemsEditor initialItems={initialItems} initialTax={invoice?.taxRate ?? 5} initialDiscount={invoice?.discount ?? 0} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Notes">
              <Textarea name="notes" defaultValue={invoice?.notes ?? ""} placeholder="Any note for the customer…" />
            </Field>
            <Field label="Terms & conditions">
              <Textarea name="terms" defaultValue={invoice?.terms ?? "Balance payable before travel."} />
            </Field>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-line bg-cream-100 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              name="showBank"
              defaultChecked={invoice?.showBank ?? true}
              className="h-5 w-5 rounded border-line text-brand-500 focus:ring-brand-300"
            />
            <span className="text-sm">
              <span className="font-semibold text-ink">Show bank / payment details on the invoice</span>
              <span className="block text-xs text-ink-soft">Bank name, A/C no., IFSC & UPI from Settings. Untick to hide them on the printed invoice.</span>
            </span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save Invoice" : "Create Invoice"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
