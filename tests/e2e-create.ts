import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const BASE = "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  let ok = true;

  // ---- Create QUOTATION by typing a new customer (the previously-broken flow) ----
  console.log("\n🧪 E2E: create Quotation with a typed-in new customer");
  await page.goto(BASE + "/quotes", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "New Quotation" }).first().click();
  await page.waitForTimeout(400);
  await page.locator('input[name="customerName"]').fill("E2E Walkin Customer");
  await page.locator('input[name="title"]').fill("E2E Test Package");
  await page.locator('input[placeholder="Item / service"]').first().fill("Deluxe Rajasthan Tour");
  // set a rate on the first line (2nd number input in the row block)
  const rowNumbers = page.locator('input[type="number"]');
  await rowNumbers.nth(0).fill("2");   // qty
  await rowNumbers.nth(1).fill("25000"); // rate
  await page.getByRole("button", { name: "Create Quotation" }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  const qUrl = page.url();
  const qText = await page.locator("body").innerText();
  const qOk = /\/quotes\/[a-z0-9]{20,}/.test(qUrl) && qText.includes("E2E Walkin Customer") && qText.includes("QUOTATION");
  console.log(`  ${qOk ? "✅" : "❌"} quotation created & customer auto-added → ${qUrl.replace(BASE, "")}`);
  ok = ok && qOk;

  // ---- Create a TOUR via the resource manager ----
  console.log("\n🧪 E2E: create a Tour Package");
  await page.goto(BASE + "/travel/tours", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add Tour" }).first().click();
  await page.waitForTimeout(400);
  await page.locator('input[name="title"]').fill("E2E Signature Tour");
  await page.locator('input[name="destination"]').fill("Jaipur, Udaipur");
  await page.locator('form button[type="submit"]').click();
  await page.waitForTimeout(800);
  const tText = await page.locator("body").innerText();
  const tOk = tText.includes("E2E Signature Tour");
  console.log(`  ${tOk ? "✅" : "❌"} tour created & shows in table`);
  ok = ok && tOk;

  // ---- Edit inline: change a booking status chip ----
  console.log("\n🧪 E2E: booking status change (interactivity)");
  const booking = await prisma.booking.findFirst();
  if (booking) {
    await page.goto(BASE + `/bookings/${booking.id}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Completed" }).click();
    await page.waitForTimeout(900);
    const updated = await prisma.booking.findUnique({ where: { id: booking.id } });
    const sOk = updated?.status === "COMPLETED";
    console.log(`  ${sOk ? "✅" : "❌"} booking status updated via chip → ${updated?.status}`);
    ok = ok && sOk;
    await prisma.booking.update({ where: { id: booking.id }, data: { status: booking.status } });
  }

  // cleanup created records
  await prisma.quoteItem.deleteMany({ where: { quote: { lead: { name: "E2E Walkin Customer" } } } });
  await prisma.quote.deleteMany({ where: { lead: { name: "E2E Walkin Customer" } } });
  await prisma.lead.deleteMany({ where: { name: "E2E Walkin Customer" } });
  await prisma.tour.deleteMany({ where: { title: "E2E Signature Tour" } });
  console.log("\n  🧹 cleaned up E2E records");

  await browser.close();
  await prisma.$disconnect();
  console.log(`\n${ok ? "✅ ALL E2E CREATE/EDIT FLOWS WORK" : "❌ SOME FLOWS FAILED"}`);
  process.exit(ok ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
