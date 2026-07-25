"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { LineItemsEditor, type EditorItem } from "@/components/docs/LineItemsEditor";
import { createQuote, updateQuote } from "@/app/actions/quotes";
import { QUOTE_STATUSES, QUOTE_STATUS_META } from "@/lib/constants";
import { dateInputValue, cn } from "@/lib/utils";

type Option = { id: string; name: string };
type Quote = {
  id: string;
  title: string;
  status: string;
  issueDate: Date | string;
  validUntil: Date | string | null;
  taxRate: number;
  discount: number;
  notes: string | null;
  terms: string | null;
  items: { label: string; detail: string | null; quantity: number; unitPrice: number }[];
};

export function QuoteDialog({
  leads,
  quote,
  variant = "primary",
  label,
  className,
}: {
  leads: Option[];
  quote?: Quote;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!quote;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/quotes");
  }

  async function editAction(fd: FormData) {
    await updateQuote(quote!.id, fd);
    setOpen(false);
    router.refresh();
  }

  const leadOpts = leads.map((l) => ({ value: l.id, label: l.name }));
  const presetLead = searchParams.get("leadId") ?? undefined;
  const initialItems: EditorItem[] | undefined = quote?.items.map((it) => ({
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
        {label ?? (isEdit ? "Edit" : "New Quotation")}
      </button>

      <Modal
        open={open}
        onClose={close}
        title={isEdit ? "Edit Quotation" : "Create Quotation"}
        subtitle={isEdit ? "Update line items and terms" : "Build a branded quote for your customer"}
        size="xl"
      >
        <form action={isEdit ? editAction : createQuote} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isEdit && (
              <>
                <Field label="Customer name" required={leads.length === 0} hint={leads.length > 0 ? "Or pick an existing customer →" : "A new contact will be created"}>
                  <Input name="customerName" placeholder="e.g. Rohan Mehta" />
                </Field>
                {leads.length > 0 && (
                  <Field label="Existing customer">
                    <Select name="leadId" defaultValue={presetLead} options={[{ value: "", label: "— Use name typed on the left —" }, ...leadOpts]} />
                  </Field>
                )}
              </>
            )}
            <Field label="Quote title" className="sm:col-span-2">
              <Input name="title" defaultValue={quote?.title ?? "Travel Quotation"} placeholder="e.g. Golden Triangle — 5N/6D" />
            </Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="Status">
              <Select name="status" defaultValue={quote?.status ?? "DRAFT"} options={QUOTE_STATUSES.map((s) => ({ value: s, label: QUOTE_STATUS_META[s].label }))} />
            </Field>
            <Field label="Issue date">
              <Input name="issueDate" type="date" defaultValue={dateInputValue(quote?.issueDate ?? new Date())} />
            </Field>
            <Field label="Valid until">
              <Input name="validUntil" type="date" defaultValue={dateInputValue(quote?.validUntil)} />
            </Field>
          </div>

          <div>
            <p className="label">Line items</p>
            <LineItemsEditor initialItems={initialItems} initialTax={quote?.taxRate ?? 5} initialDiscount={quote?.discount ?? 0} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Notes">
              <Textarea name="notes" defaultValue={quote?.notes ?? ""} placeholder="Inclusions, offers…" />
            </Field>
            <Field label="Terms & conditions">
              <Textarea name="terms" defaultValue={quote?.terms ?? "50% advance to confirm. Balance before travel."} />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save Quotation" : "Create Quotation"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
