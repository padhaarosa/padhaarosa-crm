import Link from "next/link";
import { Users, LayoutGrid, List, Phone, Mail, Search, Target, Trophy, Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAgents } from "@/lib/data";
import { inr, inrCompact, relativeDay } from "@/lib/utils";
import { LEAD_STAGE_META, PRIORITY_META } from "@/lib/constants";
import { PageHeader, Card, StatTile, Badge, Avatar, StatusBadge, EmptyState } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import { LeadDialog } from "@/components/leads/LeadDialog";
import { LeadBoard } from "@/components/leads/LeadBoard";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; view?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const stage = sp.stage ?? "";
  const view = sp.view === "list" ? "list" : "board";

  const where: any = {};
  if (stage) where.stage = stage;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { destination: { contains: q } },
      { company: { contains: q } },
    ];
  }

  const [leads, agents, allLeads] = await Promise.all([
    prisma.lead.findMany({ where, include: { agent: true }, orderBy: { updatedAt: "desc" } }),
    getAgents(),
    prisma.lead.findMany({ select: { stage: true, budget: true } }),
  ]);

  const active = allLeads.filter((l) => !["WON", "LOST"].includes(l.stage));
  const pipelineValue = active.reduce((s, l) => s + (l.budget ?? 0), 0);
  const won = allLeads.filter((l) => l.stage === "WON").length;
  const hot = allLeads.filter((l) => l.stage === "NEGOTIATION").length;

  const boardLeads = leads.map((l) => ({
    id: l.id,
    name: l.name,
    destination: l.destination,
    budget: l.budget,
    priority: l.priority,
    stage: l.stage,
    agentName: l.agent?.name ?? null,
  }));

  const stageFilters = [
    { key: "", label: "All" },
    ...Object.entries(LEAD_STAGE_META).map(([key, m]) => ({ key, label: m.label })),
  ];

  const mkHref = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    const merged = { q, stage, view, ...patch };
    if (merged.q) params.set("q", merged.q);
    if (merged.stage) params.set("stage", merged.stage);
    if (merged.view && merged.view !== "board") params.set("view", merged.view);
    const s = params.toString();
    return "/leads" + (s ? `?${s}` : "");
  };

  return (
    <div>
      <PageHeader title="Leads & Contacts" subtitle="Your enquiry pipeline, from first hello to booked trip" icon={Users}>
        <LeadDialog agents={agents} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Leads" value={String(allLeads.length)} icon={Users} tone="terracotta" />
        <StatTile label="Active Pipeline" value={inrCompact(pipelineValue)} sub={`${active.length} open`} icon={Target} tone="blue" />
        <StatTile label="In Negotiation" value={String(hot)} sub="Hot prospects" icon={Flame} tone="amber" />
        <StatTile label="Won" value={String(won)} sub="Converted" icon={Trophy} tone="green" />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form className="relative flex-1 max-w-sm" action="/leads">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, destination…"
            className="input pl-9"
          />
          {stage && <input type="hidden" name="stage" value={stage} />}
          {view === "list" && <input type="hidden" name="view" value="list" />}
        </form>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1 ml-auto">
          <Link scroll={false} href={mkHref({ view: "board" })} className={`btn-sm inline-flex items-center gap-1.5 rounded-lg ${view === "board" ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-cream-200"}`}>
            <LayoutGrid className="h-4 w-4" /> Board
          </Link>
          <Link scroll={false} href={mkHref({ view: "list" })} className={`btn-sm inline-flex items-center gap-1.5 rounded-lg ${view === "list" ? "bg-brand-500 text-white" : "text-ink-soft hover:bg-cream-200"}`}>
            <List className="h-4 w-4" /> List
          </Link>
        </div>
      </div>

      {/* Stage filter chips (list view) */}
      {view === "list" && (
        <div className="mb-4">
          <FilterChips chips={stageFilters.map((f) => ({ href: mkHref({ stage: f.key }), label: f.label, active: stage === f.key }))} />
        </div>
      )}

      {leads.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={q || stage ? "No leads match your filters" : "No leads yet"}
            message={q || stage ? "Try clearing the search or filters." : "Add your first enquiry to start building your pipeline."}
            action={<LeadDialog agents={agents} />}
          />
        </Card>
      ) : view === "board" ? (
        <LeadBoard leads={boardLeads} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-cream-100">
                <tr className="border-b border-line">
                  <th className="table-th">Lead</th>
                  <th className="table-th">Destination</th>
                  <th className="table-th">Stage</th>
                  <th className="table-th">Priority</th>
                  <th className="table-th text-right">Budget</th>
                  <th className="table-th">Agent</th>
                  <th className="table-th">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-cream-100 transition">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <Avatar name={l.name} size={38} />
                        <div className="min-w-0">
                          <Link href={`/leads/${l.id}`} className="font-semibold text-ink hover:text-brand-600 block truncate">
                            {l.name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-ink-faint">
                            {l.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{l.phone}</span>}
                            {l.email && <span className="inline-flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{l.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-ink-soft">{l.destination ?? "—"}</td>
                    <td className="table-td"><StatusBadge meta={LEAD_STAGE_META} status={l.stage} /></td>
                    <td className="table-td">
                      <Badge tone={PRIORITY_META[l.priority]?.tone ?? "slate"}>{PRIORITY_META[l.priority]?.label ?? l.priority}</Badge>
                    </td>
                    <td className="table-td text-right font-semibold">{l.budget ? inr(l.budget) : "—"}</td>
                    <td className="table-td">
                      {l.agent ? (
                        <span className="inline-flex items-center gap-2 text-sm">
                          <Avatar name={l.agent.name} size={26} /> <span className="text-ink-soft">{l.agent.name.split(" ")[0]}</span>
                        </span>
                      ) : (
                        <span className="text-ink-faint text-sm">Unassigned</span>
                      )}
                    </td>
                    <td className="table-td text-ink-faint text-xs">{relativeDay(l.updatedAt)}</td>
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
