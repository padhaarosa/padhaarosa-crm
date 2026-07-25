import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const BASE = "http://localhost:3000";

let pass = 0, fail = 0;
const failures: string[] = [];

async function checkPage(path: string, mustInclude: string[]) {
  let status = 0, body = "";
  try {
    const res = await fetch(BASE + path);
    status = res.status;
    body = (await res.text()).replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
  } catch (e) {
    fail++; failures.push(`${path} — FETCH FAILED: ${e}`); console.log(`  ❌ ${path} (fetch failed)`); return;
  }

  const errMarkers = ["Application error", "Internal Server Error", "could not be found", "TypeError", "ReferenceError", "PrismaClient"];
  const hitErr = errMarkers.find((m) => body.includes(m));
  const missing = mustInclude.filter((m) => !body.includes(m));

  if (status !== 200) { fail++; failures.push(`${path} — HTTP ${status}`); console.log(`  ❌ ${path} (HTTP ${status})`); return; }
  if (hitErr) { fail++; failures.push(`${path} — error marker "${hitErr}"`); console.log(`  ❌ ${path} (error: ${hitErr})`); return; }
  if (missing.length) { fail++; failures.push(`${path} — missing content: ${missing.join(", ")}`); console.log(`  ❌ ${path} (missing: ${missing.join(", ")})`); return; }
  pass++; console.log(`  ✅ ${path}`);
}

async function main() {
  const lead = await p.lead.findFirst({ orderBy: { createdAt: "asc" } });
  const booking = await p.booking.findFirst();
  const quote = await p.quote.findFirst();
  const invoice = await p.invoice.findFirst();
  const event = await p.event.findFirst();

  console.log("\n🔎  Rendering every page with data\n");

  console.log("— core —");
  await checkPage("/", ["Revenue Collected", "Sales Pipeline", "Upcoming Events", "Social Reach"]);
  await checkPage("/reports", ["Agent Leaderboard", "Revenue Trend", "Tours by Category"]);
  await checkPage("/calendar", ["Travel Calendar", "Departures"]);

  console.log("— leads —");
  await checkPage("/leads", ["Leads & Contacts", "Total Leads"]);
  await checkPage("/leads?view=list", ["Leads & Contacts"]);
  if (lead) await checkPage(`/leads/${lead.id}`, [lead.name, "Activity & Follow-ups", "Contact & Trip"]);

  console.log("— bookings —");
  await checkPage("/bookings", ["Bookings & Trips", "Total Trips"]);
  if (booking) await checkPage(`/bookings/${booking.id}`, [booking.title, "Itinerary", "Trip Route", "Customer"]);

  console.log("— quotes —");
  await checkPage("/quotes", ["Quotations", "Total Quotes"]);
  if (quote) await checkPage(`/quotes/${quote.id}`, [quote.number, "QUOTATION", "Grand Total"]);

  console.log("— invoices —");
  await checkPage("/invoices", ["Invoices & Payments", "Total Invoiced"]);
  if (invoice) await checkPage(`/invoices/${invoice.id}`, [invoice.number, "INVOICE", "Balance", "Payment Details"]);

  console.log("— events / team / social —");
  await checkPage("/events", ["Events & MICE", "Total Events"]);
  if (event) await checkPage(`/events/${event.id}`, [event.title, "Events Team", "Route & Venue"]);
  await checkPage("/team", ["Team & Employees", "Target achievement"]);
  await checkPage("/social", ["Social Media", "Total Followers", "Content Calendar"]);
  await checkPage("/settings", ["Company & Branding", "Payment Details"]);

  console.log("— travel management (11 modules) —");
  await checkPage("/travel/tours", ["Tour Packages", "Total Tours"]);
  await checkPage("/travel/destinations", ["Destinations"]);
  await checkPage("/travel/hotels", ["Hotels", "Rooms Available"]);
  await checkPage("/travel/flights", ["Flights"]);
  await checkPage("/travel/transport", ["Transport & Fleet", "Fleet Size"]);
  await checkPage("/travel/activities", ["Activities & Sightseeing"]);
  await checkPage("/travel/guides", ["Tour Guides"]);
  await checkPage("/travel/travelers", ["Travelers"]);
  await checkPage("/travel/vendors", ["Vendors & Suppliers"]);
  await checkPage("/travel/documents", ["Travel Documents"]);
  await checkPage("/travel/reviews", ["Reviews & Feedback"]);

  console.log(`\n📊  ${pass} passed, ${fail} failed`);
  if (failures.length) { console.log("\nFAILURES:"); failures.forEach((f) => console.log("  • " + f)); }
  await p.$disconnect();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await p.$disconnect(); process.exit(1); });
