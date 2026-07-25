import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarHeart, CalendarClock, Users2, IndianRupee, UsersRound, MapPin, Building, Trash2, StickyNote, UserCheck, Map, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLeadsLite, getAgents } from "@/lib/data";
import { inr, fmtDate, nights } from "@/lib/utils";
import { EVENT_TYPE_META, EVENT_STATUS_META } from "@/lib/constants";
import { Card, CardHeader, Badge, StatusBadge, BackLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EventDialog } from "@/components/events/EventDialog";
import { EventStatusBar } from "@/components/events/EventStatusBar";
import { TeamAssign } from "@/components/events/TeamAssign";
import { TripMap } from "@/components/maps/TripMap";
import { deleteEvent } from "@/app/actions/events";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, leads, agents] = await Promise.all([
    prisma.event.findUnique({ where: { id }, include: { lead: true, assignments: { include: { agent: true } } } }),
    getLeadsLite(),
    getAgents(),
  ]);

  if (!event) notFound();

  const stops = event.location.split(/\s*(?:→|->|—|–|•|\bto\b|,|\/)\s*/i).map((s) => s.trim()).filter(Boolean);
  const days = nights(event.startDate, event.endDate) + 1;

  return (
    <div>
      <BackLink href="/events" label="Back to events" />

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500 text-white shadow-soft shrink-0">
            <CalendarHeart className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={EVENT_TYPE_META[event.type]?.tone ?? "slate"}>{event.type}</Badge>
              <StatusBadge meta={EVENT_STATUS_META} status={event.status} />
            </div>
            <h1 className="font-display text-2xl font-semibold text-ink truncate">{event.title}</h1>
          </div>
        </div>
        <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
          <EventDialog leads={leads} event={event} variant="secondary" />
          <ConfirmButton action={deleteEvent.bind(null, event.id)} confirm="Delete this event?" className="btn-danger btn-sm sm:text-sm sm:px-4 sm:py-2.5">
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile icon={CalendarClock} label="Dates" value={`${days} days`} sub={`${fmtDate(event.startDate)} – ${fmtDate(event.endDate)}`} />
        <Tile icon={Users2} label="Guests" value={String(event.guests)} sub="Expected" />
        <Tile icon={IndianRupee} label="Budget" value={inr(event.budget)} sub="Estimated" />
        <Tile icon={UsersRound} label="Team" value={String(event.assignments.length)} sub="Assigned" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint shrink-0 inline-flex items-center gap-1.5"><SlidersHorizontal className="h-3.5 w-3.5" /> Status</span>
          <EventStatusBar eventId={event.id} current={event.status} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Route & Venue" subtitle="Where it all happens" icon={Map} />
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                <Info icon={MapPin} label="Location / Route" value={event.location} />
                <Info icon={Building} label="Venue" value={event.venue} />
                <Info icon={UserCheck} label="Client" value={event.lead?.name} href={event.lead ? `/leads/${event.leadId}` : undefined} />
              </div>
              <TripMap stops={stops} />
            </div>
          </Card>

          {event.notes && (
            <Card>
              <CardHeader title="Event Brief" icon={StickyNote} />
              <div className="p-5 text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{event.notes}</div>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader title="Events Team" subtitle={`${event.assignments.length} assigned`} icon={UsersRound} />
            <TeamAssign eventId={event.id} assignments={event.assignments} agents={agents} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, sub }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-faint"><Icon className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
      <div className="mt-2 font-display text-lg font-semibold text-ink">{value}</div>
      {sub && <div className="text-xs text-ink-faint mt-0.5 truncate">{sub}</div>}
    </Card>
  );
}

function Info({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null | undefined; href?: string }) {
  const content = (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-200 text-ink-soft shrink-0"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</div>
        <div className="text-ink font-medium truncate">{value || "—"}</div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="hover:opacity-80">{content}</Link> : content;
}
