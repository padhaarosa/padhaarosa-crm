import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 600 } })).newPage();

  await page.goto("http://localhost:3000/calendar?type=Departure", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    (window as any).__marker = 42; // survives client nav, dies on full reload
    window.scrollTo(0, 400);
  });
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "All", exact: true }).first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  const res = await page.evaluate(() => ({
    marker: (window as any).__marker,
    y: window.scrollY,
    url: location.href,
  }));
  console.log(`  marker=${res.marker} scrollY=${res.y} url=${res.url}`);
  console.log(res.marker === 42 ? "  → client-side nav (React swap)" : "  → FULL PAGE RELOAD happened!");
  await browser.close();
}
main();
