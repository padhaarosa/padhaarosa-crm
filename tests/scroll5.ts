import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 600 } })).newPage();

  // Long page -> scroll down -> programmatic click (no Playwright scroll-into-view)
  await page.goto("http://localhost:3000/calendar?type=Departure", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "All");
    btn?.click(); // JS click — page does NOT scroll to reach it
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2500);
  const after = await page.evaluate(() => window.scrollY);
  const url = page.url();
  console.log(`  chip nav: before=${before} after=${after} url=${url.replace("http://localhost:3000", "")}`);
  console.log(`  → ${after >= Math.min(before, 300) - 60 ? "✅ SCROLL PRESERVED" : "❌ jumped to top"}`);

  // Also test a detail-page status chip (router.refresh pattern)
  const inv = await page.goto("http://localhost:3000/invoices", { waitUntil: "networkidle" });
  const link = await page.locator('a[href^="/invoices/"]').first().getAttribute("href");
  await page.goto("http://localhost:3000" + link, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  const b2 = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Partial");
    btn?.click();
  });
  await page.waitForTimeout(2500);
  const a2 = await page.evaluate(() => window.scrollY);
  console.log(`  status chip (detail page): before=${b2} after=${a2} → ${a2 >= Math.min(b2, 300) - 60 ? "✅ PRESERVED" : "❌ jumped"}`);

  await browser.close();
}
main();
