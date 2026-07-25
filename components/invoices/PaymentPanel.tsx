"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, IndianRupee, X } from "lucide-react";
import { addPayment, deletePayment } from "@/app/actions/invoices";
import { Field, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PAYMENT_METHODS } from "@/lib/constants";
import { inr, fmtDate, dateInputValue } from "@/lib/utils";

type Payment = {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paidAt: Date | string;
  note: string | null;
};

export function PaymentPanel({
  invoiceId,
  payments,
  balance,
}: {
  invoiceId: string;
  payments: Payment[];
  balance: number;
}) {
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  async function add(fd: FormData) {
    await addPayment(invoiceId, fd);
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="p-5">
      <div className="space-y-2 mb-4">
        {payments.map((p) => (
          <div key={p.id} className="group flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <IndianRupee className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-ink text-sm">{inr(p.amount)}</div>
              <div className="text-xs text-ink-faint truncate">
                {p.method}{p.reference ? ` · ${p.reference}` : ""} · {fmtDate(p.paidAt)}
              </div>
            </div>
            <ConfirmButton
              action={async () => {
                await deletePayment(p.id, invoiceId);
                router.refresh();
              }}
              confirm="Delete this payment record?"
              className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-rose-500 transition shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </ConfirmButton>
          </div>
        ))}
        {payments.length === 0 && <p className="text-sm text-ink-soft text-center py-3">No payments recorded yet.</p>}
      </div>

      {adding ? (
        <form action={add} className="rounded-xl border border-brand-200 bg-cream-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-ink text-sm">Record Payment</h4>
            <button type="button" onClick={() => setAdding(false)} className="text-ink-faint hover:text-ink"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (₹)" required>
              <Input name="amount" type="number" min={1} step="100" defaultValue={balance > 0 ? Math.round(balance) : ""} required />
            </Field>
            <Field label="Method">
              <Select name="method" defaultValue="UPI" options={PAYMENT_METHODS} />
            </Field>
            <Field label="Date">
              <Input name="paidAt" type="date" defaultValue={dateInputValue(new Date())} />
            </Field>
            <Field label="Reference">
              <Input name="reference" placeholder="Txn / UTR no." />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost btn-sm">Cancel</button>
            <SubmitButton className="btn-sm">Save Payment</SubmitButton>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-xl border-2 border-dashed border-line hover:border-brand-300 hover:bg-cream-100 text-ink-soft hover:text-brand-600 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition"
        >
          <Plus className="h-4 w-4" /> Record Payment
        </button>
      )}
    </div>
  );
}
