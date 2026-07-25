import Link from "next/link";
import { notFound } from "next/navigation";
import { Trash2, ArrowRightLeft, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLeadsLite, getSettings } from "@/lib/data";
import { fmtDate } from "@/lib/utils";
import { QUOTE_STATUS_META } from "@/lib/constants";
import { Card, StatusBadge, BackLink } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PrintButton } from "@/components/docs/PrintButton";
import { DownloadPdfButton } from "@/components/docs/DownloadPdfButton";
import { DocumentView } from "@/components/docs/DocumentView";
import { QuoteDialog } from "@/components/quotes/QuoteDialog";
import { QuoteStatusBar } from "@/components/quotes/QuoteStatusBar";
import { deleteQuote, convertQuoteToInvoice } from "@/app/actions/quotes";

export const dynamic = "force-dynamic";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, leads, settings] = await Promise.all([
    prisma.quote.findUnique({ where: { id }, include: { lead: true, items: { orderBy: { sortOrder: "asc" } } } }),
    getLeadsLite(),
    getSettings(),
  ]);

  if (!quote) notFound();

  return (
    <div>
      <div className="no-print">
        <BackLink href="/quotes" label="Back to quotations" />

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink">
              {quote.number} <StatusBadge meta={QUOTE_STATUS_META} status={quote.status} />
            </h1>
            <p className="text-sm text-ink-soft mt-0.5">
              For <Link href={`/leads/${quote.leadId}`} className="text-brand-600 font-medium hover:underline">{quote.lead.name}</Link> · Issued {fmtDate(quote.issueDate)}
            </p>
          </div>
          <div className="lg:ml-auto flex items-center gap-2 flex-wrap">
            <DownloadPdfButton path={`/quotes/${quote.id}`} name={quote.number} />
            <PrintButton />
            <QuoteDialog leads={leads} quote={quote} variant="secondary" />
            <ConfirmButton
              action={convertQuoteToInvoice.bind(null, quote.id)}
              confirm="Create an invoice from this quotation?"
              className="btn-primary btn-sm sm:text-sm sm:px-4 sm:py-2.5"
            >
              <ArrowRightLeft className="h-4 w-4" /> To Invoice
            </ConfirmButton>
            <ConfirmButton
              action={deleteQuote.bind(null, quote.id)}
              confirm="Delete this quotation?"
              className="btn-danger btn-sm sm:text-sm sm:px-4 sm:py-2.5"
            >
              <Trash2 className="h-4 w-4" />
            </ConfirmButton>
          </div>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint shrink-0 inline-flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Status
            </span>
            <QuoteStatusBar quoteId={quote.id} current={quote.status} />
          </div>
        </Card>
      </div>

      <DocumentView
        kind="QUOTATION"
        number={quote.number}
        status={<StatusBadge meta={QUOTE_STATUS_META} status={quote.status} />}
        issueDate={quote.issueDate}
        secondaryLabel="Valid Until"
        secondaryDate={quote.validUntil}
        settings={settings}
        client={quote.lead}
        items={quote.items}
        taxRate={quote.taxRate}
        discount={quote.discount}
        notes={quote.notes}
        terms={quote.terms}
      />
    </div>
  );
}
