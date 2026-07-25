"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr, docNumber } from "@/lib/form";
import { resolveLeadId } from "@/lib/resolveLead";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ParsedItem = {
  label: string;
  detail: string | null;
  quantity: number;
  unitPrice: number;
  sortOrder: number;
};

function parseItems(fd: FormData): ParsedItem[] {
  const labels = fd.getAll("item_label").map((v) => String(v));
  const details = fd.getAll("item_detail").map((v) => String(v));
  const qtys = fd.getAll("item_qty").map((v) => Number(v));
  const prices = fd.getAll("item_price").map((v) => Number(v));
  const items: ParsedItem[] = [];
  for (let i = 0; i < labels.length; i++) {
    const label = (labels[i] ?? "").trim();
    if (!label) continue;
    items.push({
      label,
      detail: (details[i] ?? "").trim() || null,
      quantity: Number.isFinite(qtys[i]) ? qtys[i] : 1,
      unitPrice: Number.isFinite(prices[i]) ? prices[i] : 0,
      sortOrder: items.length,
    });
  }
  return items;
}

export async function createQuote(fd: FormData) {
  const count = await prisma.quote.count();
  const items = parseItems(fd);
  const leadId = await resolveLeadId(fd, "QUOTED");
  const quote = await prisma.quote.create({
    data: {
      number: docNumber("QT", count),
      leadId,
      title: reqStr(fd, "title", "Travel Quotation"),
      status: reqStr(fd, "status", "DRAFT"),
      issueDate: date(fd, "issueDate") ?? new Date(),
      validUntil: date(fd, "validUntil"),
      taxRate: num(fd, "taxRate") ?? 5,
      discount: num(fd, "discount") ?? 0,
      notes: str(fd, "notes"),
      terms: str(fd, "terms"),
      items: { create: items },
    },
  });
  revalidatePath("/quotes");
  revalidatePath("/");
  redirect(`/quotes/${quote.id}`);
}

export async function updateQuote(id: string, fd: FormData) {
  const items = parseItems(fd);
  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
    prisma.quote.update({
      where: { id },
      data: {
        title: reqStr(fd, "title", "Travel Quotation"),
        status: reqStr(fd, "status", "DRAFT"),
        issueDate: date(fd, "issueDate") ?? new Date(),
        validUntil: date(fd, "validUntil"),
        taxRate: num(fd, "taxRate") ?? 5,
        discount: num(fd, "discount") ?? 0,
        notes: str(fd, "notes"),
        terms: str(fd, "terms"),
        items: { create: items },
      },
    }),
  ]);
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  revalidatePath("/");
}

export async function updateQuoteStatus(id: string, status: string) {
  await prisma.quote.update({ where: { id }, data: { status } });
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
}

export async function deleteQuote(id: string) {
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/quotes");
  revalidatePath("/");
  redirect("/quotes");
}

/** Convert an accepted quote into an invoice, copying line items. */
export async function convertQuoteToInvoice(quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { items: true },
  });
  if (!quote) return;
  const count = await prisma.invoice.count();
  const invoice = await prisma.invoice.create({
    data: {
      number: docNumber("INV", count),
      leadId: quote.leadId,
      status: "UNPAID",
      taxRate: quote.taxRate,
      discount: quote.discount,
      notes: quote.notes,
      terms: quote.terms,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      items: {
        create: quote.items.map((it) => ({
          label: it.label,
          detail: it.detail,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          sortOrder: it.sortOrder,
        })),
      },
    },
  });
  await prisma.quote.update({ where: { id: quoteId }, data: { status: "ACCEPTED" } });
  revalidatePath("/invoices");
  revalidatePath("/quotes");
  redirect(`/invoices/${invoice.id}`);
}
