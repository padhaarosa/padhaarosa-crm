import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 390, height: 600 } })).newPage();
  page.on("console", (m) => console.log("  [page]", m.text()));

  await page.goto("http://localhost:3000/calendar?type=Departure", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.scrollTo(0, 400);
    let last = window.scrollY;
    console.log("start scrollY=" + last);
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 30) {
        console.log("scroll jump: " + last + " -> " + y + " at " + performance.now().toFixed(0) + "ms");
        last = y;
      }
    });
    // sample heights too
    let n = 0;
    const id = setInterval(() => {
      n++;
      console.log(`t+${n * 100}ms scrollY=${window.scrollY} docH=${document.documentElement.scrollHeight}`);
      if (n >= 12) clearInterval(id);
    }, 100);
  });
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "All", exact: true }).first().click();
  await page.waitForTimeout(3000);
  console.log("  final url:", page.url());
  const st = await page.evaluate(() => ({ flag: (window as any).__keepScrollY ?? null, y: window.scrollY }));
  console.log("  flag:", JSON.stringify(st.flag), "scrollY:", st.y);
  await browser.close();
}
main();
