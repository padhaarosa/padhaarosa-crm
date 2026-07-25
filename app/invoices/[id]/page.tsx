import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2, SlidersHorizontal, Wallet, IndianRupee, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLeadsLite, getSettings } from "@/lib/data";
import { computeTotals, paymentTotal } from "@/lib/totals";
import { inr, fmtDate } from "@/lib/utils";
import { INVOICE_STATUS_META } from "@/lib/constants";
import { Card, CardHeader, StatusBadge, BackLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PrintButton } from "@/components/docs/PrintButton";
import { DownloadPdfButton } from "@/components/docs/DownloadPdfButton";
import { DocumentView } from "@/components/docs/DocumentView";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { InvoiceStatusBar } from "@/components/invoices/InvoiceStatusBar";
import { PaymentPanel } from "@/components/invoices/PaymentPanel";
import { deleteInvoice } from "@/app/actions/invoices";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [invoice, leads, bookings, settings] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id },
      include: { lead: true, items: { orderBy: { sortOrder: "asc" } }, payments: { orderBy: { paidAt: "asc" } }, booking: true },
    }),
    getLeadsLite(),
    prisma.booking.findMany({ select: { id: true, reference: true, title: true }, orderBy: { createdAt: "desc" } }),
    getSettings(),
  ]);

  if (!invoice) notFound();

  const { total } = computeTotals(invoice.items, invoice.taxRate, invoice.discount);
  const paid = paymentTotal(invoice.payments);
  const balance = Math.max(0, total - paid);
  const bookingOpts = bookings.map((b) => ({ id: b.id, label: `${b.reference} · ${b.title}` }));

  return (
    <div>
      <div className="no-print">
        <BackLink href="/invoices" label="Back to invoices" />

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink">
              {invoice.number} <StatusBadge meta={INVOICE_STATUS_META} status={invoice.status} />
            </h1>
            <p className="text-sm text-ink-soft mt-0.5">
              For <Link href={`/leads/${invoice.leadId}`} className="text-brand-600 font-medium hover:underline">{invoice.lead.name}</Link>
              {invoice.booking && <> · <Link href={`/bookings/${invoice.bookingId}`} className="text-brand-600 hover:underline">{invoice.booking.reference}</Link></>}
              {" · "}Issued {fmtDate(invoice.issueDate)}
            </p>
          </div>
          <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
            <DownloadPdfButton path={`/invoices/${invoice.id}`} name={invoice.number} />
            <PrintButton />
            <InvoiceDialog leads={leads} bookings={bookingOpts} invoice={invoice} variant="secondary" />
            <ConfirmButton
              action={deleteInvoice.bind(null, invoice.id)}
              confirm="Delete this invoice and its payments?"
              className="btn-danger btn-sm sm:text-sm sm:px-4 sm:py-2.5"
            >
              <Trash2 className="h-4 w-4" />
            </ConfirmButton>
          </div>
        </div>

        {/* Money summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-ink-faint"><IndianRupee className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Total</span></div>
            <div className="mt-1.5 font-display text-xl font-semibold text-ink">{inr(total)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Paid</span></div>
            <div className="mt-1.5 font-display text-xl font-semibold text-emerald-600">{inr(paid)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-maroon-600"><Wallet className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wide">Balance</span></div>
            <div className="mt-1.5 font-display text-xl font-semibold text-maroon-600">{inr(balance)}</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint inline-flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Status
              </span>
              <InvoiceStatusBar invoiceId={invoice.id} current={invoice.status} />
            </div>
          </Card>
          <Card>
            <CardHeader title="Payments" subtitle={`${invoice.payments.length} recorded`} icon={Wallet} />
            <PaymentPanel invoiceId={invoice.id} payments={invoice.payments} balance={balance} />
          </Card>
        </div>
      </div>

      <DocumentView
        kind="INVOICE"
        number={invoice.number}
        status={<StatusBadge meta={INVOICE_STATUS_META} status={invoice.status} />}
        issueDate={invoice.issueDate}
        secondaryLabel="Due Date"
        secondaryDate={invoice.dueDate}
        settings={settings}
        client={invoice.lead}
        items={invoice.items}
        taxRate={invoice.taxRate}
        discount={invoice.discount}
        notes={invoice.notes}
        terms={invoice.terms}
        payments={invoice.payments}
        showBank={invoice.showBank}
      />
    </div>
  );
}
