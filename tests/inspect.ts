import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 768 } })).newPage();
  await page.goto("http://localhost:3000/leads?new=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const info = await page.evaluate(`(() => {
    const label = document.querySelector("form label");
    const h2 = document.querySelector("h2");
    const out = [];
    let cur = label;
    while (cur && out.length < 9) {
      out.push(cur.tagName + "." + String(cur.className).slice(0, 44) + " -> " + getComputedStyle(cur).textAlign);
      cur = cur.parentElement;
    }
    return {
      labelDisplay: label ? getComputedStyle(label).display : "n/a",
      h2Align: h2 ? getComputedStyle(h2).textAlign : "n/a",
      chain: out,
    };
  })()`);
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}
main();
