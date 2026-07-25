"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr } from "@/lib/form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createLead(fd: FormData) {
  const lead = await prisma.lead.create({
    data: {
      name: reqStr(fd, "name", "Unnamed lead"),
      email: str(fd, "email"),
      phone: str(fd, "phone"),
      company: str(fd, "company"),
      source: reqStr(fd, "source", "Website"),
      stage: reqStr(fd, "stage", "NEW"),
      priority: reqStr(fd, "priority", "MEDIUM"),
      destination: str(fd, "destination"),
      travelDate: date(fd, "travelDate"),
      pax: num(fd, "pax") ?? 1,
      budget: num(fd, "budget"),
      notes: str(fd, "notes"),
      agentId: str(fd, "agentId"),
    },
  });
  revalidatePath("/leads");
  revalidatePath("/");
  redirect(`/leads/${lead.id}`);
}

export async function updateLead(id: string, fd: FormData) {
  await prisma.lead.update({
    where: { id },
    data: {
      name: reqStr(fd, "name", "Unnamed lead"),
      email: str(fd, "email"),
      phone: str(fd, "phone"),
      company: str(fd, "company"),
      source: reqStr(fd, "source", "Website"),
      stage: reqStr(fd, "stage", "NEW"),
      priority: reqStr(fd, "priority", "MEDIUM"),
      destination: str(fd, "destination"),
      travelDate: date(fd, "travelDate"),
      pax: num(fd, "pax") ?? 1,
      budget: num(fd, "budget"),
      notes: str(fd, "notes"),
      lostReason: str(fd, "lostReason"),
      agentId: str(fd, "agentId"),
    },
  });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/");
}

export async function updateLeadStage(id: string, stage: string) {
  await prisma.lead.update({ where: { id }, data: { stage } });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/");
}

export async function deleteLead(id: string) {
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
  revalidatePath("/");
  redirect("/leads");
}

export async function addActivity(leadId: string, fd: FormData) {
  await prisma.activity.create({
    data: {
      leadId,
      type: reqStr(fd, "type", "NOTE"),
      title: reqStr(fd, "title", "Untitled"),
      detail: str(fd, "detail"),
      dueDate: date(fd, "dueDate"),
    },
  });
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
}

export async function toggleActivity(id: string, leadId: string, done: boolean) {
  await prisma.activity.update({ where: { id }, data: { done } });
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
}

export async function deleteActivity(id: string, leadId: string) {
  await prisma.activity.delete({ where: { id } });
  revalidatePath(`/leads/${leadId}`);
}
