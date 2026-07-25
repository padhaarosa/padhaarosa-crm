import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { mkdirSync } from "fs";

const prisma = new PrismaClient();
const BASE = "http://localhost:3000";
const DIR = "tests/shots";

async function main() {
  mkdirSync(DIR, { recursive: true });
  const quote = await prisma.quote.findFirst();
  const invoice = await prisma.invoice.findFirst();
  const booking = await prisma.booking.findFirst();

  const browser = await chromium.launch();

  // ---------- DESKTOP ----------
  const desk = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const d = await desk.newPage();
  const shot = async (path: string, file: string, full = true) => {
    await d.goto(BASE + path, { waitUntil: "networkidle" });
    await d.waitForTimeout(600);
    await d.screenshot({ path: `${DIR}/${file}`, fullPage: full });
    console.log(`  📸 ${file}`);
  };
  await shot("/", "desktop-dashboard.png");
  await shot("/leads", "desktop-leads.png");
  await shot("/travel/tours", "desktop-tours.png");
  await shot("/social", "desktop-social.png");
  if (quote) await shot(`/quotes/${quote.id}`, "desktop-quote.png");

  // ---------- MOBILE ----------
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const m = await mob.newPage();
  const mshot = async (path: string, file: string) => {
    await m.goto(BASE + path, { waitUntil: "networkidle" });
    await m.waitForTimeout(600);
    await m.screenshot({ path: `${DIR}/${file}`, fullPage: true });
    console.log(`  📱 ${file}`);
  };
  await mshot("/", "mobile-dashboard.png");
  await mshot("/travel/tours", "mobile-tours.png");
  if (quote) await mshot(`/quotes/${quote.id}`, "mobile-quote.png");
  if (invoice) await mshot(`/invoices/${invoice.id}`, "mobile-invoice.png");

  // ---------- E2E: create a lead through the real UI ----------
  console.log("\n  🧪 E2E: create lead via UI");
  await d.goto(BASE + "/leads", { waitUntil: "networkidle" });
  await d.getByRole("button", { name: "New Lead" }).first().click();
  await d.waitForTimeout(400);
  await d.locator('input[name="name"]').fill("E2E Browser Lead");
  await d.locator('input[name="phone"]').fill("+91 90000 11111");
  await d.locator('input[name="destination"]').fill("Playwright Test Destination");
  await d.screenshot({ path: `${DIR}/e2e-lead-form.png` });
  await d.getByRole("button", { name: "Create Lead" }).click();
  await d.waitForLoadState("networkidle");
  await d.waitForTimeout(600);
  const url = d.url();
  const bodyText = await d.locator("body").innerText();
  const ok = /\/leads\/[a-z0-9]{20,}/.test(url) && bodyText.includes("E2E Browser Lead");
  console.log(`  ${ok ? "✅" : "❌"} lead created via UI → ${url}`);
  await d.screenshot({ path: `${DIR}/e2e-lead-detail.png`, fullPage: true });

  // verify it persisted in DB
  const created = await prisma.lead.findFirst({ where: { name: "E2E Browser Lead" } });
  console.log(`  ${created ? "✅" : "❌"} lead persisted in database`);
  // cleanup
  if (created) await prisma.lead.delete({ where: { id: created.id } });

  await browser.close();
  await prisma.$disconnect();
  console.log("\n  Done.");
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
