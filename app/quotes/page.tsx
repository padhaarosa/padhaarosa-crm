import Link from "next/link";
import { FileText, Search, Send, CheckCircle2, IndianRupee } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLeadsLite } from "@/lib/data";
import { computeTotals } from "@/lib/totals";
import { inr, inrCompact, fmtDate } from "@/lib/utils";
import { QUOTE_STATUS_META } from "@/lib/constants";
import { PageHeader, Card, StatTile, StatusBadge, Avatar, EmptyState } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import { QuoteDialog } from "@/components/quotes/QuoteDialog";

export const dynamic = "force-dynamic";

export default async function QuotesPage({
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
      { title: { contains: q } },
      { lead: { name: { contains: q } } },
    ];
  }

  const [quotes, leads] = await Promise.all([
    prisma.quote.findMany({ where, include: { lead: true, items: true }, orderBy: { createdAt: "desc" } }),
    getLeadsLite(),
  ]);

  const withTotals = quotes.map((qt) => ({ ...qt, total: computeTotals(qt.items, qt.taxRate, qt.discount).total }));
  const sentCount = quotes.filter((qt) => qt.status === "SENT").length;
  const acceptedValue = withTotals.filter((qt) => qt.status === "ACCEPTED").reduce((s, qt) => s + qt.total, 0);
  const openValue = withTotals.filter((qt) => ["DRAFT", "SENT"].includes(qt.status)).reduce((s, qt) => s + qt.total, 0);

  const statuses = [{ key: "", label: "All" }, ...Object.entries(QUOTE_STATUS_META).map(([key, m]) => ({ key, label: m.label }))];
  const mkHref = (patch: Record<string, string>) => {
    const merged = { q, status, ...patch };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.status) params.set("status", merged.status);
    const s = params.toString();
    return "/quotes" + (s ? `?${s}` : "");
  };

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Branded quotes that win trips" icon={FileText}>
        <QuoteDialog leads={leads} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Quotes" value={String(quotes.length)} icon={FileText} tone="terracotta" />
        <StatTile label="Sent" value={String(sentCount)} icon={Send} tone="blue" />
        <StatTile label="Open Value" value={inrCompact(openValue)} icon={IndianRupee} tone="amber" />
        <StatTile label="Accepted Value" value={inrCompact(acceptedValue)} icon={CheckCircle2} tone="green" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form className="relative flex-1 max-w-sm" action="/quotes">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input name="q" defaultValue={q} placeholder="Search quote no., title, customer…" className="input pl-9" />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      <div className="mb-5">
        <FilterChips chips={statuses.map((f) => ({ href: mkHref({ status: f.key }), label: f.label, active: status === f.key }))} />
      </div>

      {withTotals.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="No quotations yet" message="Create a branded quote to send to a customer." action={<QuoteDialog leads={leads} />} />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-cream-100">
                <tr className="border-b border-line">
                  <th className="table-th">Quote</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th">Title</th>
                  <th className="table-th text-right">Amount</th>
                  <th className="table-th">Valid Until</th>
                  <th className="table-th text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {withTotals.map((qt) => (
                  <tr key={qt.id} className="hover:bg-cream-100 transition">
                    <td className="table-td">
                      <Link href={`/quotes/${qt.id}`} className="font-semibold text-brand-700 hover:underline">{qt.number}</Link>
                      <div className="text-xs text-ink-faint">{fmtDate(qt.issueDate)}</div>
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-2"><Avatar name={qt.lead.name} size={26} /> <span className="text-ink-soft">{qt.lead.name}</span></span>
                    </td>
                    <td className="table-td text-ink-soft max-w-[220px] truncate">{qt.title}</td>
                    <td className="table-td text-right font-semibold">{inr(qt.total)}</td>
                    <td className="table-td text-ink-soft text-sm">{qt.validUntil ? fmtDate(qt.validUntil) : "—"}</td>
                    <td className="table-td text-right"><StatusBadge meta={QUOTE_STATUS_META} status={qt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
