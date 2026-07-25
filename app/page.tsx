import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  Users,
  Plane,
  ArrowUpRight,
  CalendarClock,
  IndianRupee,
  Target,
  MapPin,
  Bell,
  CalendarHeart,
  Share2,
  Users2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";
import { computeTotals, paymentTotal } from "@/lib/totals";
import { inr, inrCompact, fmtDate, relativeDay, daysFromNow } from "@/lib/utils";
import { LEAD_STAGE_META, LEAD_SOURCES, BOOKING_STATUS_META, INVOICE_STATUS_META, EVENT_TYPE_META, EVENT_STATUS_META, SOCIAL_META } from "@/lib/constants";
import { StatTile, Card, CardHeader, PageHeader, Badge, Avatar, StatusBadge } from "@/components/ui/primitives";
import { BarChart, HBars, DonutChart } from "@/components/ui/charts";
import { ChannelIcon } from "@/components/social/channelIcons";

function fmtFollowers(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [leads, bookings, invoices, payments, activities, agents, events, socialAccounts] = await Promise.all([
    prisma.lead.findMany({ include: { agent: true } }),
    prisma.booking.findMany({ include: { lead: true }, orderBy: { startDate: "asc" } }),
    prisma.invoice.findMany({ include: { items: true, payments: true, lead: true } }),
    prisma.payment.findMany({ select: { amount: true, paidAt: true } }),
    prisma.activity.findMany({
      where: { done: false, dueDate: { not: null } },
      include: { lead: true },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
    prisma.agent.findMany(),
    prisma.event.findMany({ where: { status: { not: "CANCELLED" } }, include: { assignments: true }, orderBy: { startDate: "asc" } }),
    prisma.socialAccount.findMany(),
  ]);
  const settings = await getSettings();

  const upcomingEvents = events.filter((e) => e.startDate.getTime() >= Date.now() - 86400000).slice(0, 4);
  const totalFollowers = socialAccounts.reduce((s, a) => s + a.followers, 0);
  const socialOrder = ["Instagram", "Facebook", "WhatsApp", "YouTube", "X", "LinkedIn"];
  const topChannels = [...socialAccounts].sort((a, b) => socialOrder.indexOf(a.channel) - socialOrder.indexOf(b.channel));

  // ---- KPI math ----
  const revenueCollected = payments.reduce((s, p) => s + p.amount, 0);

  let outstanding = 0;
  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    const { total } = computeTotals(inv.items, inv.taxRate, inv.discount);
    outstanding += Math.max(0, total - paymentTotal(inv.payments));
  }

  const activeLeads = leads.filter((l) => !["WON", "LOST"].includes(l.stage));
  const pipelineValue = activeLeads.reduce((s, l) => s + (l.budget ?? 0), 0);
  const won = leads.filter((l) => l.stage === "WON").length;
  const lost = leads.filter((l) => l.stage === "LOST").length;
  const conversion = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  const upcoming = bookings.filter(
    (b) => b.status !== "CANCELLED" && b.startDate.getTime() >= Date.now() - 86400000
  );
  const upcomingCount = upcoming.length;

  // ---- Monthly revenue (last 6 months) ----
  const now = new Date();
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${dt.getFullYear()}-${dt.getMonth()}`,
      label: dt.toLocaleString("en-IN", { month: "short" }),
      value: 0,
    });
  }
  for (const p of payments) {
    const dt = new Date(p.paidAt);
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.value += p.amount;
  }

  // ---- Pipeline funnel ----
  const pipeline = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATION", "WON"].map((stage) => ({
    label: LEAD_STAGE_META[stage].label,
    value: leads.filter((l) => l.stage === stage).length,
    color: LEAD_STAGE_META[stage].color,
  }));

  // ---- Lead sources ----
  const sourcePalette = ["#C15A3F", "#6E5F72", "#C9974E", "#7A3535", "#8A7A8E", "#A8432B"];
  const sources = LEAD_SOURCES.map((s, i) => ({
    label: s,
    value: leads.filter((l) => l.source === s).length,
    color: sourcePalette[i % sourcePalette.length],
  })).filter((s) => s.value > 0);

  const recentInvoices = [...invoices]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div>
      <PageHeader
        title={`${greeting} 👋`}
        subtitle={`Here's how ${settings.companyName} is travelling today.`}
      >
        <Link href="/leads?new=1" className="btn-primary">
          <Users className="h-4 w-4" /> Add Lead
        </Link>
        <Link href="/bookings?new=1" className="btn-secondary">
          <Plane className="h-4 w-4" /> New Booking
        </Link>
      </PageHeader>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatTile
          label="Revenue Collected"
          value={inrCompact(revenueCollected)}
          sub={`${payments.length} payments received`}
          icon={IndianRupee}
          tone="green"
        />
        <StatTile
          label="Outstanding Dues"
          value={inrCompact(outstanding)}
          sub={`${invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").length} invoices pending`}
          icon={Wallet}
          tone="amber"
        />
        <StatTile
          label="Pipeline Value"
          value={inrCompact(pipelineValue)}
          sub={`${activeLeads.length} active leads`}
          icon={Target}
          tone="terracotta"
        />
        <StatTile
          label="Upcoming Trips"
          value={String(upcomingCount)}
          sub={`Win rate ${conversion}%`}
          icon={Plane}
          tone="violet"
        />
      </div>

      {/* Revenue + pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue Trend"
            subtitle="Payments received over the last 6 months"
            icon={TrendingUp}
            action={<Badge tone="green" dot>Collected {inrCompact(revenueCollected)}</Badge>}
          />
          <div className="p-5">
            <BarChart data={months} money height={230} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Sales Pipeline" subtitle="Leads by stage" icon={Target} />
          <div className="p-5">
            <HBars data={pipeline} />
            <div className="mt-5 pt-4 border-t border-line flex items-center justify-between text-sm">
              <span className="text-ink-soft">Conversion (won / closed)</span>
              <span className="font-display text-lg font-semibold text-brand-600">{conversion}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming trips + follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming Departures"
            subtitle="Trips leaving soon"
            icon={CalendarClock}
            action={
              <Link href="/bookings" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                All bookings <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {upcoming.slice(0, 5).map((b) => {
              const dleft = daysFromNow(b.startDate) ?? 0;
              return (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream-100 transition"
                >
                  <div className="grid place-items-center h-12 w-12 rounded-xl bg-cream-200 text-brand-600 shrink-0">
                    <span className="font-display text-lg font-bold leading-none">
                      {b.startDate.getDate()}
                    </span>
                    <span className="text-[9px] uppercase tracking-wide">
                      {b.startDate.toLocaleString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink truncate">{b.title}</div>
                    <div className="text-xs text-ink-soft flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3" /> {b.destination} · {b.pax} pax · {b.lead.name}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge meta={BOOKING_STATUS_META} status={b.status} />
                    <div className="text-[11px] text-ink-faint mt-1">
                      {dleft <= 0 ? "In progress" : `${dleft} days to go`}
                    </div>
                  </div>
                </Link>
              );
            })}
            {upcoming.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-ink-soft">No upcoming trips scheduled.</div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Follow-ups Due"
            subtitle="Don't let a lead go cold"
            icon={Bell}
            action={<Badge tone="amber">{activities.length}</Badge>}
          />
          <div className="divide-y divide-line max-h-[360px] overflow-y-auto">
            {activities.map((a) => {
              const overdue = (daysFromNow(a.dueDate) ?? 0) < 0;
              return (
                <Link
                  key={a.id}
                  href={`/leads/${a.leadId}`}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-cream-100 transition"
                >
                  <Avatar name={a.lead.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink truncate">{a.title}</div>
                    <div className="text-xs text-ink-soft truncate">{a.lead.name}</div>
                  </div>
                  <span className={`text-[11px] font-semibold shrink-0 ${overdue ? "text-rose-500" : "text-ink-faint"}`}>
                    {relativeDay(a.dueDate)}
                  </span>
                </Link>
              );
            })}
            {activities.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-ink-soft">You're all caught up! 🎉</div>
            )}
          </div>
        </Card>
      </div>

      {/* Sources + recent invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Lead Sources" subtitle="Where enquiries come from" icon={Users} />
          <div className="p-5">
            <DonutChart
              data={sources}
              centerValue={String(leads.length)}
              centerLabel="Total leads"
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Invoices"
            subtitle="Latest billing activity"
            icon={IndianRupee}
            action={
              <Link href="/invoices" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className="table-th">Invoice</th>
                  <th className="table-th">Client</th>
                  <th className="table-th text-right">Amount</th>
                  <th className="table-th text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentInvoices.map((inv) => {
                  const { total } = computeTotals(inv.items, inv.taxRate, inv.discount);
                  return (
                    <tr key={inv.id} className="hover:bg-cream-100 transition">
                      <td className="table-td">
                        <Link href={`/invoices/${inv.id}`} className="font-semibold text-brand-700 hover:underline">
                          {inv.number}
                        </Link>
                        <div className="text-xs text-ink-faint">{fmtDate(inv.issueDate)}</div>
                      </td>
                      <td className="table-td">{inv.lead.name}</td>
                      <td className="table-td text-right font-semibold">{inr(total)}</td>
                      <td className="table-td text-right">
                        <StatusBadge meta={INVOICE_STATUS_META} status={inv.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Events + Social */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upcoming Events"
            subtitle="Weddings, MICE & group departures"
            icon={CalendarHeart}
            action={
              <Link href="/events" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                All events <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="divide-y divide-line">
            {upcomingEvents.map((e) => (
              <Link key={e.id} href={`/events/${e.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream-100 transition">
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-cream-200 text-brand-600 shrink-0">
                  <span className="font-display text-lg font-bold leading-none">{e.startDate.getDate()}</span>
                  <span className="text-[9px] uppercase tracking-wide">{e.startDate.toLocaleString("en-IN", { month: "short" })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-ink truncate">{e.title}</div>
                  <div className="text-xs text-ink-soft flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3 w-3" /> {e.location} · {e.guests} guests
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <Badge tone={EVENT_TYPE_META[e.type]?.tone ?? "slate"}>{e.type}</Badge>
                  <span className="text-[11px] text-ink-faint inline-flex items-center gap-1"><Users2 className="h-3 w-3" /> {e.assignments.length} team</span>
                </div>
              </Link>
            ))}
            {upcomingEvents.length === 0 && <div className="px-5 py-10 text-center text-sm text-ink-soft">No upcoming events.</div>}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Social Reach"
            subtitle={`${fmtFollowers(totalFollowers)} total followers`}
            icon={Share2}
            action={
              <Link href="/social" className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                Manage <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="p-4 space-y-2">
            {topChannels.map((a) => {
              const meta = SOCIAL_META[a.channel];
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-cream-100">
                  <span className="grid h-9 w-9 place-items-center rounded-lg text-white shrink-0" style={{ background: meta?.color }}>
                    <ChannelIcon channel={a.channel} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink">{meta?.label ?? a.channel}</div>
                    <div className="text-[11px] text-ink-faint truncate">{a.handle}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-ink">{fmtFollowers(a.followers)}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">▲ {a.growth}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
