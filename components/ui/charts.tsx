import { inrCompact } from "@/lib/utils";

type Slice = { label: string; value: number; color: string };

// ---------------- Donut ----------------
export function DonutChart({
  data,
  size = 168,
  thickness = 26,
  centerLabel,
  centerValue,
}: {
  data: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1E8DB" strokeWidth={thickness} />
          {data.map((d, i) => {
            const len = (d.value / total) * circ;
            const dash = `${len} ${circ - len}`;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        {(centerValue || centerLabel) && (
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              {centerValue && <div className="font-display text-xl font-semibold text-ink">{centerValue}</div>}
              {centerLabel && <div className="text-[11px] text-ink-faint">{centerLabel}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 min-w-0 flex-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <span className="h-3 w-3 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-ink-soft truncate flex-1">{d.label}</span>
            <span className="font-semibold text-ink">{d.value}</span>
            <span className="text-ink-faint text-xs w-10 text-right">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Vertical bar chart (revenue) ----------------
export function BarChart({
  data,
  height = 200,
  money = false,
}: {
  data: { label: string; value: number }[];
  height?: number;
  money?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barH = height - 34;

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-3 min-w-full" style={{ height }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / max) * barH);
          return (
            <div key={i} className="flex-1 min-w-[36px] flex flex-col items-center justify-end gap-2">
              <div className="text-[11px] font-semibold text-ink-soft whitespace-nowrap">
                {d.value > 0 ? (money ? inrCompact(d.value) : d.value) : ""}
              </div>
              <div
                className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all hover:from-brand-700 hover:to-brand-500"
                style={{ height: h }}
                title={money ? inrCompact(d.value) : String(d.value)}
              />
              <div className="text-[11px] text-ink-faint whitespace-nowrap">{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------- Horizontal funnel/bars ----------------
export function HBars({
  data,
}: {
  data: { label: string; value: number; color?: string; sub?: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-ink-soft">{d.label}</span>
            <span className="font-semibold text-ink">
              {d.value}
              {d.sub && <span className="text-ink-faint font-normal text-xs ml-1.5">{d.sub}</span>}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? "#C15A3F" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
