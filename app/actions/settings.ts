"use server";

import { prisma } from "@/lib/prisma";
import { reqStr } from "@/lib/form";
import { revalidatePath } from "next/cache";

export async function updateSettings(fd: FormData) {
  const data = {
    companyName: reqStr(fd, "companyName", "Padhaaro Sa.."),
    tagline: reqStr(fd, "tagline", "Hospitality Services"),
    email: reqStr(fd, "email"),
    phone: reqStr(fd, "phone"),
    website: reqStr(fd, "website"),
    address: reqStr(fd, "address"),
    gstin: reqStr(fd, "gstin"),
    currency: reqStr(fd, "currency", "INR"),
    bankName: reqStr(fd, "bankName"),
    bankAccount: reqStr(fd, "bankAccount"),
    bankIfsc: reqStr(fd, "bankIfsc"),
    upiId: reqStr(fd, "upiId"),
    invoiceNotes: reqStr(fd, "invoiceNotes"),
  };
  await prisma.setting.upsert({
    where: { id: "company" },
    update: data,
    create: { id: "company", ...data },
  });
  revalidatePath("/settings");
  revalidatePath("/invoices");
  revalidatePath("/quotes");
}
