import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();

  const d = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await d.goto("http://localhost:3000/leads?new=1", { waitUntil: "networkidle" });
  await d.waitForTimeout(600);
  await d.screenshot({ path: "tests/shots/dialog-desktop.png" });

  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  await m.goto("http://localhost:3000/leads?new=1", { waitUntil: "networkidle" });
  await m.waitForTimeout(600);
  await m.screenshot({ path: "tests/shots/dialog-mobile.png" });

  await browser.close();
  console.log("saved dialog-desktop.png + dialog-mobile.png");
}
main();
