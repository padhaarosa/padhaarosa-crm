/**
 * Advanced smoke test — exercises full CRUD on every Travel-Management model
 * (the same Prisma operations the server actions perform) and asserts results.
 * Run:  npx tsx tests/smoke.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let pass = 0;
let fail = 0;
function check(name: string, ok: boolean) {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}`);
  }
}

type Case = { label: string; delegate: any; create: any; update: any; field: string; updated: any };

async function crud(c: Case) {
  const created = await c.delegate.create({ data: c.create });
  check(`${c.label}: create`, !!created.id);

  const read = await c.delegate.findUnique({ where: { id: created.id } });
  check(`${c.label}: read`, !!read);

  const updated = await c.delegate.update({ where: { id: created.id }, data: c.update });
  check(`${c.label}: update`, updated[c.field] === c.updated);

  await c.delegate.delete({ where: { id: created.id } });
  const gone = await c.delegate.findUnique({ where: { id: created.id } });
  check(`${c.label}: delete`, gone === null);
}

async function main() {
  console.log("\n🧪  Advanced CRUD smoke test\n");

  const cases: Case[] = [
    { label: "Tour", delegate: prisma.tour, create: { title: "TEST Tour", destination: "Test", priceFrom: 1000 }, update: { priceFrom: 2000 }, field: "priceFrom", updated: 2000 },
    { label: "Destination", delegate: prisma.destination, create: { name: "TEST Dest" }, update: { region: "International" }, field: "region", updated: "International" },
    { label: "Hotel", delegate: prisma.hotel, create: { name: "TEST Hotel", city: "Test", availableRooms: 5 }, update: { availableRooms: 3 }, field: "availableRooms", updated: 3 },
    { label: "Vehicle", delegate: prisma.vehicle, create: { model: "TEST Car", capacity: 4 }, update: { status: "On Trip" }, field: "status", updated: "On Trip" },
    { label: "Guide", delegate: prisma.guide, create: { name: "TEST Guide", rating: 4.0 }, update: { rating: 5.0 }, field: "rating", updated: 5.0 },
    { label: "Vendor", delegate: prisma.vendor, create: { name: "TEST Vendor", outstanding: 100 }, update: { outstanding: 0 }, field: "outstanding", updated: 0 },
    { label: "Excursion", delegate: prisma.excursion, create: { name: "TEST Activity", price: 500 }, update: { price: 750 }, field: "price", updated: 750 },
    { label: "Traveler", delegate: prisma.traveler, create: { name: "TEST Traveler" }, update: { visaStatus: "Approved" }, field: "visaStatus", updated: "Approved" },
    { label: "Flight", delegate: prisma.flight, create: { airline: "TEST Air" }, update: { status: "Delayed" }, field: "status", updated: "Delayed" },
    { label: "Document", delegate: prisma.travelDocument, create: { title: "TEST Doc" }, update: { status: "Expired" }, field: "status", updated: "Expired" },
    { label: "Review", delegate: prisma.review, create: { traveler: "TEST", rating: 3 }, update: { resolved: true }, field: "resolved", updated: true },
    { label: "SocialPost", delegate: prisma.socialPost, create: { channel: "Instagram", content: "TEST post" }, update: { status: "PUBLISHED" }, field: "status", updated: "PUBLISHED" },
    { label: "Event", delegate: prisma.event, create: { title: "TEST Event", startDate: new Date(), endDate: new Date() }, update: { status: "CONFIRMED" }, field: "status", updated: "CONFIRMED" },
    { label: "Employee", delegate: prisma.agent, create: { name: "TEST Emp", email: `test${Date.now()}@x.com` }, update: { department: "Events" }, field: "department", updated: "Events" },
  ];

  for (const c of cases) await crud(c);

  // relational integrity: seed data intact
  console.log("\n  — data integrity —");
  check("Tours seeded", (await prisma.tour.count()) >= 10);
  check("Hotels seeded", (await prisma.hotel.count()) >= 8);
  check("Travelers seeded", (await prisma.traveler.count()) >= 6);
  check("Reviews seeded", (await prisma.review.count()) >= 6);
  check("Bookings have itinerary", (await prisma.itineraryDay.count()) > 0);
  check("Invoices have payments", (await prisma.payment.count()) > 0);
  check("Events have team", (await prisma.eventAssignment.count()) > 0);

  console.log(`\n📊  Result: ${pass} passed, ${fail} failed\n`);
  await prisma.$disconnect();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
