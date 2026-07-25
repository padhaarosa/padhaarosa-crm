"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr } from "@/lib/form";
import { revalidatePath } from "next/cache";

export async function createEmployee(fd: FormData) {
  await prisma.agent.create({
    data: {
      name: reqStr(fd, "name", "New Member"),
      email: reqStr(fd, "email", `member${Date.now()}@padhaaro.com`),
      phone: str(fd, "phone"),
      role: reqStr(fd, "role", "Agent"),
      designation: reqStr(fd, "designation", "Travel Consultant"),
      department: reqStr(fd, "department", "Sales"),
      location: reqStr(fd, "location", "Jaipur"),
      target: num(fd, "target") ?? 500000,
      joinedAt: date(fd, "joinedAt") ?? new Date(),
    },
  });
  revalidatePath("/team");
}

export async function updateEmployee(id: string, fd: FormData) {
  await prisma.agent.update({
    where: { id },
    data: {
      name: reqStr(fd, "name", "New Member"),
      email: reqStr(fd, "email"),
      phone: str(fd, "phone"),
      role: reqStr(fd, "role", "Agent"),
      designation: reqStr(fd, "designation", "Travel Consultant"),
      department: reqStr(fd, "department", "Sales"),
      location: reqStr(fd, "location", "Jaipur"),
      target: num(fd, "target") ?? 500000,
      joinedAt: date(fd, "joinedAt") ?? new Date(),
    },
  });
  revalidatePath("/team");
}

export async function deleteEmployee(id: string) {
  await prisma.agent.delete({ where: { id } });
  revalidatePath("/team");
}
