import { chromium } from "playwright";
async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await page.goto("http://localhost:3000/leads?new=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const info = await page.evaluate(`(() => {
    const labels = [...document.querySelectorAll(".label")].slice(0, 3);
    return labels.map(l => {
      const r = l.getBoundingClientRect();
      const p = l.parentElement.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(l);
      const t = range.getBoundingClientRect();
      return { text: l.textContent.trim(), boxX: Math.round(r.x), boxW: Math.round(r.width), parentX: Math.round(p.x), parentW: Math.round(p.width), textX: Math.round(t.x), textW: Math.round(t.width) };
    });
  })()`);
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}
main();
