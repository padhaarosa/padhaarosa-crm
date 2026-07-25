import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const c = {
    leads: await p.lead.count(),
    bookings: await p.booking.count(),
    invoices: await p.invoice.count(),
    agents: await p.agent.count(),
    events: await p.event.count(),
    tours: await p.tour.count(),
    hotels: await p.hotel.count(),
    travelers: await p.traveler.count(),
    socialAccounts: await p.socialAccount.count(),
    posts: await p.socialPost.count(),
    settings: await p.setting.count(),
  };
  console.log(c);
}
main().finally(() => p.$disconnect());
