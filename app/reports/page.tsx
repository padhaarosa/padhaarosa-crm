import { BarChart3, IndianRupee, TrendingUp, Plane, Star, Globe, Trophy, Hotel, Handshake } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { computeTotals, paymentTotal } from "@/lib/totals";
import { inr, inrCompact } from "@/lib/utils";
import { LEAD_STAGE_META, BOOKING_STATUS_META } from "@/lib/constants";
import { PageHeader, Card, CardHeader, StatTile } from "@/components/ui/primitives";
import { BarChart, DonutChart, HBars } from "@/components/ui/charts";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [payments, invoices, bookings, leads, tours, agents, guides, reviews, vendors, hotels] = await Promise.all([
    prisma.payment.findMany({ select: { amount: true, paidAt: true } }),
    prisma.invoice.findMany({ include: { items: true, payments: true } }),
    prisma.booking.findMany({ include: { agent: true } }),
    prisma.lead.findMany({ select: { stage: true, source: true } }),
    prisma.tour.findMany({ select: { category: true, style: true, destination: true, priceFrom: true } }),
    prisma.agent.findMany({ include: { bookings: { select: { totalAmount: true, status: true } } } }),
    prisma.guide.findMany({ select: { name: true, rating: true } }),
    prisma.review.findMany({ select: { rating: true, nps: true, type: true } }),
    prisma.vendor.findMany({ select: { name: true, outstanding: true } }),
    prisma.hotel.findMany({ select: { totalRooms: true, availableRooms: true } }),
  ]);

  const revenue = payments.reduce((s, p) => s + p.amount, 0);
  let outstanding = 0;
  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    const { total } = computeTotals(inv.items, inv.taxRate, inv.discount);
    outstanding += Math.max(0, total - paymentTotal(inv.payments));
  }
  const avgNps = reviews.length ? (reviews.reduce((s, r) => s + r.nps, 0) / reviews.length).toFixed(1) : "0";
  const totalRooms = hotels.reduce((s, h) => s + h.totalRooms, 0);
  const bookedRooms = hotels.reduce((s, h) => s + (h.totalRooms - h.availableRooms), 0);
  const occupancy = totalRooms ? Math.round((bookedRooms / totalRooms) * 100) : 0;

  // revenue trend (6 months)
  const now = new Date();
  const months: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${dt.getFullYear()}-${dt.getMonth()}`, label: dt.toLocaleString("en-IN", { month: "short" }), value: 0 });
  }
  for (const p of payments) {
    const dt = new Date(p.paidAt);
    const m = months.find((x) => x.key === `${dt.getFullYear()}-${dt.getMonth()}`);
    if (m) m.value += p.amount;
  }

  // tour category donut
  const tourCats = [
    { label: "Domestic", value: tours.filter((t) => t.category === "Domestic").length, color: "#C15A3F" },
    { label: "International", value: tours.filter((t) => t.category === "International").length, color: "#6E5F72" },
  ].filter((x) => x.value > 0);

  // booking status
  const bookingStatus = ["DRAFT", "CONFIRMED", "ONGOING", "COMPLETED"].map((st) => ({
    label: BOOKING_STATUS_META[st].label,
    value: bookings.filter((b) => b.status === st).length,
    color: st === "COMPLETED" ? "#10B981" : st === "CONFIRMED" ? "#0EA5E9" : st === "ONGOING" ? "#F59E0B" : "#94A3B8",
  }));

  // pipeline
  const pipeline = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATION", "WON"].map((s) => ({
    label: LEAD_STAGE_META[s].label,
    value: leads.filter((l) => l.stage === s).length,
    color: LEAD_STAGE_META[s].color,
  }));

  // agent leaderboard
  const leaderboard = agents
    .map((a) => ({ label: a.name.split(" ")[0], value: a.bookings.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.totalAmount, 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // destination performance (tour count by first destination word)
  const destMap = new Map<string, number>();
  for (const t of tours) {
    const first = t.destination.split(/[,•]/)[0].trim();
    destMap.set(first, (destMap.get(first) ?? 0) + 1);
  }
  const destPerf = [...destMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  // guide performance
  const guidePerf = guides.map((g) => ({ label: g.name.split(" ")[0], value: Math.round(g.rating * 20), sub: g.rating.toFixed(1) + "★" })).sort((a, b) => b.value - a.value).slice(0, 5);

  const vendorPayables = vendors.filter((v) => v.outstanding > 0).map((v) => ({ label: v.name, value: v.outstanding })).sort((a, b) => b.value - a.value);

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Business performance across sales, operations & quality" icon={BarChart3} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Revenue Collected" value={inrCompact(revenue)} icon={IndianRupee} tone="green" />
        <StatTile label="Outstanding" value={inrCompact(outstanding)} icon={TrendingUp} tone="amber" />
        <StatTile label="Hotel Occupancy" value={occupancy + "%"} sub={`${bookedRooms}/${totalRooms} rooms`} icon={Hotel} tone="blue" />
        <StatTile label="Avg NPS" value={avgNps} sub="Customer loyalty" icon={Star} tone="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue Trend" subtitle="Last 6 months" icon={TrendingUp} />
          <div className="p-5"><BarChart data={months} money height={230} /></div>
        </Card>
        <Card>
          <CardHeader title="Tours by Category" icon={Globe} />
          <div className="p-5"><DonutChart data={tourCats} centerValue={String(tours.length)} centerLabel="Tours" /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader title="Agent Leaderboard" subtitle="Booked value" icon={Trophy} />
          <div className="p-5"><HBars data={leaderboard.map((l) => ({ ...l, sub: inrCompact(l.value), color: "#C15A3F" }))} /></div>
        </Card>
        <Card>
          <CardHeader title="Sales Pipeline" subtitle="Leads by stage" icon={TrendingUp} />
          <div className="p-5"><HBars data={pipeline} /></div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader title="Destination Performance" subtitle="Tours offered" icon={Globe} />
          <div className="p-5"><HBars data={destPerf.map((d) => ({ ...d, color: "#6E5F72" }))} /></div>
        </Card>
        <Card>
          <CardHeader title="Guide Ratings" icon={Star} />
          <div className="p-5"><HBars data={guidePerf.map((g) => ({ ...g, color: "#C9974E" }))} /></div>
        </Card>
        <Card>
          <CardHeader title="Booking Status" icon={Plane} />
          <div className="p-5"><DonutChart data={bookingStatus.filter((b) => b.value > 0)} centerValue={String(bookings.length)} centerLabel="Trips" /></div>
        </Card>
      </div>

      {vendorPayables.length > 0 && (
        <Card>
          <CardHeader title="Vendor Payables" subtitle="Outstanding to suppliers" icon={Handshake} />
          <div className="p-5"><HBars data={vendorPayables.map((v) => ({ ...v, sub: inr(v.value), color: "#7A3535" }))} /></div>
        </Card>
      )}
    </div>
  );
}
