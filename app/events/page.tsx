import Link from "next/link";
import { CalendarHeart, Search, Users2, IndianRupee, CalendarClock, MapPin, Building } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLeadsLite } from "@/lib/data";
import { inr, inrCompact, fmtDate, nights, daysFromNow } from "@/lib/utils";
import { EVENT_TYPE_META, EVENT_STATUS_META } from "@/lib/constants";
import { PageHeader, Card, StatTile, Badge, StatusBadge, Avatar, EmptyState } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import { EventDialog } from "@/components/events/EventDialog";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = sp.status ?? "";

  const where: any = {};
  if (status) where.status = status;
  if (q) where.OR = [{ title: { contains: q } }, { location: { contains: q } }, { venue: { contains: q } }];

  const [events, leads, all] = await Promise.all([
    prisma.event.findMany({ where, include: { lead: true, assignments: { include: { agent: true } } }, orderBy: { startDate: "asc" } }),
    getLeadsLite(),
    prisma.event.findMany({ select: { status: true, startDate: true, guests: true, budget: true } }),
  ]);

  const upcoming = all.filter((e) => e.status !== "CANCELLED" && e.startDate.getTime() >= Date.now() - 86400000).length;
  const totalGuests = all.reduce((s, e) => s + e.guests, 0);
  const pipelineBudget = all.filter((e) => e.status !== "CANCELLED").reduce((s, e) => s + e.budget, 0);

  const statuses = [{ key: "", label: "All" }, ...Object.entries(EVENT_STATUS_META).map(([key, m]) => ({ key, label: m.label }))];
  const mkHref = (patch: Record<string, string>) => {
    const merged = { q, status, ...patch };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.status) params.set("status", merged.status);
    const s = params.toString();
    return "/events" + (s ? `?${s}` : "");
  };

  return (
    <div>
      <PageHeader title="Events & MICE" subtitle="Weddings, corporate offsites, festivals & group departures" icon={CalendarHeart}>
        <EventDialog leads={leads} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Events" value={String(all.length)} icon={CalendarHeart} tone="terracotta" />
        <StatTile label="Upcoming" value={String(upcoming)} icon={CalendarClock} tone="blue" />
        <StatTile label="Total Guests" value={String(totalGuests)} icon={Users2} tone="violet" />
        <StatTile label="Pipeline Value" value={inrCompact(pipelineBudget)} icon={IndianRupee} tone="green" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form className="relative flex-1 max-w-sm" action="/events">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input name="q" defaultValue={q} placeholder="Search events, venues, cities…" className="input pl-9" />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      <div className="mb-5">
        <FilterChips chips={statuses.map((f) => ({ href: mkHref({ status: f.key }), label: f.label, active: status === f.key }))} />
      </div>

      {events.length === 0 ? (
        <Card>
          <EmptyState icon={CalendarHeart} title={q || status ? "No events match" : "No events yet"} message="Plan your first destination wedding or corporate event." action={<EventDialog leads={leads} />} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((e) => {
            const dleft = daysFromNow(e.startDate) ?? 0;
            return (
              <Link key={e.id} href={`/events/${e.id}`} className="card p-5 hover:shadow-pop transition group">
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={EVENT_TYPE_META[e.type]?.tone ?? "slate"}>{e.type}</Badge>
                  <StatusBadge meta={EVENT_STATUS_META} status={e.status} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mt-3 group-hover:text-brand-700 leading-snug">{e.title}</h3>

                <div className="mt-3 space-y-1.5 text-sm text-ink-soft">
                  <div className="flex items-center gap-1.5"><CalendarClock className="h-4 w-4 text-brand-500" /> {fmtDate(e.startDate)} – {fmtDate(e.endDate)} · {nights(e.startDate, e.endDate) + 1}D</div>
                  <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-500" /> {e.location}</div>
                  {e.venue && <div className="flex items-center gap-1.5"><Building className="h-4 w-4 text-brand-500" /> {e.venue}</div>}
                  <div className="flex items-center gap-1.5"><Users2 className="h-4 w-4 text-brand-500" /> {e.guests} guests</div>
                </div>

                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {e.assignments.slice(0, 4).map((a) => (
                      <span key={a.id} className="ring-2 ring-white rounded-full"><Avatar name={a.agent.name} size={28} /></span>
                    ))}
                    {e.assignments.length > 4 && (
                      <span className="grid place-items-center h-7 w-7 rounded-full bg-cream-200 text-[10px] font-bold text-ink-soft ring-2 ring-white">+{e.assignments.length - 4}</span>
                    )}
                    {e.assignments.length === 0 && <span className="text-xs text-ink-faint">No team yet</span>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-ink">{inrCompact(e.budget)}</div>
                    {e.status !== "CANCELLED" && e.status !== "COMPLETED" && dleft > 0 && <div className="text-[11px] text-ink-faint">{dleft}d to go</div>}
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
