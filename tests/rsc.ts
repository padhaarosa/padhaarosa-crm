import { chromium } from "playwright";
async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  const results: Record<string, number> = {};
  page.on("response", (res) => {
    const url = res.url();
    if (url.includes("_rsc=")) {
      const path = new URL(url).pathname;
      results[`${path} -> ${res.status()}`] = (results[`${path} -> ${res.status()}`] ?? 0) + 1;
    }
  });
  for (const p of ["/", "/leads", "/bookings", "/travel/tours", "/invoices"]) {
    await page.goto("http://localhost:3000" + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
  }
  console.log("RSC prefetch responses observed:");
  Object.entries(results).sort().forEach(([k, v]) => console.log(`  ${k}  x${v}`));
  const bad = Object.keys(results).filter((k) => !k.endsWith("-> 200"));
  console.log(bad.length ? `\n❌ ${bad.length} non-200 patterns` : "\n✅ every _rsc prefetch returned 200");
  await browser.close();
}
main();
