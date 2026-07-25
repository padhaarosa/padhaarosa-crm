import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const t = await p.tour.create({ data: { title: "Temp Tour", destination: "Jaipur", priceFrom: 1000 } });
  const html = await (await fetch("http://localhost:3000/travel/tours")).text();
  console.log("  " + (html.includes("min-w-[720px]") ? "✅" : "❌") + " tour table has mobile-scroll min-width (with rows)");
  console.log("  " + (html.includes("Temp Tour") ? "✅" : "❌") + " tour row renders");
  await p.tour.delete({ where: { id: t.id } });

  const q = await p.lead.create({ data: { name: "Temp C" } });
  const qt = await p.quote.create({ data: { number: "QT-R-1", leadId: q.id, title: "T" } });
  const qhtml = await (await fetch("http://localhost:3000/quotes")).text();
  console.log("  " + (qhtml.includes("min-w-[680px]") ? "✅" : "❌") + " quotes table has mobile-scroll min-width (with rows)");
  await p.quote.delete({ where: { id: qt.id } });
  await p.lead.delete({ where: { id: q.id } });
  console.log("  🧹 cleaned up");
}
main().finally(() => p.$disconnect());
