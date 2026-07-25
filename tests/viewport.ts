import { chromium } from "playwright";
async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "tests/shots/viewport-dashboard.png" }); // NOT fullPage
  await browser.close();
  console.log("captured viewport-dashboard.png");
}
main();
