"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr } from "@/lib/form";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createEvent(fd: FormData) {
  const start = date(fd, "startDate") ?? new Date();
  const event = await prisma.event.create({
    data: {
      title: reqStr(fd, "title", "New Event"),
      type: reqStr(fd, "type", "Group Tour"),
      status: reqStr(fd, "status", "PLANNING"),
      startDate: start,
      endDate: date(fd, "endDate") ?? start,
      location: reqStr(fd, "location", "Jaipur"),
      venue: str(fd, "venue"),
      guests: num(fd, "guests") ?? 0,
      budget: num(fd, "budget") ?? 0,
      leadId: str(fd, "leadId"),
      notes: str(fd, "notes"),
    },
  });
  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function updateEvent(id: string, fd: FormData) {
  const start = date(fd, "startDate") ?? new Date();
  await prisma.event.update({
    where: { id },
    data: {
      title: reqStr(fd, "title", "New Event"),
      type: reqStr(fd, "type", "Group Tour"),
      status: reqStr(fd, "status", "PLANNING"),
      startDate: start,
      endDate: date(fd, "endDate") ?? start,
      location: reqStr(fd, "location", "Jaipur"),
      venue: str(fd, "venue"),
      guests: num(fd, "guests") ?? 0,
      budget: num(fd, "budget") ?? 0,
      leadId: str(fd, "leadId"),
      notes: str(fd, "notes"),
    },
  });
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
}

export async function updateEventStatus(id: string, status: string) {
  await prisma.event.update({ where: { id }, data: { status } });
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/events");
  redirect("/events");
}

export async function addAssignment(eventId: string, fd: FormData) {
  const agentId = reqStr(fd, "agentId");
  if (!agentId) return;
  await prisma.eventAssignment.upsert({
    where: { eventId_agentId: { eventId, agentId } },
    update: { role: reqStr(fd, "role", "Coordinator") },
    create: { eventId, agentId, role: reqStr(fd, "role", "Coordinator") },
  });
  revalidatePath(`/events/${eventId}`);
}

export async function removeAssignment(id: string, eventId: string) {
  await prisma.eventAssignment.delete({ where: { id } });
  revalidatePath(`/events/${eventId}`);
}
