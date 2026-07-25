import { chromium } from "playwright";
async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await page.goto("http://localhost:3000/leads?new=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const pos = await page.evaluate(`(() => {
    const out = [];
    document.querySelectorAll(".label").forEach((l, i) => {
      if (i > 2) return;
      l.style.outline = "2px solid red";
      const r = l.getBoundingClientRect();
      out.push(l.textContent.trim() + " box:" + Math.round(r.x) + "w" + Math.round(r.width) + " align:" + getComputedStyle(l).textAlign + " justify:" + getComputedStyle(l).justifySelf);
    });
    return out;
  })()`);
  console.log(JSON.stringify(pos, null, 2));
  await page.screenshot({ path: "tests/shots/dialog-outlined.png", clip: { x: 299, y: 60, width: 770, height: 260 } });
  await browser.close();
}
main();
