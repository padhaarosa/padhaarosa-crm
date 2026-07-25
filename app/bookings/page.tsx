import Link from "next/link";
import { Plane, MapPin, Users2, CalendarClock, CheckCircle2, IndianRupee, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAgents, getLeadsLite } from "@/lib/data";
import { inr, inrCompact, fmtDate, nights, daysFromNow } from "@/lib/utils";
import { BOOKING_STATUS_META } from "@/lib/constants";
import { PageHeader, Card, StatTile, StatusBadge, Avatar, EmptyState } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import { BookingDialog } from "@/components/bookings/BookingDialog";

export const dynamic = "force-dynamic";

export default async function BookingsPage({
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
      { title: { contains: q } },
      { destination: { contains: q } },
      { reference: { contains: q } },
      { lead: { name: { contains: q } } },
    ];
  }

  const [bookings, leads, agents, all] = await Promise.all([
    prisma.booking.findMany({ where, include: { lead: true, agent: true, _count: { select: { days: true } } }, orderBy: { startDate: "asc" } }),
    getLeadsLite(),
    getAgents(),
    prisma.booking.findMany({ select: { status: true, totalAmount: true, startDate: true } }),
  ]);

  const confirmed = all.filter((b) => ["CONFIRMED", "ONGOING"].includes(b.status)).length;
  const upcoming = all.filter((b) => b.status !== "CANCELLED" && b.startDate.getTime() >= Date.now() - 86400000).length;
  const bookedValue = all.filter((b) => b.status !== "CANCELLED" && b.status !== "DRAFT").reduce((s, b) => s + b.totalAmount, 0);

  const statuses = [{ key: "", label: "All" }, ...Object.entries(BOOKING_STATUS_META).map(([key, m]) => ({ key, label: m.label }))];

  const mkHref = (patch: Record<string, string>) => {
    const merged = { q, status, ...patch };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.status) params.set("status", merged.status);
    const s = params.toString();
    return "/bookings" + (s ? `?${s}` : "");
  };

  return (
    <div>
      <PageHeader title="Bookings & Trips" subtitle="Every journey you're planning and running" icon={Plane}>
        <BookingDialog leads={leads} agents={agents} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Trips" value={String(all.length)} icon={Plane} tone="terracotta" />
        <StatTile label="Confirmed / Ongoing" value={String(confirmed)} icon={CheckCircle2} tone="green" />
        <StatTile label="Upcoming" value={String(upcoming)} icon={CalendarClock} tone="blue" />
        <StatTile label="Booked Value" value={inrCompact(bookedValue)} icon={IndianRupee} tone="violet" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form className="relative flex-1 max-w-sm" action="/bookings">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input name="q" defaultValue={q} placeholder="Search trips, destinations, customers…" className="input pl-9" />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      <div className="mb-5">
        <FilterChips chips={statuses.map((f) => ({ href: mkHref({ status: f.key }), label: f.label, active: status === f.key }))} />
      </div>

      {bookings.length === 0 ? (
        <Card>
          <EmptyState
            icon={Plane}
            title={q || status ? "No bookings match" : "No bookings yet"}
            message={q || status ? "Try clearing filters." : "Create your first trip to start building itineraries."}
            action={<BookingDialog leads={leads} agents={agents} />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bookings.map((b) => {
            const dleft = daysFromNow(b.startDate) ?? 0;
            return (
              <Link key={b.id} href={`/bookings/${b.id}`} className="card p-5 hover:shadow-pop transition group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-brand-600 tracking-wide">{b.reference}</div>
                    <h3 className="font-display text-lg font-semibold text-ink mt-0.5 truncate group-hover:text-brand-700">{b.title}</h3>
                  </div>
                  <StatusBadge meta={BOOKING_STATUS_META} status={b.status} />
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
                  <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" /> {b.destination}</div>
                  <div className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-brand-500" /> {fmtDate(b.startDate)} – {fmtDate(b.endDate)} · {nights(b.startDate, b.endDate)}N</div>
                  <div className="flex items-center gap-1.5"><Users2 className="h-4 w-4 text-brand-500" /> {b.pax} pax · {b._count.days} day plan</div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <Avatar name={b.lead.name} size={26} />
                    <span className="text-ink-soft truncate">{b.lead.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-ink">{inr(b.totalAmount)}</div>
                    {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                      <div className="text-[11px] text-ink-faint">{dleft <= 0 ? "In progress" : `${dleft}d to go`}</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
