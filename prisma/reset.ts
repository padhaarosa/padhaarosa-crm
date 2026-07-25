/**
 * Clears ALL demo/business data so every section starts empty.
 * Keeps only the company Settings row (your branding & billing config).
 * Run:  npm run reset
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹  Clearing all demo data…");

  // order matters for foreign keys
  await prisma.eventAssignment.deleteMany();
  await prisma.event.deleteMany();
  await prisma.socialPost.deleteMany();
  await prisma.socialAccount.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.itineraryDay.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lead.deleteMany();

  // travel-management catalog
  await prisma.tour.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.excursion.deleteMany();
  await prisma.traveler.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.travelDocument.deleteMany();
  await prisma.review.deleteMany();

  // team
  await prisma.agent.deleteMany();

  // keep a company settings row so quotes/invoices still have a header
  await prisma.setting.upsert({ where: { id: "company" }, update: {}, create: { id: "company" } });

  console.log("✅  Done. Every section is now empty and ready for your real data.");
  console.log("   (Company branding kept — edit it on the Settings page.)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
