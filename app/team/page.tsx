import { UsersRound, Phone, Mail, MapPin, Trophy, Building2, Target, Trash2, Users, Plane, CalendarHeart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { inr, inrCompact, fmtDate } from "@/lib/utils";
import { PageHeader, Card, StatTile, Avatar, Badge, Progress } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { EmployeeDialog } from "@/components/team/EmployeeDialog";
import { deleteEmployee } from "@/app/actions/team";

export const dynamic = "force-dynamic";

const deptTone: Record<string, "terracotta" | "blue" | "violet" | "amber" | "green" | "slate"> = {
  Leadership: "terracotta",
  Sales: "blue",
  Operations: "amber",
  Events: "violet",
  Marketing: "green",
  Support: "slate",
};

export default async function TeamPage() {
  const agents = await prisma.agent.findMany({
    include: {
      _count: { select: { leads: true, bookings: true, eventRoles: true } },
      bookings: { select: { totalAmount: true, status: true } },
      leads: { select: { stage: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  const enriched = agents.map((a) => {
    const bookedValue = a.bookings.filter((b) => b.status !== "CANCELLED").reduce((s, b) => s + b.totalAmount, 0);
    const won = a.leads.filter((l) => l.stage === "WON").length;
    const progress = a.target > 0 ? Math.round((bookedValue / a.target) * 100) : 0;
    return { ...a, bookedValue, won, progress };
  });

  const totalBooked = enriched.reduce((s, a) => s + a.bookedValue, 0);
  const departments = new Set(agents.map((a) => a.department)).size;
  const topPerformer = [...enriched].sort((a, b) => b.bookedValue - a.bookedValue)[0];

  return (
    <div>
      <PageHeader title="Team & Employees" subtitle="Everyone crafting journeys at Padhaaro Sa.." icon={UsersRound}>
        <EmployeeDialog />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Team Members" value={String(agents.length)} icon={Users} tone="terracotta" />
        <StatTile label="Departments" value={String(departments)} icon={Building2} tone="blue" />
        <StatTile label="Team Revenue" value={inrCompact(totalBooked)} sub="Booked value" icon={Target} tone="green" />
        <StatTile label="Top Performer" value={topPerformer?.name.split(" ")[0] ?? "—"} sub={topPerformer ? inrCompact(topPerformer.bookedValue) : ""} icon={Trophy} tone="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enriched.map((a) => (
          <Card key={a.id} className="p-5 group">
            <div className="flex items-start gap-3">
              <Avatar name={a.name} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-ink truncate">{a.name}</h3>
                  {topPerformer?.id === a.id && <Trophy className="h-4 w-4 text-gold-500 shrink-0" />}
                </div>
                <p className="text-sm text-ink-soft truncate">{a.designation}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge tone={deptTone[a.department] ?? "slate"}>{a.department}</Badge>
                  <Badge tone="slate">{a.role}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <EmployeeDialog employee={a} variant="secondary" label="" className="btn-sm !px-2" />
                <ConfirmButton
                  action={deleteEmployee.bind(null, a.id)}
                  confirm={`Remove ${a.name} from the team?`}
                  className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-sm text-ink-soft">
              {a.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-brand-500" /> {a.phone}</div>}
              <div className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 text-brand-500" /> {a.email}</div>
              <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-brand-500" /> {a.location} · joined {fmtDate(a.joinedAt)}</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat icon={Users} value={a._count.leads} label="Leads" />
              <Stat icon={Plane} value={a._count.bookings} label="Trips" />
              <Stat icon={CalendarHeart} value={a._count.eventRoles} label="Events" />
            </div>

            <div className="mt-4 pt-3 border-t border-line">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ink-faint">Target achievement</span>
                <span className="font-semibold text-ink">{inr(a.bookedValue)} / {inrCompact(a.target)}</span>
              </div>
              <Progress value={a.progress} barClass={a.progress >= 100 ? "bg-emerald-500" : a.progress >= 60 ? "bg-brand-500" : "bg-amber-500"} />
              <div className="text-right text-[11px] text-ink-faint mt-1">{a.progress}% of monthly target</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-cream-100 py-2.5">
      <Icon className="h-4 w-4 text-brand-500 mx-auto" />
      <div className="font-display text-lg font-semibold text-ink mt-1 leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}
