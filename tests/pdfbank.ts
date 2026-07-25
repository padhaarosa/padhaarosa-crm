import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
const p = new PrismaClient();
const BASE = "http://localhost:3000";

async function main() {
  const inv = await p.invoice.findFirst({ include: { lead: true } });
  if (!inv) throw new Error("no invoice");

  // 1. default: bank details visible
  let html = await (await fetch(`${BASE}/invoices/${inv.id}`)).text();
  console.log("  " + (html.includes("Payment Details") && html.includes("HDFC Bank") ? "✅" : "❌") + " bank details shown by default");

  // 2. toggle off -> hidden
  await p.invoice.update({ where: { id: inv.id }, data: { showBank: false } });
  html = await (await fetch(`${BASE}/invoices/${inv.id}`)).text();
  const bankGone = !html.includes("50100123456789");
  console.log("  " + (bankGone ? "✅" : "❌") + " bank details hidden when toggled off");

  // 3. PDF endpoint returns a real PDF
  const res = await fetch(`${BASE}/api/pdf?path=/invoices/${inv.id}&name=${inv.number}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const isPdf = res.status === 200 && buf.subarray(0, 4).toString() === "%PDF";
  console.log("  " + (isPdf ? "✅" : "❌") + ` /api/pdf returns a PDF (status=${res.status}, ${Math.round(buf.length / 1024)} KB, ct=${res.headers.get("content-type")})`);
  if (isPdf) writeFileSync("tests/shots/download-nobank.pdf", buf);

  // 4. invalid path rejected
  const bad = await fetch(`${BASE}/api/pdf?path=/settings&name=x`);
  console.log("  " + (bad.status === 400 ? "✅" : "❌") + " non-document paths rejected (" + bad.status + ")");

  // restore
  await p.invoice.update({ where: { id: inv.id }, data: { showBank: true } });
  await p.$disconnect();
}
main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1); });
