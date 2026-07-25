import { prisma } from "@/lib/prisma";
import { str } from "@/lib/form";

/**
 * Resolve the customer for a quote / invoice / booking.
 * Uses an existing lead if a valid `leadId` was chosen; otherwise creates a
 * new lead from the typed `customerName` (so documents can be raised even when
 * no contacts exist yet).
 */
export async function resolveLeadId(fd: FormData, defaultStage = "NEW"): Promise<string> {
  const leadId = str(fd, "leadId");
  if (leadId) {
    const exists = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (exists) return leadId;
  }
  const name = str(fd, "customerName") || "New Customer";
  const lead = await prisma.lead.create({ data: { name, stage: defaultStage } });
  return lead.id;
}
