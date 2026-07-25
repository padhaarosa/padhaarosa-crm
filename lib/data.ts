import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const s = await prisma.setting.findUnique({ where: { id: "company" } });
  if (s) return s;
  return prisma.setting.create({ data: { id: "company" } });
}

export async function getAgents() {
  return prisma.agent.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

export async function getLeadsLite() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, destination: true, stage: true },
  });
}
