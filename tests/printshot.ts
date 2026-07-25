import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const inv = await prisma.invoice.findFirst();
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 760, height: 1075 } })).newPage();
  await page.goto(`http://localhost:3000/invoices/${inv!.id}`, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "tests/shots/print-emulated.png", fullPage: false });
  await browser.close();
  await prisma.$disconnect();
  console.log("saved print-emulated.png");
}
main();
