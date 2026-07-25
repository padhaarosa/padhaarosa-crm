import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plane,
  MapPin,
  CalendarClock,
  Users2,
  IndianRupee,
  Route,
  Trash2,
  ReceiptIndianRupee,
  UserCheck,
  Phone,
  StickyNote,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAgents, getLeadsLite } from "@/lib/data";
import { computeTotals } from "@/lib/totals";
import { inr, fmtDate, nights } from "@/lib/utils";
import { BOOKING_STATUS_META, INVOICE_STATUS_META } from "@/lib/constants";
import { Card, CardHeader, StatusBadge, Avatar, BackLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { BookingDialog } from "@/components/bookings/BookingDialog";
import { BookingStatusBar } from "@/components/bookings/BookingStatusBar";
import { ItineraryBuilder } from "@/components/bookings/ItineraryBuilder";
import { TripMap } from "@/components/maps/TripMap";
import { Map } from "lucide-react";
import { deleteBooking } from "@/app/actions/bookings";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [booking, leads, agents] = await Promise.all([
    prisma.booking.findUnique({
      where: { id },
      include: {
        lead: true,
        agent: true,
        days: { orderBy: { dayNumber: "asc" } },
        invoices: { include: { items: true, payments: true } },
      },
    }),
    getLeadsLite(),
    getAgents(),
  ]);

  if (!booking) notFound();

  const nightsCount = nights(booking.startDate, booking.endDate);

  // Build a route from itinerary stops (unique, in order); fall back to the destination.
  const dayLocations = booking.days.map((d) => d.location).filter(Boolean) as string[];
  const uniqueStops: string[] = [];
  for (const loc of dayLocations) {
    if (!uniqueStops.length || uniqueStops[uniqueStops.length - 1].toLowerCase() !== loc.toLowerCase()) {
      uniqueStops.push(loc);
    }
  }
  const tripStops = uniqueStops.length
    ? uniqueStops
    : booking.destination.split(/\s*(?:→|->|—|–|•|\bto\b|,|\/)\s*/i).map((s) => s.trim()).filter(Boolean);

  return (
    <div>
      <BackLink href="/bookings" label="Back to bookings" />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft shrink-0">
            <Plane className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-brand-600 tracking-wide">{booking.reference}</div>
            <h1 className="font-display text-2xl font-semibold text-ink truncate">{booking.title}</h1>
            <div className="text-sm text-ink-soft flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5" /> {booking.destination}
            </div>
          </div>
        </div>
        <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
          <Link href={`/invoices?new=1&leadId=${booking.leadId}&bookingId=${booking.id}`} className="btn-secondary btn-sm sm:text-sm sm:px-4 sm:py-2.5">
            <ReceiptIndianRupee className="h-4 w-4" /> Invoice
          </Link>
          <BookingDialog leads={leads} agents={agents} booking={booking} variant="secondary" />
          <ConfirmButton
            action={deleteBooking.bind(null, booking.id)}
            confirm="Delete this booking and its itinerary?"
            className="btn-danger btn-sm sm:text-sm sm:px-4 sm:py-2.5"
          >
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryTile icon={CalendarClock} label="Duration" value={`${nightsCount}N / ${nightsCount + 1}D`} sub={`${fmtDate(booking.startDate)} – ${fmtDate(booking.endDate)}`} />
        <SummaryTile icon={Users2} label="Travellers" value={`${booking.pax} pax`} sub={`${booking.adults} adults · ${booking.children} children`} />
        <SummaryTile icon={IndianRupee} label="Package" value={inr(booking.totalAmount)} sub="Total quoted" />
        <SummaryTile icon={Route} label="Itinerary" value={`${booking.days.length} days`} sub="Planned" />
      </div>

      {/* Status */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint shrink-0">Trip status</span>
          <BookingStatusBar bookingId={booking.id} current={booking.status} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tripStops.length > 0 && (
            <Card>
              <CardHeader title="Trip Route" subtitle="Journey map across destinations" icon={Map} />
              <div className="p-5">
                <TripMap stops={tripStops} />
              </div>
            </Card>
          )}
          <Card>
            <CardHeader title="Itinerary" subtitle="Day-by-day travel plan" icon={Route} />
            <div className="p-5">
              <ItineraryBuilder bookingId={booking.id} days={booking.days} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" icon={UserCheck} />
            <div className="p-5">
              <Link href={`/leads/${booking.leadId}`} className="flex items-center gap-3 group">
                <Avatar name={booking.lead.name} size={44} />
                <div className="min-w-0">
                  <div className="font-semibold text-ink group-hover:text-brand-600 truncate">{booking.lead.name}</div>
                  {booking.lead.phone && (
                    <div className="text-sm text-ink-soft flex items-center gap-1.5"><Phone className="h-3 w-3" /> {booking.lead.phone}</div>
                  )}
                </div>
              </Link>
              <div className="mt-4 pt-4 border-t border-line space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-faint">Agent</span><span className="text-ink font-medium">{booking.agent?.name ?? "Unassigned"}</span></div>
                <div className="flex justify-between"><span className="text-ink-faint">Booked on</span><span className="text-ink font-medium">{fmtDate(booking.createdAt)}</span></div>
              </div>
            </div>
          </Card>

          {booking.notes && (
            <Card>
              <CardHeader title="Notes" icon={StickyNote} />
              <div className="p-5 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{booking.notes}</div>
            </Card>
          )}

          <Card>
            <CardHeader title="Invoices" icon={ReceiptIndianRupee} action={
              <Link href={`/invoices?new=1&leadId=${booking.leadId}&bookingId=${booking.id}`} className="btn-secondary btn-sm">+ New</Link>
            } />
            <div className="divide-y divide-line">
              {booking.invoices.map((inv) => {
                const { total } = computeTotals(inv.items, inv.taxRate, inv.discount);
                return (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream-100">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-ink">{inv.number}</div>
                      <div className="text-xs text-ink-faint">{inr(total)}</div>
                    </div>
                    <StatusBadge meta={INVOICE_STATUS_META} status={inv.status} />
                  </Link>
                );
              })}
              {booking.invoices.length === 0 && <p className="px-5 py-4 text-sm text-ink-faint">No invoices yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-faint">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 font-display text-lg font-semibold text-ink">{value}</div>
      {sub && <div className="text-xs text-ink-faint mt-0.5 truncate">{sub}</div>}
    </Card>
  );
}
