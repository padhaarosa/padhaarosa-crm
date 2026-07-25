import Image from "next/image";
import { inr, fmtDate } from "@/lib/utils";
import { computeTotals, paymentTotal, lineAmount } from "@/lib/totals";

type Item = { label: string; detail: string | null; quantity: number; unitPrice: number };
type Payment = { amount: number; method: string; reference: string | null; paidAt: Date | string };

type Settings = {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  gstin: string;
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  upiId: string;
  invoiceNotes: string;
  logoUrl: string;
};

type Client = {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
};

export function DocumentView({
  kind,
  number,
  status,
  issueDate,
  secondaryLabel,
  secondaryDate,
  settings,
  client,
  items,
  taxRate,
  discount,
  notes,
  terms,
  payments = [],
  showBank = true,
}: {
  kind: "QUOTATION" | "INVOICE";
  number: string;
  status?: React.ReactNode;
  issueDate: Date | string;
  secondaryLabel: string;
  secondaryDate: Date | string | null;
  settings: Settings;
  client: Client;
  items: Item[];
  taxRate: number;
  discount: number;
  notes?: string | null;
  terms?: string | null;
  payments?: Payment[];
  showBank?: boolean;
}) {
  const totals = computeTotals(items, taxRate, discount);
  const paid = paymentTotal(payments);
  const balance = Math.max(0, totals.total - paid);

  return (
    <div className="print-area card overflow-hidden max-w-3xl mx-auto">
      {/* Brand header */}
      <div className="print-header bg-gradient-to-r from-plum-800 to-maroon-600 text-white px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden ring-2 ring-white/40 bg-white shrink-0">
            <Image src={settings.logoUrl || "/logo.png"} alt={settings.companyName} fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <div className="font-display text-xl sm:text-2xl font-semibold leading-tight">{settings.companyName}</div>
            <div className="text-gold-400 text-sm">{settings.tagline}</div>
            <div className="text-white/70 text-xs mt-1 max-w-xs">{settings.address}</div>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="font-display text-xl sm:text-2xl font-bold tracking-wide uppercase">{kind}</div>
          <div className="text-white/80 text-sm mt-1">{number}</div>
        </div>
      </div>

      <div className="px-5 sm:px-8 py-6">
        {/* Meta row */}
        <div className="flex flex-wrap justify-between gap-6 pb-6 border-b border-line">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-1.5">Billed To</div>
            <div className="font-semibold text-ink">{client.name}</div>
            {client.company && <div className="text-sm text-ink-soft">{client.company}</div>}
            {client.phone && <div className="text-sm text-ink-soft">{client.phone}</div>}
            {client.email && <div className="text-sm text-ink-soft">{client.email}</div>}
          </div>
          <div className="text-sm space-y-1">
            <Row label="Issue Date" value={fmtDate(issueDate)} />
            <Row label={secondaryLabel} value={secondaryDate ? fmtDate(secondaryDate) : "—"} />
            <Row label="GSTIN" value={settings.gstin} />
            {status && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <span className="text-ink-faint">Status</span>
                {status}
              </div>
            )}
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full mt-6 min-w-[440px]">
          <thead>
            <tr className="border-b-2 border-plum-700 text-left">
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Description</th>
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft text-center w-16">Qty</th>
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft text-right w-28">Rate</th>
              <th className="py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((it, i) => (
              <tr key={i}>
                <td className="py-3 pr-2">
                  <div className="font-medium text-ink">{it.label}</div>
                  {it.detail && <div className="text-xs text-ink-faint mt-0.5">{it.detail}</div>}
                </td>
                <td className="py-3 text-center text-ink-soft tabular-nums">{it.quantity}</td>
                <td className="py-3 text-right text-ink-soft tabular-nums">{inr(it.unitPrice)}</td>
                <td className="py-3 text-right font-medium text-ink tabular-nums">{inr(lineAmount(it))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-ink-faint text-sm">No line items.</td></tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-4">
          <div className="w-full sm:w-72 space-y-1.5 text-sm">
            <Row label="Subtotal" value={inr(totals.subtotal)} />
            {discount > 0 && <Row label="Discount" value={"– " + inr(discount)} />}
            <Row label={`GST (${taxRate}%)`} value={inr(totals.tax)} />
            <div className="flex items-center justify-between border-t-2 border-plum-700 pt-2 mt-1">
              <span className="font-semibold text-ink">Grand Total</span>
              <span className="font-display text-xl font-bold text-brand-600 tabular-nums">{inr(totals.total)}</span>
            </div>
            {kind === "INVOICE" && (
              <>
                <Row label="Paid" value={inr(paid)} />
                <div className="flex items-center justify-between bg-cream-200 rounded-lg px-3 py-2 mt-1">
                  <span className="font-semibold text-ink">Balance Due</span>
                  <span className="font-bold text-maroon-600 tabular-nums">{inr(balance)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payments history (invoice) */}
        {kind === "INVOICE" && payments.length > 0 && (
          <div className="mt-6">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-2">Payments Received</div>
            <div className="rounded-lg border border-line divide-y divide-line text-sm">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2">
                  <span className="text-ink-soft">{fmtDate(p.paidAt)} · {p.method}{p.reference ? ` · ${p.reference}` : ""}</span>
                  <span className="font-medium text-ink tabular-nums">{inr(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes + bank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          <div className="space-y-4">
            {notes && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-1">Notes</div>
                <p className="text-sm text-ink-soft leading-relaxed">{notes}</p>
              </div>
            )}
            {terms && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-1">Terms & Conditions</div>
                <p className="text-sm text-ink-soft leading-relaxed">{terms}</p>
              </div>
            )}
          </div>
          {kind === "INVOICE" && showBank && (
            <div className="rounded-xl bg-cream-100 border border-line p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint mb-2">Payment Details</div>
              <div className="text-sm space-y-1 text-ink-soft">
                <Row label="Bank" value={settings.bankName} />
                <Row label="A/C No." value={settings.bankAccount} />
                <Row label="IFSC" value={settings.bankIfsc} />
                <Row label="UPI" value={settings.upiId} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-line text-center">
          <p className="font-display text-brand-600 text-sm">{settings.invoiceNotes}</p>
          <p className="text-xs text-ink-faint mt-2">
            {settings.phone} · {settings.email} · {settings.website}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-ink-faint">{label}</span>
      <span className="text-ink font-medium tabular-nums">{value}</span>
    </div>
  );
}
