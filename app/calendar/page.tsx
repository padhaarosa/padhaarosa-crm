import Link from "next/link";
import { Calendar, PlaneTakeoff, PlaneLanding, CalendarHeart, Bell, FileWarning, MapPin, CalendarClock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { fmtDate, relativeDay, daysFromNow } from "@/lib/utils";
import { PageHeader, Card, StatTile, Badge } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import type { Tone } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Entry = {
  date: Date;
  kind: string;
  tone: Tone;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  href?: string;
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const sp = await searchParams;
  const type = sp.type ?? "";

  const [bookings, flights, events, activities, documents] = await Promise.all([
    prisma.booking.findMany({ where: { status: { not: "CANCELLED" } }, include: { lead: true } }),
    prisma.flight.findMany({ where: { departAt: { not: null } } }),
    prisma.event.findMany({ where: { status: { not: "CANCELLED" } } }),
    prisma.activity.findMany({ where: { done: false, dueDate: { not: null } }, include: { lead: true } }),
    prisma.travelDocument.findMany({ where: { expiresAt: { not: null } } }),
  ]);

  const entries: Entry[] = [];
  for (const b of bookings) {
    entries.push({ date: b.startDate, kind: "Departure", tone: "blue", icon: PlaneTakeoff, title: b.title, subtitle: `${b.destination} · ${b.lead.name}`, href: `/bookings/${b.id}` });
    entries.push({ date: b.endDate, kind: "Return", tone: "slate", icon: PlaneLanding, title: `${b.title} — return`, subtitle: `${b.pax} pax · ${b.lead.name}`, href: `/bookings/${b.id}` });
  }
  for (const f of flights) {
    if (f.departAt) entries.push({ date: f.departAt, kind: "Flight", tone: "violet", icon: PlaneTakeoff, title: `${f.airline} ${f.flightNo ?? ""}`, subtitle: `${f.fromCity} → ${f.toCity}${f.pnr ? ` · PNR ${f.pnr}` : ""}`, href: `/travel/flights` });
  }
  for (const e of events) {
    entries.push({ date: e.startDate, kind: "Event", tone: "terracotta", icon: CalendarHeart, title: e.title, subtitle: `${e.type} · ${e.location} · ${e.guests} guests`, href: `/events/${e.id}` });
  }
  for (const a of activities) {
    if (a.dueDate) entries.push({ date: a.dueDate, kind: "Follow-up", tone: "amber", icon: Bell, title: a.title, subtitle: a.lead.name, href: `/leads/${a.leadId}` });
  }
  for (const d of documents) {
    if (d.expiresAt) entries.push({ date: d.expiresAt, kind: "Doc Expiry", tone: "red", icon: FileWarning, title: `${d.title} expires`, subtitle: `${d.type}${d.owner ? ` · ${d.owner}` : ""}`, href: `/travel/documents` });
  }

  const filtered = entries
    .filter((e) => !type || e.kind === type)
    .filter((e) => {
      const dl = daysFromNow(e.date) ?? 0;
      return dl >= -14 && dl <= 180;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // group by date key
  const groups = new Map<string, Entry[]>();
  for (const e of filtered) {
    const key = e.date.toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  const types = ["Departure", "Return", "Flight", "Event", "Follow-up", "Doc Expiry"];
  const count = (k: string) => entries.filter((e) => e.kind === k).length;

  return (
    <div>
      <PageHeader title="Travel Calendar" subtitle="Departures, arrivals, flights, events, follow-ups & document expiries" icon={Calendar} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Departures" value={String(count("Departure"))} icon={PlaneTakeoff} tone="blue" />
        <StatTile label="Flights" value={String(count("Flight"))} icon={PlaneTakeoff} tone="violet" />
        <StatTile label="Events" value={String(count("Event"))} icon={CalendarHeart} tone="terracotta" />
        <StatTile label="Follow-ups" value={String(count("Follow-up"))} icon={Bell} tone="amber" />
      </div>

      <div className="mb-5">
        <FilterChips
          chips={[
            { href: "/calendar", label: "All", active: type === "" },
            ...types.map((t) => ({ href: `/calendar?type=${encodeURIComponent(t)}`, label: t, active: type === t })),
          ]}
        />
      </div>

      {groups.size === 0 ? (
        <Card><div className="py-16 text-center text-ink-soft">Nothing scheduled in this window.</div></Card>
      ) : (
        <div className="space-y-4">
          {[...groups.entries()].map(([key, items]) => {
            const date = new Date(key);
            return (
              <Card key={key} className="overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 bg-cream-100 border-b border-line">
                  <div className="grid place-items-center h-11 w-11 rounded-xl bg-white border border-line shrink-0">
                    <span className="font-display text-lg font-bold text-brand-600 leading-none">{date.getDate()}</span>
                    <span className="text-[9px] uppercase tracking-wide text-ink-faint">{date.toLocaleString("en-IN", { month: "short" })}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
                    <div className="text-xs text-ink-faint">{relativeDay(date)} · {items.length} item{items.length > 1 ? "s" : ""}</div>
                  </div>
                </div>
                <div className="divide-y divide-line">
                  {items.map((e, i) => {
                    const Icon = e.icon;
                    const inner = (
                      <div className="flex items-center gap-3 px-5 py-3 hover:bg-cream-100 transition">
                        <span className={`grid h-9 w-9 place-items-center rounded-lg shrink-0 ${toneBg(e.tone)}`}><Icon className="h-4 w-4" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-ink truncate">{e.title}</div>
                          <div className="text-xs text-ink-soft flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {e.subtitle}</div>
                        </div>
                        <Badge tone={e.tone}>{e.kind}</Badge>
                      </div>
                    );
                    return e.href ? <Link key={i} href={e.href}>{inner}</Link> : <div key={i}>{inner}</div>;
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function toneBg(tone: Tone) {
  const map: Record<Tone, string> = {
    terracotta: "bg-brand-50 text-brand-600",
    blue: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return map[tone];
}
