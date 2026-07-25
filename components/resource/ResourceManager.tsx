"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Share2, Check } from "lucide-react";
import type { ResourceSpec, Field } from "@/lib/resources";
import { Modal } from "@/components/ui/Modal";
import { Field as FormField, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PageHeader, Card, StatTile, Badge, EmptyState } from "@/components/ui/primitives";
import { getIcon } from "@/components/ui/Icon";
import { inr, inrCompact, fmtDate, dateInputValue, cn } from "@/lib/utils";
import type { Tone } from "@/lib/constants";
import { saveResource, removeResource, shareResourceToSocial } from "@/app/actions/resource";

type Row = Record<string, any>;

function kpiValue(kind: string, field: string | undefined, value: string | undefined, rows: Row[]) {
  switch (kind) {
    case "count":
      return rows.length;
    case "countWhere":
      return rows.filter((r) => String(r[field!]) === value).length;
    case "sum":
      return rows.reduce((s, r) => s + (Number(r[field!]) || 0), 0);
    case "avg":
      return rows.length ? rows.reduce((s, r) => s + (Number(r[field!]) || 0), 0) / rows.length : 0;
    default:
      return 0;
  }
}

function FieldInput({ f, row }: { f: Field; row?: Row }) {
  const v = row?.[f.name];
  switch (f.type) {
    case "textarea":
      return <Textarea name={f.name} defaultValue={v ?? ""} placeholder={f.placeholder} />;
    case "select":
      return <Select name={f.name} defaultValue={v ?? String(f.default ?? f.options?.[0] ?? "")} options={f.options ?? []} />;
    case "date":
      return <Input name={f.name} type="date" defaultValue={dateInputValue(v)} />;
    case "bool":
      return (
        <label className="inline-flex items-center gap-2 mt-1.5 cursor-pointer">
          <input type="checkbox" name={f.name} defaultChecked={row ? !!v : !!f.default} className="h-5 w-5 rounded border-line text-brand-500 focus:ring-brand-300" />
          <span className="text-sm text-ink-soft">Yes</span>
        </label>
      );
    case "number":
    case "money":
    case "rating":
      return <Input name={f.name} type="number" step={f.type === "rating" ? "0.1" : f.type === "money" ? "100" : "1"} min={0} defaultValue={v ?? f.default ?? ""} placeholder={f.placeholder} />;
    default:
      return <Input name={f.name} defaultValue={v ?? ""} placeholder={f.placeholder} required={f.required} />;
  }
}

function cellContent(f: Field, row: Row) {
  const v = row[f.name];
  if (f.type === "money") return <span className="font-semibold tabular-nums">{inr(v)}</span>;
  if (f.type === "bool") return v ? <Check className="h-4 w-4 text-emerald-500" /> : <span className="text-ink-faint">—</span>;
  if (f.type === "rating") return <span className="font-semibold text-amber-600">{Number(v).toFixed(1)} ★</span>;
  if (f.type === "date") return <span className="text-ink-soft">{v ? fmtDate(v) : "—"}</span>;
  if (f.type === "select" && f.tones) return <Badge tone={(f.tones[v] ?? "slate") as Tone}>{v}</Badge>;
  if (f.primary) return <span className="font-semibold text-ink">{v}</span>;
  return <span className="text-ink-soft">{v ?? "—"}</span>;
}

export function ResourceManager({ spec, rows }: { spec: ResourceSpec; rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setEditing(null);
      setOpen(true);
    }
  }, [searchParams]);

  const filterField = spec.fields.find((f) => f.name === spec.filterField);
  const columns = spec.fields.filter((f) => !f.hideInTable);

  const filtered = useMemo(() => {
    let r = rows;
    if (filter) r = r.filter((x) => String(x[spec.filterField!]) === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((x) => spec.searchFields.some((f) => String(x[f] ?? "").toLowerCase().includes(q)));
    }
    return r;
  }, [rows, search, filter, spec]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(row: Row) {
    setEditing(row);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    if (searchParams.get("new")) router.replace(`/travel/${spec.slug}`);
  }

  async function submit(fd: FormData) {
    await saveResource(spec.slug, editing?.id ?? null, fd);
    setOpen(false);
    router.refresh();
  }

  return (
    <div>
      <PageHeader title={spec.title} subtitle={spec.subtitle} icon={getIcon(spec.icon)}>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="h-4 w-4" /> Add {spec.singular}
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {spec.kpis.map((k) => {
          const raw = kpiValue(k.kind, k.field, k.value, rows);
          let value: string;
          if (k.money) value = inrCompact(raw);
          else if (k.kind === "avg") value = raw.toFixed(1) + (k.suffix ?? "");
          else value = raw.toLocaleString("en-IN") + (k.suffix ?? "");
          return <StatTile key={k.label} label={k.label} value={value} icon={getIcon(k.icon)} tone={k.tone} />;
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${spec.title.toLowerCase()}…`} className="input pl-9" />
        </div>
      </div>

      {filterField?.options && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setFilter("")} className={cn("px-3.5 py-1.5 rounded-full text-sm font-medium border transition", filter === "" ? "bg-plum-800 text-white border-plum-800" : "bg-white text-ink-soft border-line hover:border-brand-300")}>
            All
          </button>
          {filterField.options.map((o) => (
            <button key={o} onClick={() => setFilter(o)} className={cn("px-3.5 py-1.5 rounded-full text-sm font-medium border transition", filter === o ? "bg-plum-800 text-white border-plum-800" : "bg-white text-ink-soft border-line hover:border-brand-300")}>
              {o}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={getIcon(spec.icon)}
            title={rows.length === 0 ? `No ${spec.title.toLowerCase()} yet` : "Nothing matches your search"}
            message={rows.length === 0 ? `Add your first ${spec.singular.toLowerCase()} to get started.` : "Try a different search or filter."}
            action={<button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> Add {spec.singular}</button>}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-cream-100">
                <tr className="border-b border-line">
                  {columns.map((c) => (
                    <th key={c.name} className={cn("table-th", (c.type === "money" || c.type === "number") && "text-right")}>{c.label}</th>
                  ))}
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-cream-100 transition group">
                    {columns.map((c) => (
                      <td key={c.name} className={cn("table-td", (c.type === "money" || c.type === "number") && "text-right")}>{cellContent(c, row)}</td>
                    ))}
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition">
                        {spec.shareable && (
                          <ConfirmButton
                            action={async () => {
                              await shareResourceToSocial(spec.slug, row.id);
                              router.refresh();
                            }}
                            confirm="Create a draft social post from this item?"
                            title="Share to social"
                            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-brand-50 hover:text-brand-600"
                          >
                            <Share2 className="h-4 w-4" />
                          </ConfirmButton>
                        )}
                        <button onClick={() => openEdit(row)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-cream-200 hover:text-ink" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <ConfirmButton
                          action={async () => {
                            await removeResource(spec.slug, row.id);
                            router.refresh();
                          }}
                          confirm={`Delete this ${spec.singular.toLowerCase()}?`}
                          title="Delete"
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Modal open={open} onClose={close} title={editing ? `Edit ${spec.singular}` : `Add ${spec.singular}`} subtitle={spec.subtitle} size="lg">
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {spec.fields.map((f) => (
              <FormField key={f.name} label={f.label} required={f.required} hint={f.hint} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
                <FieldInput f={f} row={editing ?? undefined} />
              </FormField>
            ))}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{editing ? "Save Changes" : `Add ${spec.singular}`}</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
