// Shared option lists, labels and colour tokens for statuses across the CRM.

export type Tone =
  | "slate"
  | "blue"
  | "amber"
  | "violet"
  | "green"
  | "red"
  | "terracotta";

export const TONE_CLASS: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  terracotta: "bg-brand-100 text-brand-700 ring-brand-200",
};

export const TONE_DOT: Record<Tone, string> = {
  slate: "bg-slate-400",
  blue: "bg-sky-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  green: "bg-emerald-500",
  red: "bg-rose-500",
  terracotta: "bg-brand-500",
};

// ---- Lead pipeline ----
export const LEAD_STAGES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATION", "WON", "LOST"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_META: Record<string, { label: string; tone: Tone; color: string }> = {
  NEW: { label: "New", tone: "blue", color: "#0EA5E9" },
  CONTACTED: { label: "Contacted", tone: "violet", color: "#8B5CF6" },
  QUOTED: { label: "Quoted", tone: "amber", color: "#F59E0B" },
  NEGOTIATION: { label: "Negotiation", tone: "terracotta", color: "#C15A3F" },
  WON: { label: "Won", tone: "green", color: "#10B981" },
  LOST: { label: "Lost", tone: "red", color: "#F43F5E" },
};

export const PIPELINE_STAGES = ["NEW", "CONTACTED", "QUOTED", "NEGOTIATION"] as const;

export const LEAD_SOURCES = ["Website", "Referral", "WhatsApp", "Instagram", "Walk-in", "Phone"];
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const PRIORITY_META: Record<string, { label: string; tone: Tone }> = {
  LOW: { label: "Low", tone: "slate" },
  MEDIUM: { label: "Medium", tone: "blue" },
  HIGH: { label: "High", tone: "red" },
};

// ---- Bookings ----
export const BOOKING_STATUSES = ["DRAFT", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"] as const;
export const BOOKING_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "slate" },
  CONFIRMED: { label: "Confirmed", tone: "blue" },
  ONGOING: { label: "Ongoing", tone: "amber" },
  COMPLETED: { label: "Completed", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "red" },
};

// ---- Quotes ----
export const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"] as const;
export const QUOTE_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "slate" },
  SENT: { label: "Sent", tone: "blue" },
  ACCEPTED: { label: "Accepted", tone: "green" },
  REJECTED: { label: "Rejected", tone: "red" },
  EXPIRED: { label: "Expired", tone: "amber" },
};

// ---- Invoices ----
export const INVOICE_STATUSES = ["UNPAID", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"] as const;
export const INVOICE_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  UNPAID: { label: "Unpaid", tone: "amber" },
  PARTIAL: { label: "Partial", tone: "blue" },
  PAID: { label: "Paid", tone: "green" },
  OVERDUE: { label: "Overdue", tone: "red" },
  CANCELLED: { label: "Cancelled", tone: "slate" },
};

export const ACTIVITY_TYPES = ["NOTE", "CALL", "EMAIL", "WHATSAPP", "MEETING", "TASK"];
export const ACTIVITY_META: Record<string, { label: string; tone: Tone; icon: string }> = {
  NOTE: { label: "Note", tone: "slate", icon: "StickyNote" },
  CALL: { label: "Call", tone: "green", icon: "Phone" },
  EMAIL: { label: "Email", tone: "blue", icon: "Mail" },
  WHATSAPP: { label: "WhatsApp", tone: "green", icon: "MessageCircle" },
  MEETING: { label: "Meeting", tone: "violet", icon: "Users" },
  TASK: { label: "Task", tone: "amber", icon: "CheckSquare" },
};

export const PAYMENT_METHODS = ["UPI", "Cash", "Card", "Bank Transfer", "Cheque"];

// ---- Social media ----
export const SOCIAL_CHANNELS = ["Instagram", "Facebook", "WhatsApp", "YouTube", "X", "LinkedIn"];
export const SOCIAL_META: Record<string, { label: string; color: string; icon: string }> = {
  Instagram: { label: "Instagram", color: "#E1306C", icon: "Instagram" },
  Facebook: { label: "Facebook", color: "#1877F2", icon: "Facebook" },
  WhatsApp: { label: "WhatsApp", color: "#25D366", icon: "MessageCircle" },
  YouTube: { label: "YouTube", color: "#FF0000", icon: "Youtube" },
  X: { label: "X (Twitter)", color: "#111827", icon: "Twitter" },
  LinkedIn: { label: "LinkedIn", color: "#0A66C2", icon: "Linkedin" },
};
export const POST_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED"];
export const POST_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  DRAFT: { label: "Draft", tone: "slate" },
  SCHEDULED: { label: "Scheduled", tone: "amber" },
  PUBLISHED: { label: "Published", tone: "green" },
};

// ---- Events ----
export const EVENT_TYPES = ["Wedding", "Corporate", "MICE", "Festival", "Group Tour"];
export const EVENT_TYPE_META: Record<string, { tone: Tone }> = {
  Wedding: { tone: "red" },
  Corporate: { tone: "blue" },
  MICE: { tone: "violet" },
  Festival: { tone: "amber" },
  "Group Tour": { tone: "green" },
};
export const EVENT_STATUSES = ["PLANNING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"];
export const EVENT_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  PLANNING: { label: "Planning", tone: "amber" },
  CONFIRMED: { label: "Confirmed", tone: "blue" },
  ONGOING: { label: "Ongoing", tone: "violet" },
  COMPLETED: { label: "Completed", tone: "green" },
  CANCELLED: { label: "Cancelled", tone: "red" },
};
export const EVENT_ROLES = ["Lead Planner", "Coordinator", "Logistics", "Hospitality", "Marketing"];

export function toneFor(map: Record<string, { tone: Tone }>, key: string): Tone {
  return map[key]?.tone ?? "slate";
}
