"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr, docNumber } from "@/lib/form";
import { resolveLeadId } from "@/lib/resolveLead";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(fd: FormData) {
  const count = await prisma.booking.count();
  const start = date(fd, "startDate") ?? new Date();
  const end = date(fd, "endDate") ?? start;
  const adults = num(fd, "adults") ?? 1;
  const children = num(fd, "children") ?? 0;

  const booking = await prisma.booking.create({
    data: {
      reference: docNumber("PDH", count),
      title: reqStr(fd, "title", "New Trip"),
      destination: reqStr(fd, "destination", "Rajasthan"),
      status: reqStr(fd, "status", "DRAFT"),
      startDate: start,
      endDate: end,
      adults,
      children,
      pax: adults + children,
      totalAmount: num(fd, "totalAmount") ?? 0,
      notes: str(fd, "notes"),
      leadId: await resolveLeadId(fd, "WON"),
      agentId: str(fd, "agentId"),
    },
  });
  revalidatePath("/bookings");
  revalidatePath("/");
  redirect(`/bookings/${booking.id}`);
}

export async function updateBooking(id: string, fd: FormData) {
  const start = date(fd, "startDate") ?? new Date();
  const end = date(fd, "endDate") ?? start;
  const adults = num(fd, "adults") ?? 1;
  const children = num(fd, "children") ?? 0;
  await prisma.booking.update({
    where: { id },
    data: {
      title: reqStr(fd, "title", "New Trip"),
      destination: reqStr(fd, "destination", "Rajasthan"),
      status: reqStr(fd, "status", "DRAFT"),
      startDate: start,
      endDate: end,
      adults,
      children,
      pax: adults + children,
      totalAmount: num(fd, "totalAmount") ?? 0,
      notes: str(fd, "notes"),
      agentId: str(fd, "agentId"),
    },
  });
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${id}`);
  revalidatePath("/");
}

export async function updateBookingStatus(id: string, status: string) {
  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/bookings");
  revalidatePath(`/bookings/${id}`);
  revalidatePath("/");
}

export async function deleteBooking(id: string) {
  await prisma.booking.delete({ where: { id } });
  revalidatePath("/bookings");
  revalidatePath("/");
  redirect("/bookings");
}

export async function addItineraryDay(bookingId: string, fd: FormData) {
  const count = await prisma.itineraryDay.count({ where: { bookingId } });
  await prisma.itineraryDay.create({
    data: {
      bookingId,
      dayNumber: count + 1,
      date: date(fd, "date"),
      title: reqStr(fd, "title", `Day ${count + 1}`),
      location: str(fd, "location"),
      hotel: str(fd, "hotel"),
      meals: str(fd, "meals"),
      activities: str(fd, "activities"),
      transport: str(fd, "transport"),
    },
  });
  revalidatePath(`/bookings/${bookingId}`);
}

export async function updateItineraryDay(id: string, bookingId: string, fd: FormData) {
  await prisma.itineraryDay.update({
    where: { id },
    data: {
      date: date(fd, "date"),
      title: reqStr(fd, "title", "Day"),
      location: str(fd, "location"),
      hotel: str(fd, "hotel"),
      meals: str(fd, "meals"),
      activities: str(fd, "activities"),
      transport: str(fd, "transport"),
    },
  });
  revalidatePath(`/bookings/${bookingId}`);
}

export async function deleteItineraryDay(id: string, bookingId: string) {
  await prisma.itineraryDay.delete({ where: { id } });
  // renumber remaining days
  const remaining = await prisma.itineraryDay.findMany({
    where: { bookingId },
    orderBy: { dayNumber: "asc" },
  });
  await Promise.all(
    remaining.map((day, i) =>
      prisma.itineraryDay.update({ where: { id: day.id }, data: { dayNumber: i + 1 } })
    )
  );
  revalidatePath(`/bookings/${bookingId}`);
}
