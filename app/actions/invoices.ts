"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr, docNumber, bool } from "@/lib/form";
import { resolveLeadId } from "@/lib/resolveLead";
import { computeTotals, paymentTotal } from "@/lib/totals";
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

export async function createInvoice(fd: FormData) {
  const count = await prisma.invoice.count();
  const items = parseItems(fd);
  const leadId = await resolveLeadId(fd, "WON");
  const invoice = await prisma.invoice.create({
    data: {
      number: docNumber("INV", count),
      leadId,
      bookingId: str(fd, "bookingId"),
      status: reqStr(fd, "status", "UNPAID"),
      issueDate: date(fd, "issueDate") ?? new Date(),
      dueDate: date(fd, "dueDate"),
      taxRate: num(fd, "taxRate") ?? 5,
      discount: num(fd, "discount") ?? 0,
      notes: str(fd, "notes"),
      terms: str(fd, "terms"),
      showBank: bool(fd, "showBank"),
      items: { create: items },
    },
  });
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(id: string, fd: FormData) {
  const items = parseItems(fd);
  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        status: reqStr(fd, "status", "UNPAID"),
        issueDate: date(fd, "issueDate") ?? new Date(),
        dueDate: date(fd, "dueDate"),
        bookingId: str(fd, "bookingId"),
        taxRate: num(fd, "taxRate") ?? 5,
        discount: num(fd, "discount") ?? 0,
        notes: str(fd, "notes"),
        terms: str(fd, "terms"),
        showBank: bool(fd, "showBank"),
        items: { create: items },
      },
    }),
  ]);
  await syncInvoiceStatus(id);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/");
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  revalidatePath("/");
  redirect("/invoices");
}

/** Recompute PAID / PARTIAL / UNPAID / OVERDUE from payments + due date. */
async function syncInvoiceStatus(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });
  if (!invoice) return;
  if (invoice.status === "CANCELLED") return;

  const { total } = computeTotals(invoice.items, invoice.taxRate, invoice.discount);
  const paid = paymentTotal(invoice.payments);

  let status: string;
  if (paid >= total && total > 0) status = "PAID";
  else if (paid > 0) status = "PARTIAL";
  else if (invoice.dueDate && invoice.dueDate.getTime() < Date.now()) status = "OVERDUE";
  else status = "UNPAID";

  if (status !== invoice.status) {
    await prisma.invoice.update({ where: { id }, data: { status } });
  }
}

export async function addPayment(invoiceId: string, fd: FormData) {
  await prisma.payment.create({
    data: {
      invoiceId,
      amount: num(fd, "amount") ?? 0,
      method: reqStr(fd, "method", "UPI"),
      reference: str(fd, "reference"),
      paidAt: date(fd, "paidAt") ?? new Date(),
      note: str(fd, "note"),
    },
  });
  await syncInvoiceStatus(invoiceId);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/");
}

export async function deletePayment(id: string, invoiceId: string) {
  await prisma.payment.delete({ where: { id } });
  await syncInvoiceStatus(invoiceId);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/");
}

export async function setInvoiceStatus(id: string, status: string) {
  await prisma.invoice.update({ where: { id }, data: { status } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}
