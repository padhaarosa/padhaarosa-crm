"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { inr } from "@/lib/utils";
import { computeTotals } from "@/lib/totals";

export type EditorItem = {
  label: string;
  detail: string;
  quantity: number;
  unitPrice: number;
};

let uid = 0;

export function LineItemsEditor({
  initialItems,
  initialTax = 5,
  initialDiscount = 0,
}: {
  initialItems?: EditorItem[];
  initialTax?: number;
  initialDiscount?: number;
}) {
  const [rows, setRows] = useState<(EditorItem & { _k: number })[]>(
    (initialItems && initialItems.length
      ? initialItems
      : [{ label: "", detail: "", quantity: 1, unitPrice: 0 }]
    ).map((it) => ({ ...it, _k: uid++ }))
  );
  const [tax, setTax] = useState(initialTax);
  const [discount, setDiscount] = useState(initialDiscount);

  const update = (k: number, patch: Partial<EditorItem>) =>
    setRows((prev) => prev.map((r) => (r._k === k ? { ...r, ...patch } : r)));
  const add = () => setRows((prev) => [...prev, { label: "", detail: "", quantity: 1, unitPrice: 0, _k: uid++ }]);
  const remove = (k: number) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._k !== k) : prev));

  const totals = computeTotals(rows, tax, discount);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-line overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_4.5rem_7rem_7rem_2.5rem] gap-2 bg-cream-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
          <span>Item</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        <div className="divide-y divide-line">
          {rows.map((r) => (
            <div key={r._k} className="p-3 sm:grid sm:grid-cols-[1fr_4.5rem_7rem_7rem_2.5rem] sm:gap-2 sm:items-center">
              {/* item + description */}
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <GripVertical className="h-4 w-4 text-ink-faint/40 hidden sm:block shrink-0" />
                  <input
                    className="input py-2"
                    placeholder="Item / service"
                    value={r.label}
                    onChange={(e) => update(r._k, { label: e.target.value })}
                  />
                </div>
                <input
                  className="input py-1.5 text-xs sm:ml-[22px]"
                  placeholder="Description (optional)"
                  value={r.detail}
                  onChange={(e) => update(r._k, { detail: e.target.value })}
                />
                {/* hidden fields submitted with the form */}
                <input type="hidden" name="item_label" value={r.label} />
                <input type="hidden" name="item_detail" value={r.detail} />
                <input type="hidden" name="item_qty" value={r.quantity} />
                <input type="hidden" name="item_price" value={r.unitPrice} />
              </div>

              {/* qty / rate / amount / remove — becomes grid cells on desktop */}
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 mt-2 sm:mt-0 sm:contents">
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-faint mb-0.5 sm:hidden">Qty</span>
                  <input type="number" min={0} step="0.5" className="input py-2 text-center w-full" value={r.quantity} onChange={(e) => update(r._k, { quantity: Number(e.target.value) })} />
                </div>
                <div>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-faint mb-0.5 sm:hidden">Rate</span>
                  <input type="number" min={0} step="100" className="input py-2 text-right w-full" value={r.unitPrice} onChange={(e) => update(r._k, { unitPrice: Number(e.target.value) })} />
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-ink-faint mb-0.5 sm:hidden">Amount</span>
                  <div className="text-sm font-semibold text-ink py-2 tabular-nums whitespace-nowrap">{inr((r.quantity || 0) * (r.unitPrice || 0))}</div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(r._k)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500 shrink-0 self-center"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="button" onClick={add} className="btn-secondary btn-sm">
        <Plus className="h-4 w-4" /> Add Item
      </button>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full sm:w-80 space-y-2 rounded-xl bg-cream-100 border border-line p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Subtotal</span>
            <span className="font-semibold text-ink tabular-nums">{inr(totals.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Discount (₹)</span>
            <input
              type="number"
              min={0}
              name="discount"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="input py-1 w-28 text-right"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">GST (%)</span>
            <input
              type="number"
              min={0}
              max={28}
              step="0.5"
              name="taxRate"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="input py-1 w-28 text-right"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Tax amount</span>
            <span className="text-ink tabular-nums">{inr(totals.tax)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-line">
            <span className="font-semibold text-ink">Grand Total</span>
            <span className="font-display text-lg font-bold text-brand-600 tabular-nums">{inr(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
