import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  // small viewport => every page has plenty of scroll distance
  const page = await (await browser.newContext({ viewport: { width: 390, height: 600 } })).newPage();

  // /invoices — server-navigating filter chips
  await page.goto("http://localhost:3000/invoices", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const b1 = await page.evaluate(() => window.scrollY);
  await page.getByRole("link", { name: "Paid", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(700);
  const a1 = await page.evaluate(() => window.scrollY);
  console.log(`  invoices filter: before=${b1} after=${a1} → ${a1 >= b1 - 60 && a1 > 0 ? "✅ preserved" : "❌ jumped to top"}`);

  // /calendar — filter chips
  await page.goto("http://localhost:3000/calendar", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const b2 = await page.evaluate(() => window.scrollY);
  await page.getByRole("link", { name: "Flight", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(700);
  const a2 = await page.evaluate(() => window.scrollY);
  console.log(`  calendar filter: before=${b2} after=${a2} → ${a2 >= b2 - 60 && a2 > 0 ? "✅ preserved" : "❌ jumped to top"}`);

  // /travel/tours — client-side filter buttons (no navigation, should never jump)
  await page.goto("http://localhost:3000/travel/tours", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(300);
  const b3 = await page.evaluate(() => window.scrollY);
  await page.getByRole("button", { name: "Honeymoon", exact: true }).first().click();
  await page.waitForTimeout(500);
  const a3 = await page.evaluate(() => window.scrollY);
  console.log(`  tours filter (client): before=${b3} after=${a3} → ${a3 >= b3 - 60 ? "✅ preserved" : "❌ jumped"}`);

  await browser.close();
}
main();
