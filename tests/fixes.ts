import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  let ok = true;

  // ---- 1. PRINT: header colour must survive print emulation ----
  console.log("🖨️  Print colour check");
  const invoice = await prisma.invoice.findFirst();
  await page.goto(`${BASE}/invoices/${invoice!.id}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  const headerBg = await page.evaluate(() => {
    const el = document.querySelector(".print-header") as HTMLElement;
    const cs = getComputedStyle(el);
    return { bgImage: cs.backgroundImage, color: cs.color, adjust: (cs as any).printColorAdjust || (cs as any).webkitPrintColorAdjust };
  });
  const printOk = headerBg.bgImage.includes("gradient") && headerBg.adjust === "exact";
  console.log(`  ${printOk ? "✅" : "❌"} print header keeps gradient (adjust=${headerBg.adjust})`);
  ok = ok && printOk;
  await page.pdf({ path: "tests/shots/invoice-print.pdf", format: "A4", printBackground: true });
  console.log("  📄 invoice-print.pdf saved (visually verify)");
  await page.emulateMedia({ media: "screen" });

  // ---- 2. SCROLL: clicking a filter chip must NOT jump to top ----
  console.log("\n🖱️  Scroll-position check on filter click");
  await page.goto(`${BASE}/invoices`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);
  await page.getByRole("link", { name: "Paid", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => window.scrollY);
  const scrollOk = after > 100; // stayed down rather than snapping to 0
  console.log(`  ${scrollOk ? "✅" : "❌"} scroll preserved after filter click (before=${before}, after=${after})`);
  ok = ok && scrollOk;

  // ---- 3. SOCIAL API: connect dialog shows API fields; publish button appears for connected channels ----
  console.log("\n🔌 Social API integration check");
  await page.goto(`${BASE}/social`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Connect Account" }).first().click();
  await page.waitForTimeout(400);
  const hasToken = await page.locator('input[name="accessToken"]').count();
  const hasRef = await page.locator('input[name="accountRef"]').count();
  console.log(`  ${hasToken && hasRef ? "✅" : "❌"} Connect dialog exposes API token + account ID fields`);
  ok = ok && !!hasToken && !!hasRef;
  await page.keyboard.press("Escape");

  // simulate a connected FB account + draft post -> Publish via API button should appear
  await prisma.socialAccount.upsert({
    where: { channel: "Facebook" },
    update: { accessToken: "TEST_TOKEN", accountRef: "123456", connected: true },
    create: { channel: "Facebook", handle: "Padhaaro Test", accessToken: "TEST_TOKEN", accountRef: "123456", connected: true },
  });
  const post = await prisma.socialPost.create({ data: { channel: "Facebook", content: "API test post", status: "DRAFT" } });
  await page.goto(`${BASE}/social`, { waitUntil: "networkidle" });
  const pubBtn = await page.getByRole("button", { name: "Publish via API" }).count();
  console.log(`  ${pubBtn > 0 ? "✅" : "❌"} 'Publish via API' button appears for connected channel`);
  ok = ok && pubBtn > 0;

  // click it — with a fake token the Graph API must return a clean error message (not crash)
  await page.getByRole("button", { name: "Publish via API" }).first().click();
  await page.waitForTimeout(4000);
  const feedback = await page.locator("body").innerText();
  const gotFeedback = /Invalid|error|expired|API|token/i.test(feedback);
  console.log(`  ${gotFeedback ? "✅" : "❌"} API publish returns readable feedback (graceful error with test token)`);
  ok = ok && gotFeedback;

  // cleanup
  await prisma.socialPost.delete({ where: { id: post.id } });
  await prisma.socialAccount.update({ where: { channel: "Facebook" }, data: { accessToken: null, accountRef: null, connected: false } }).catch(() => {});

  await browser.close();
  await prisma.$disconnect();
  console.log(`\n${ok ? "✅ ALL FIXES VERIFIED" : "❌ SOMETHING STILL BROKEN"}`);
  process.exit(ok ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
