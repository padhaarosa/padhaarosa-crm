import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const inv = await p.invoice.findFirst();
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ acceptDownloads: true })).newPage();
  await page.goto(`http://localhost:3000/invoices/${inv!.id}`, { waitUntil: "networkidle" });
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 30000 }),
    page.getByRole("link", { name: "Download PDF" }).click(),
  ]);
  const file = "tests/shots/clicked-download.pdf";
  await download.saveAs(file);
  console.log(`  ✅ browser click downloaded: ${download.suggestedFilename()}`);
  await browser.close();
  await p.$disconnect();
}
main().catch(async (e) => { console.error("  ❌ " + e.message); await p.$disconnect(); process.exit(1); });
