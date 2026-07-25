import Link from "next/link";
import { cn, initials, avatarColor } from "@/lib/utils";
import { TONE_CLASS, TONE_DOT, type Tone } from "@/lib/constants";

// ---------------- Badge ----------------
export function Badge({
  tone = "slate",
  dot = false,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("badge", TONE_CLASS[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />}
      {children}
    </span>
  );
}

export function StatusBadge({
  meta,
  status,
  dot = true,
}: {
  meta: Record<string, { label: string; tone: Tone }>;
  status: string;
  dot?: boolean;
}) {
  const m = meta[status] ?? { label: status, tone: "slate" as Tone };
  return (
    <Badge tone={m.tone} dot={dot}>
      {m.label}
    </Badge>
  );
}

// ---------------- Avatar ----------------
export function Avatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-grid place-items-center rounded-full font-bold text-white shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: size * 0.36,
      }}
      title={name}
    >
      {initials(name) || "?"}
    </span>
  );
}

// ---------------- Page header ----------------
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-3.5 min-w-0">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500 text-white shadow-soft shrink-0">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-ink leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="sm:ml-auto flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}

// ---------------- Card ----------------
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-line/70">
      {Icon && (
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-cream-200 text-brand-600 shrink-0">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <div className="min-w-0">
        <h3 className="section-title truncate">{title}</h3>
        {subtitle && <p className="text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

// ---------------- Stat tile ----------------
export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone = "terracotta",
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  trend?: { value: string; up?: boolean };
}) {
  const iconBg: Record<Tone, string> = {
    terracotta: "bg-brand-50 text-brand-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    red: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="stat-tile">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
          <p className="mt-2 font-display text-[26px] font-semibold text-ink leading-none">{value}</p>
          {sub && <p className="mt-2 text-xs text-ink-soft">{sub}</p>}
        </div>
        <span className={cn("grid h-11 w-11 place-items-center rounded-xl shrink-0", iconBg[tone])}>
          <Icon className="h-[22px] w-[22px]" />
        </span>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
          <span className={trend.up ? "text-emerald-600" : "text-rose-500"}>
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
          <span className="text-ink-faint font-normal">vs last period</span>
        </div>
      )}
    </div>
  );
}

// ---------------- Empty state ----------------
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cream-200 text-brand-400 mb-4">
        <Icon className="h-8 w-8" />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {message && <p className="mt-1 text-sm text-ink-soft max-w-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------------- Progress bar ----------------
export function Progress({ value, className, barClass }: { value: number; className?: string; barClass?: string }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-cream-200 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full bg-brand-500 transition-all", barClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ---------------- Back link ----------------
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-600 mb-4">
      <span className="text-base leading-none">‹</span> {label}
    </Link>
  );
}
