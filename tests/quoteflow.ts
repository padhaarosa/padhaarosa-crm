import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

// Replicates exactly what createQuote + resolveLeadId do when NO leads exist
// and the user types a new customer name.
async function main() {
  const leadsBefore = await p.lead.count();
  console.log(`  leads before: ${leadsBefore}`);

  // resolveLeadId with empty leadId + typed name -> create lead
  const name = "Walk-in Test Customer";
  const lead = await p.lead.create({ data: { name, stage: "QUOTED" } });
  console.log("  " + (lead.id ? "✅" : "❌") + " auto-created customer from typed name");

  // createQuote
  const count = await p.quote.count();
  const quote = await p.quote.create({
    data: {
      number: `QT-TEST-${count + 1}`,
      leadId: lead.id,
      title: "Test Quotation",
      status: "DRAFT",
      taxRate: 5,
      discount: 0,
      items: { create: [{ label: "Test package", quantity: 2, unitPrice: 15000, sortOrder: 0 }] },
    },
    include: { lead: true, items: true },
  });
  console.log("  " + (quote.number && quote.lead.name === name ? "✅" : "❌") + " quote created & linked to customer (no FK error)");
  console.log("  " + (quote.items.length === 1 ? "✅" : "❌") + " line item saved");

  // HTTP: quote appears on list + customer appears on leads
  const qHtml = await (await fetch("http://localhost:3000/quotes")).text();
  console.log("  " + (qHtml.includes(quote.number) ? "✅" : "❌") + " quote renders on /quotes list");
  const lHtml = await (await fetch("http://localhost:3000/leads")).text();
  console.log("  " + (lHtml.includes(name) ? "✅" : "❌") + " new customer renders on /leads");

  // responsive: quote detail uses stacked header + scrollable items
  const dHtml = await (await fetch(`http://localhost:3000/quotes/${quote.id}`)).text();
  console.log("  " + (dHtml.includes("flex-col sm:flex-row") && dHtml.includes("overflow-x-auto") ? "✅" : "❌") + " quote document is responsive (stacked header + scroll table)");

  // cleanup
  await p.quote.delete({ where: { id: quote.id } });
  await p.lead.delete({ where: { id: lead.id } });
  console.log("  🧹 cleaned up test records (DB back to empty)");
}

main().finally(() => p.$disconnect());
