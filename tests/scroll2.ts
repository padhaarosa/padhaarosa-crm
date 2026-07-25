import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 600 } })).newPage();

  const maxScroll = () => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

  // Case A: filter where result is SHORTER -> expect clamped to max (preserved, not reset)
  await page.goto("http://localhost:3000/invoices", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.getByRole("button", { name: "Paid", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(700);
  const yA = await page.evaluate(() => window.scrollY);
  const mA = await maxScroll();
  console.log(`  A) shorter page:  scrollY=${yA} pageMax=${mA} → ${Math.abs(yA - mA) < 40 ? "✅ clamped to bottom (preserved)" : yA === 0 ? "❌ reset to top" : "✅ preserved"}`);

  // Case B: navigate All -> All (same long content) -> scroll must stay ~500
  await page.goto("http://localhost:3000/calendar?type=Departure", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  const bB = await page.evaluate(() => window.scrollY);
  const mB0 = await maxScroll();
  await page.getByRole("button", { name: "All", exact: true }).first().click(); // -> /calendar (longer page)
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(700);
  const yB = await page.evaluate(() => window.scrollY);
  console.log(`  B) longer page:   before=${bB} (max was ${mB0}) after=${yB} → ${yB >= Math.min(bB, 250) ? "✅ scroll preserved" : "❌ reset to top"}`);

  await browser.close();
}
main();
