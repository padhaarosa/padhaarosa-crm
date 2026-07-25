import { NextRequest } from "next/server";
import { chromium } from "playwright";

export const dynamic = "force-dynamic";

/**
 * GET /api/pdf?path=/invoices/<id>&name=INV-2026-0001
 * Renders the (print-styled) document page headlessly and streams back a PDF.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  const name = (req.nextUrl.searchParams.get("name") ?? "document").replace(/[^\w.-]/g, "_");

  // only our own document pages may be rendered
  if (!/^\/(invoices|quotes)\/[a-z0-9]+$/i.test(path)) {
    return new Response("Invalid path", { status: 400 });
  }

  const port = process.env.PORT ?? "3000";
  // "fit" (default) sizes the page exactly to the document; "a4" gives classic A4 pages
  const mode = req.nextUrl.searchParams.get("size") === "a4" ? "a4" : "fit";
  let browser;
  try {
    browser = await chromium.launch();
    // 748px ≈ 198mm printable width (210mm A4 minus 6mm margins) at 96dpi
    const page = await browser.newPage({ viewport: { width: 748, height: 1123 } });
    await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(200);

    let pdf: Buffer;
    if (mode === "fit") {
      // measure the full document height (print reflow can differ slightly,
      // so add a safety buffer to never clip the footer)
      const contentHeightPx = await page.evaluate(() => {
        const el = document.querySelector(".print-area") as HTMLElement | null;
        return Math.max(
          el ? Math.ceil(el.getBoundingClientRect().height) : 0,
          document.documentElement.scrollHeight,
          600 // sanity floor — never a degenerate page
        );
      });
      // Use whole-millimetre dimensions + real margins so every PDF viewer
      // and printer treats the page as a sane custom paper size.
      const MARGIN_MM = 6;
      const PX_PER_MM = 96 / 25.4; // CSS px ↔ mm
      const contentHmm = Math.ceil(contentHeightPx / PX_PER_MM);
      const pageHmm = Math.max(140, contentHmm + MARGIN_MM * 2 + 8);
      pdf = await page.pdf({
        width: "210mm",
        height: `${pageHmm}mm`,
        printBackground: true,
        margin: { top: `${MARGIN_MM}mm`, bottom: `${MARGIN_MM}mm`, left: `${MARGIN_MM}mm`, right: `${MARGIN_MM}mm` },
        pageRanges: "1",
      });
    } else {
      pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "8mm", bottom: "8mm", left: "10mm", right: "10mm" },
      });
    }
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${name}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("PDF generation failed:", e);
    return new Response("PDF generation failed. Is Chromium installed? Run: npx playwright install chromium", { status: 500 });
  } finally {
    await browser?.close().catch(() => {});
  }
}
