import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Users2,
  IndianRupee,
  UserCheck,
  Trash2,
  Plane,
  FileText,
  ReceiptIndianRupee,
  Radio,
  MessageSquare,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAgents } from "@/lib/data";
import { computeTotals } from "@/lib/totals";
import { inr, fmtDate } from "@/lib/utils";
import { LEAD_STAGE_META, PRIORITY_META, BOOKING_STATUS_META, QUOTE_STATUS_META, INVOICE_STATUS_META } from "@/lib/constants";
import { Card, CardHeader, Badge, Avatar, StatusBadge, BackLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { LeadDialog } from "@/components/leads/LeadDialog";
import { StageStepper } from "@/components/leads/StageStepper";
import { ActivityPanel } from "@/components/leads/ActivityPanel";
import { deleteLead } from "@/app/actions/leads";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lead, agents] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        agent: true,
        activities: { orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }] },
        bookings: { orderBy: { startDate: "desc" } },
        quotes: { include: { items: true }, orderBy: { createdAt: "desc" } },
        invoices: { include: { items: true, payments: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    getAgents(),
  ]);

  if (!lead) notFound();

  const meta = LEAD_STAGE_META[lead.stage];

  return (
    <div>
      <BackLink href="/leads" label="Back to leads" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          <Avatar name={lead.name} size={60} />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink truncate">{lead.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <StatusBadge meta={LEAD_STAGE_META} status={lead.stage} />
              <Badge tone={PRIORITY_META[lead.priority]?.tone ?? "slate"}>{PRIORITY_META[lead.priority]?.label} priority</Badge>
              <Badge tone="slate"><Radio className="h-3 w-3" /> {lead.source}</Badge>
            </div>
          </div>
        </div>
        <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="btn-secondary btn-sm sm:text-sm sm:px-4 sm:py-2.5"><Phone className="h-4 w-4" /> Call</a>
          )}
          {lead.phone && (
            <a
              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-sm sm:text-sm sm:px-4 sm:py-2.5"
            >
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </a>
          )}
          <LeadDialog agents={agents} lead={lead} variant="secondary" />
          <ConfirmButton
            action={deleteLead.bind(null, lead.id)}
            confirm={`Delete ${lead.name}? This removes all their activities, bookings, quotes and invoices.`}
            className="btn-danger btn-sm sm:text-sm sm:px-4 sm:py-2.5"
          >
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </div>
      </div>

      {/* Stage stepper */}
      <Card className="p-4 mb-6" >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint shrink-0">Move stage</span>
          <StageStepper leadId={lead.id} current={lead.stage} />
        </div>
        {lead.stage === "LOST" && lead.lostReason && (
          <p className="mt-3 text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">Lost reason: {lead.lostReason}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Activity & Follow-ups" subtitle="Every call, email and note in one timeline" icon={MessageSquare} />
            <div className="p-5">
              <ActivityPanel leadId={lead.id} activities={lead.activities} />
            </div>
          </Card>
        </div>

        {/* Right: details + related */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact & Trip" icon={UserCheck} />
            <div className="p-5 space-y-3.5 text-sm">
              <Detail icon={Phone} label="Phone" value={lead.phone} />
              <Detail icon={Mail} label="Email" value={lead.email} />
              <Detail icon={Building2} label="Company" value={lead.company} />
              <Detail icon={MapPin} label="Destination" value={lead.destination} />
              <Detail icon={Calendar} label="Travel date" value={lead.travelDate ? fmtDate(lead.travelDate) : null} />
              <Detail icon={Users2} label="Travellers" value={`${lead.pax} pax`} />
              <Detail icon={IndianRupee} label="Budget" value={lead.budget ? inr(lead.budget) : null} />
              <Detail
                icon={UserCheck}
                label="Assigned agent"
                value={lead.agent ? lead.agent.name : "Unassigned"}
              />
              {lead.notes && (
                <div className="pt-3 border-t border-line">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint mb-1">Notes</p>
                  <p className="text-ink-soft leading-relaxed">{lead.notes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Related records */}
          <Card>
            <CardHeader
              title="Bookings"
              icon={Plane}
              action={
                <Link href={`/bookings?new=1&leadId=${lead.id}`} className="btn-secondary btn-sm">
                  + New
                </Link>
              }
            />
            <div className="divide-y divide-line">
              {lead.bookings.map((b) => (
                <Link key={b.id} href={`/bookings/${b.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream-100">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm text-ink truncate">{b.title}</div>
                    <div className="text-xs text-ink-faint">{b.reference} · {fmtDate(b.startDate)}</div>
                  </div>
                  <StatusBadge meta={BOOKING_STATUS_META} status={b.status} />
                </Link>
              ))}
              {lead.bookings.length === 0 && <p className="px-5 py-4 text-sm text-ink-faint">No bookings yet.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Quotes"
              icon={FileText}
              action={
                <Link href={`/quotes?new=1&leadId=${lead.id}`} className="btn-secondary btn-sm">
                  + New
                </Link>
              }
            />
            <div className="divide-y divide-line">
              {lead.quotes.map((qt) => {
                const { total } = computeTotals(qt.items, qt.taxRate, qt.discount);
                return (
                  <Link key={qt.id} href={`/quotes/${qt.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream-100">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-ink truncate">{qt.number}</div>
                      <div className="text-xs text-ink-faint">{inr(total)}</div>
                    </div>
                    <StatusBadge meta={QUOTE_STATUS_META} status={qt.status} />
                  </Link>
                );
              })}
              {lead.quotes.length === 0 && <p className="px-5 py-4 text-sm text-ink-faint">No quotes yet.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Invoices"
              icon={ReceiptIndianRupee}
              action={
                <Link href={`/invoices?new=1&leadId=${lead.id}`} className="btn-secondary btn-sm">
                  + New
                </Link>
              }
            />
            <div className="divide-y divide-line">
              {lead.invoices.map((inv) => {
                const { total } = computeTotals(inv.items, inv.taxRate, inv.discount);
                return (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream-100">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-ink truncate">{inv.number}</div>
                      <div className="text-xs text-ink-faint">{inr(total)}</div>
                    </div>
                    <StatusBadge meta={INVOICE_STATUS_META} status={inv.status} />
                  </Link>
                );
              })}
              {lead.invoices.length === 0 && <p className="px-5 py-4 text-sm text-ink-faint">No invoices yet.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-200 text-ink-soft shrink-0">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-ink-faint">{label}</div>
        <div className="text-ink font-medium truncate">{value || "—"}</div>
      </div>
    </div>
  );
}
