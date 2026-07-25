import Link from "next/link";
import { ReceiptIndianRupee, Search, Wallet, IndianRupee, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLeadsLite } from "@/lib/data";
import { computeTotals, paymentTotal } from "@/lib/totals";
import { inr, inrCompact, fmtDate, daysFromNow } from "@/lib/utils";
import { INVOICE_STATUS_META } from "@/lib/constants";
import { PageHeader, Card, StatTile, StatusBadge, Avatar, EmptyState } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "";

  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { number: { contains: q } },
      { lead: { name: { contains: q } } },
    ];
  }

  const [invoices, leads, bookings] = await Promise.all([
    prisma.invoice.findMany({ where, include: { lead: true, items: true, payments: true }, orderBy: { createdAt: "desc" } }),
    getLeadsLite(),
    prisma.booking.findMany({ select: { id: true, reference: true, title: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const bookingOpts = bookings.map((b) => ({ id: b.id, label: `${b.reference} · ${b.title}` }));

  const rows = invoices.map((inv) => {
    const { total } = computeTotals(inv.items, inv.taxRate, inv.discount);
    const paid = paymentTotal(inv.payments);
    return { ...inv, total, paid, balance: Math.max(0, total - paid) };
  });

  const totalInvoiced = rows.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + r.total, 0);
  const collected = rows.reduce((s, r) => s + r.paid, 0);
  const outstanding = rows.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + r.balance, 0);
  const overdue = rows.filter((r) => r.status !== "PAID" && r.status !== "CANCELLED" && r.dueDate && (daysFromNow(r.dueDate) ?? 0) < 0).length;

  const statuses = [{ key: "", label: "All" }, ...Object.entries(INVOICE_STATUS_META).map(([key, m]) => ({ key, label: m.label }))];
  const mkHref = (patch: Record<string, string>) => {
    const merged = { q, status, ...patch };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.status) params.set("status", merged.status);
    const s = params.toString();
    return "/invoices" + (s ? `?${s}` : "");
  };

  return (
    <div>
      <PageHeader title="Invoices & Payments" subtitle="Bill customers and track every rupee" icon={ReceiptIndianRupee}>
        <InvoiceDialog leads={leads} bookings={bookingOpts} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Invoiced" value={inrCompact(totalInvoiced)} icon={ReceiptIndianRupee} tone="terracotta" />
        <StatTile label="Collected" value={inrCompact(collected)} icon={IndianRupee} tone="green" />
        <StatTile label="Outstanding" value={inrCompact(outstanding)} icon={Wallet} tone="amber" />
        <StatTile label="Overdue" value={String(overdue)} sub="Need chasing" icon={AlertTriangle} tone="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form className="relative flex-1 max-w-sm" action="/invoices">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input name="q" defaultValue={q} placeholder="Search invoice no., customer…" className="input pl-9" />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      <div className="mb-5">
        <FilterChips chips={statuses.map((f) => ({ href: mkHref({ status: f.key }), label: f.label, active: status === f.key }))} />
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={ReceiptIndianRupee} title="No invoices yet" message="Raise your first branded invoice." action={<InvoiceDialog leads={leads} bookings={bookingOpts} />} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-cream-100">
                <tr className="border-b border-line">
                  <th className="table-th">Invoice</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th text-right">Total</th>
                  <th className="table-th text-right">Balance</th>
                  <th className="table-th">Due</th>
                  <th className="table-th text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((inv) => {
                  const od = inv.status !== "PAID" && inv.dueDate && (daysFromNow(inv.dueDate) ?? 0) < 0;
                  return (
                    <tr key={inv.id} className="hover:bg-cream-100 transition">
                      <td className="table-td">
                        <Link href={`/invoices/${inv.id}`} className="font-semibold text-brand-700 hover:underline">{inv.number}</Link>
                        <div className="text-xs text-ink-faint">{fmtDate(inv.issueDate)}</div>
                      </td>
                      <td className="table-td">
                        <span className="inline-flex items-center gap-2"><Avatar name={inv.lead.name} size={26} /> <span className="text-ink-soft">{inv.lead.name}</span></span>
                      </td>
                      <td className="table-td text-right font-semibold">{inr(inv.total)}</td>
                      <td className="table-td text-right">
                        <span className={inv.balance > 0 ? "text-maroon-600 font-semibold" : "text-emerald-600"}>{inr(inv.balance)}</span>
                      </td>
                      <td className="table-td text-sm">
                        <span className={od ? "text-rose-500 font-medium" : "text-ink-soft"}>{inv.dueDate ? fmtDate(inv.dueDate) : "—"}</span>
                      </td>
                      <td className="table-td text-right"><StatusBadge meta={INVOICE_STATUS_META} status={inv.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
