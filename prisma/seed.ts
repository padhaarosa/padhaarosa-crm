import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

// Every seeded agent gets the same starter password; override with SEED_PASSWORD.
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "padhaaro123";
const seedHash = hashPassword(SEED_PASSWORD);

// helper: days offset from today
const d = (offset: number) => {
  const dt = new Date();
  dt.setHours(12, 0, 0, 0);
  dt.setDate(dt.getDate() + offset);
  return dt;
};

async function main() {
  console.log("🌱  Seeding Padhaaro CRM…");

  // wipe (order matters for FKs)
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
  await prisma.agent.deleteMany();

  // ---- Settings ----
  await prisma.setting.upsert({
    where: { id: "company" },
    update: {},
    create: {
      id: "company",
      companyName: "Padhaaro Sa..",
      tagline: "Hospitality Services",
      email: "hello@padhaaro.com",
      phone: "+91 98290 45678",
      website: "www.padhaaro.com",
      address: "C-24, Bani Park, Jaipur, Rajasthan 302016",
      gstin: "08ABCDE1234F1Z5",
      upiId: "padhaaro@hdfcbank",
      bankName: "HDFC Bank",
      bankAccount: "50100123456789",
      bankIfsc: "HDFC0000123",
      invoiceNotes: "Thank you for choosing Padhaaro Sa.. — Padharo mhare desh! 🐫",
    },
  });

  // ---- Agents / Team ----
  const meera = await prisma.agent.create({
    data: { name: "Meera Rathore", email: "meera@padhaaro.com", phone: "+91 98290 11111", role: "Admin", designation: "Founder & CEO", department: "Leadership", location: "Jaipur", target: 2000000, joinedAt: d(-1400) },
  });
  const vikram = await prisma.agent.create({
    data: { name: "Vikram Singh", email: "vikram@padhaaro.com", phone: "+91 98290 22222", role: "Manager", designation: "Sales Manager", department: "Sales", location: "Jaipur", target: 1200000, joinedAt: d(-900) },
  });
  const anjali = await prisma.agent.create({
    data: { name: "Anjali Sharma", email: "anjali@padhaaro.com", phone: "+91 98290 33333", role: "Agent", designation: "Senior Travel Consultant", department: "Sales", location: "Udaipur", target: 800000, joinedAt: d(-500) },
  });
  const rohit = await prisma.agent.create({
    data: { name: "Rohit Verma", email: "rohit@padhaaro.com", phone: "+91 98290 44444", role: "Agent", designation: "Travel Consultant", department: "Operations", location: "Jodhpur", target: 600000, joinedAt: d(-300) },
  });
  const sneha = await prisma.agent.create({
    data: { name: "Sneha Reddy", email: "sneha@padhaaro.com", phone: "+91 98290 55555", role: "Agent", designation: "Events & MICE Lead", department: "Events", location: "Jaipur", target: 900000, joinedAt: d(-620) },
  });
  const arjun = await prisma.agent.create({
    data: { name: "Arjun Nair", email: "arjun@padhaaro.com", phone: "+91 98290 66666", role: "Agent", designation: "Digital Marketing Lead", department: "Marketing", location: "Jaipur", target: 400000, joinedAt: d(-240) },
  });

  // Everyone can sign in with the starter password until they change it.
  await prisma.agent.updateMany({ data: { passwordHash: seedHash } });

  const agents = [meera, vikram, anjali, rohit, sneha];
  const pick = (i: number) => agents[i % agents.length];

  // ---- Leads ----
  const leadSeed = [
    { name: "Rohan Mehta", email: "rohan.mehta@gmail.com", phone: "+91 98111 22334", source: "Website", stage: "NEW", priority: "HIGH", destination: "Udaipur & Mount Abu", travelDate: d(38), pax: 4, budget: 145000, company: "Mehta & Co." },
    { name: "Priya Nair", email: "priya.nair@outlook.com", phone: "+91 99000 55667", source: "Instagram", stage: "CONTACTED", priority: "MEDIUM", destination: "Golden Triangle (Delhi-Agra-Jaipur)", travelDate: d(52), pax: 2, budget: 68000 },
    { name: "The Kapoor Family", email: "s.kapoor@gmail.com", phone: "+91 98730 00112", source: "Referral", stage: "QUOTED", priority: "HIGH", destination: "Jaisalmer Desert Safari", travelDate: d(29), pax: 6, budget: 220000 },
    { name: "James Wilson", email: "james.w@britmail.co.uk", phone: "+44 7700 900123", source: "Website", stage: "NEGOTIATION", priority: "HIGH", destination: "Royal Rajasthan (14 nights)", travelDate: d(74), pax: 2, budget: 480000, company: "Wilson Travels UK" },
    { name: "Ananya Iyer", email: "ananya.iyer@gmail.com", phone: "+91 90000 12345", source: "WhatsApp", stage: "WON", priority: "MEDIUM", destination: "Pushkar Fair Special", travelDate: d(18), pax: 3, budget: 96000 },
    { name: "Deepak Agarwal", email: "deepak.a@yahoo.com", phone: "+91 98290 99887", source: "Walk-in", stage: "WON", priority: "MEDIUM", destination: "Ranthambore Tiger Trail", travelDate: d(11), pax: 4, budget: 128000 },
    { name: "Sophie Laurent", email: "sophie.l@bonjour.fr", phone: "+33 6 12 34 56 78", source: "Referral", stage: "CONTACTED", priority: "LOW", destination: "Jodhpur Blue City", travelDate: d(96), pax: 2, budget: 72000 },
    { name: "Arjun Reddy", email: "arjun.reddy@gmail.com", phone: "+91 91000 44556", source: "Phone", stage: "NEW", priority: "MEDIUM", destination: "Bikaner & Camel Farm", travelDate: d(61), pax: 5, budget: 110000 },
    { name: "Hina Qureshi", email: "hina.q@gmail.com", phone: "+91 99887 66554", source: "Instagram", stage: "LOST", priority: "LOW", destination: "Shekhawati Havelis", travelDate: d(20), pax: 2, budget: 40000, lostReason: "Went with a cheaper operator" },
    { name: "Global Voyages Inc.", email: "trips@globalvoyages.com", phone: "+1 415 555 0182", source: "Website", stage: "NEGOTIATION", priority: "HIGH", destination: "Rajasthan Palace Circuit (group of 18)", travelDate: d(120), pax: 18, budget: 1250000, company: "Global Voyages Inc." },
    { name: "Neha Bhatt", email: "neha.bhatt@gmail.com", phone: "+91 97000 33221", source: "Referral", stage: "QUOTED", priority: "MEDIUM", destination: "Udaipur Honeymoon", travelDate: d(44), pax: 2, budget: 155000 },
    { name: "Karan Malhotra", email: "karan.m@gmail.com", phone: "+91 98290 77665", source: "WhatsApp", stage: "NEW", priority: "LOW", destination: "Weekend in Jaipur", travelDate: d(15), pax: 2, budget: 28000 },
  ];

  const leads = [];
  for (let i = 0; i < leadSeed.length; i++) {
    const l = leadSeed[i];
    const lead = await prisma.lead.create({
      data: {
        ...l,
        agentId: pick(i).id,
        notes: "Enquiry captured via " + l.source + ". Interested in " + l.destination + ".",
      },
    });
    leads.push(lead);
  }

  // ---- Activities / follow-ups ----
  await prisma.activity.createMany({
    data: [
      { leadId: leads[0].id, type: "CALL", title: "Discovery call", detail: "Understand preferences, dates flexible.", dueDate: d(1), done: false },
      { leadId: leads[1].id, type: "WHATSAPP", title: "Send Golden Triangle brochure", dueDate: d(0), done: false },
      { leadId: leads[2].id, type: "EMAIL", title: "Follow up on shared quote", detail: "Quote QT valid for 10 days.", dueDate: d(2), done: false },
      { leadId: leads[3].id, type: "MEETING", title: "Video call to finalise luxury hotels", dueDate: d(3), done: false },
      { leadId: leads[3].id, type: "NOTE", title: "Prefers Oberoi & Taj properties", done: true },
      { leadId: leads[9].id, type: "CALL", title: "Negotiate group rate", detail: "Push for 12% margin.", dueDate: d(1), done: false },
      { leadId: leads[10].id, type: "TASK", title: "Prepare honeymoon itinerary draft", dueDate: d(2), done: false },
      { leadId: leads[6].id, type: "EMAIL", title: "Introductory email sent", done: true },
    ],
  });

  // ---- Bookings + itineraries ----
  // Booking 1 — Ananya (WON) Pushkar
  const b1 = await prisma.booking.create({
    data: {
      reference: "PDH-2026-0001",
      title: "Pushkar Fair Special",
      destination: "Pushkar & Ajmer",
      status: "CONFIRMED",
      startDate: d(18),
      endDate: d(21),
      pax: 3,
      adults: 3,
      children: 0,
      totalAmount: 96000,
      leadId: leads[4].id,
      agentId: meera.id,
      notes: "Camel cart ride + hot air balloon add-on requested.",
      days: {
        create: [
          { dayNumber: 1, date: d(18), title: "Arrival in Pushkar", location: "Pushkar", hotel: "Ananta Spa & Resort", meals: "Dinner", activities: "Ghat aarti at Pushkar Lake, evening at fairgrounds", transport: "AC Sedan from Jaipur" },
          { dayNumber: 2, date: d(19), title: "Pushkar Camel Fair", location: "Pushkar", hotel: "Ananta Spa & Resort", meals: "Breakfast, Dinner", activities: "Camel trading grounds, cultural performances, hot air balloon at dawn", transport: "Camel cart" },
          { dayNumber: 3, date: d(20), title: "Ajmer Sharif & Brahma Temple", location: "Ajmer", hotel: "Ananta Spa & Resort", meals: "Breakfast", activities: "Ajmer Dargah, Brahma Temple, Savitri temple ropeway", transport: "AC Sedan" },
          { dayNumber: 4, date: d(21), title: "Departure", location: "Pushkar", meals: "Breakfast", activities: "Leisure & transfer to Jaipur airport", transport: "AC Sedan" },
        ],
      },
    },
  });

  // Booking 2 — Deepak (WON) Ranthambore
  const b2 = await prisma.booking.create({
    data: {
      reference: "PDH-2026-0002",
      title: "Ranthambore Tiger Trail",
      destination: "Ranthambore National Park",
      status: "CONFIRMED",
      startDate: d(11),
      endDate: d(14),
      pax: 4,
      adults: 2,
      children: 2,
      totalAmount: 128000,
      leadId: leads[5].id,
      agentId: vikram.id,
      notes: "Two safaris confirmed, zone 3 & 4 preferred.",
      days: {
        create: [
          { dayNumber: 1, date: d(11), title: "Arrival & check-in", location: "Sawai Madhopur", hotel: "The Oberoi Vanyavilas", meals: "Dinner", activities: "Nature walk, evening bonfire", transport: "AC SUV from Jaipur" },
          { dayNumber: 2, date: d(12), title: "Morning & evening safari", location: "Ranthambore", hotel: "The Oberoi Vanyavilas", meals: "All meals", activities: "Jungle safari (Zone 3 & 4), Ranthambore Fort visit", transport: "Canter / Gypsy" },
          { dayNumber: 3, date: d(13), title: "Second safari & leisure", location: "Ranthambore", hotel: "The Oberoi Vanyavilas", meals: "All meals", activities: "Morning safari, spa afternoon", transport: "Gypsy" },
          { dayNumber: 4, date: d(14), title: "Departure", location: "Sawai Madhopur", meals: "Breakfast", activities: "Transfer to Jaipur", transport: "AC SUV" },
        ],
      },
    },
  });

  // Booking 3 — Kapoor (QUOTED->confirmed draft) Jaisalmer
  const b3 = await prisma.booking.create({
    data: {
      reference: "PDH-2026-0003",
      title: "Jaisalmer Desert Safari",
      destination: "Jaisalmer",
      status: "DRAFT",
      startDate: d(29),
      endDate: d(33),
      pax: 6,
      adults: 4,
      children: 2,
      totalAmount: 220000,
      leadId: leads[2].id,
      agentId: anjali.id,
      notes: "Luxury Swiss tents in Sam dunes. Awaiting advance.",
      days: {
        create: [
          { dayNumber: 1, date: d(29), title: "Arrival — Golden City", location: "Jaisalmer", hotel: "Suryagarh Jaisalmer", meals: "Dinner", activities: "Gadisar Lake, sunset at fort", transport: "AC Tempo Traveller" },
          { dayNumber: 2, date: d(30), title: "Jaisalmer Fort & Havelis", location: "Jaisalmer", hotel: "Suryagarh Jaisalmer", meals: "Breakfast, Dinner", activities: "Sonar Quila, Patwon Ki Haveli, Nathmal Ji Ki Haveli", transport: "AC Tempo Traveller" },
          { dayNumber: 3, date: d(31), title: "Sam Sand Dunes", location: "Sam", hotel: "Luxury Desert Camp", meals: "All meals", activities: "Camel safari, dune bashing, folk dance & dinner under stars", transport: "Jeep + Camel" },
          { dayNumber: 4, date: d(32), title: "Kuldhara & Longewala", location: "Jaisalmer", hotel: "Suryagarh Jaisalmer", meals: "Breakfast, Dinner", activities: "Kuldhara ghost village, Tanot Mata temple", transport: "AC Tempo Traveller" },
          { dayNumber: 5, date: d(33), title: "Departure", location: "Jaisalmer", meals: "Breakfast", activities: "Transfer to Jaisalmer airport", transport: "AC Tempo Traveller" },
        ],
      },
    },
  });

  // Booking 4 — Global Voyages group ONGOING-ish
  const b4 = await prisma.booking.create({
    data: {
      reference: "PDH-2026-0004",
      title: "Rajasthan Palace Circuit — Group",
      destination: "Jaipur • Jodhpur • Udaipur",
      status: "DRAFT",
      startDate: d(120),
      endDate: d(128),
      pax: 18,
      adults: 18,
      children: 0,
      totalAmount: 1250000,
      leadId: leads[9].id,
      agentId: meera.id,
      notes: "Group of 18 US travellers. Heritage palace hotels throughout.",
      days: {
        create: [
          { dayNumber: 1, date: d(120), title: "Arrive Jaipur", location: "Jaipur", hotel: "Rambagh Palace", meals: "Dinner", activities: "Welcome dinner with folk music" },
          { dayNumber: 2, date: d(121), title: "Pink City Tour", location: "Jaipur", hotel: "Rambagh Palace", meals: "Breakfast, Dinner", activities: "Amber Fort elephant ride, City Palace, Hawa Mahal, Jantar Mantar" },
          { dayNumber: 3, date: d(122), title: "Jaipur to Jodhpur", location: "Jodhpur", hotel: "Umaid Bhawan Palace", meals: "Breakfast, Dinner", activities: "Enroute Pushkar visit" },
        ],
      },
    },
  });

  // Booking 5 — Neha Udaipur honeymoon (draft)
  const b5 = await prisma.booking.create({
    data: {
      reference: "PDH-2026-0005",
      title: "Udaipur Honeymoon",
      destination: "Udaipur",
      status: "COMPLETED",
      startDate: d(-24),
      endDate: d(-20),
      pax: 2,
      adults: 2,
      children: 0,
      totalAmount: 155000,
      leadId: leads[10].id,
      agentId: anjali.id,
      notes: "Lake-view suite, candlelight dinner on Lake Pichola.",
      days: {
        create: [
          { dayNumber: 1, date: d(-24), title: "Arrival — City of Lakes", location: "Udaipur", hotel: "The Leela Palace Udaipur", meals: "Dinner", activities: "Private boat ride on Lake Pichola" },
          { dayNumber: 2, date: d(-23), title: "Udaipur Sightseeing", location: "Udaipur", hotel: "The Leela Palace Udaipur", meals: "Breakfast, Dinner", activities: "City Palace, Jagdish Temple, Saheliyon Ki Bari" },
          { dayNumber: 3, date: d(-22), title: "Candlelight & Kumbhalgarh", location: "Kumbhalgarh", hotel: "The Leela Palace Udaipur", meals: "All meals", activities: "Kumbhalgarh Fort day trip, candlelight dinner" },
        ],
      },
    },
  });

  // ---- Quotes ----
  const q1 = await prisma.quote.create({
    data: {
      number: "QT-2026-0001",
      leadId: leads[2].id,
      title: "Jaisalmer Desert Safari — 4N/5D",
      status: "SENT",
      issueDate: d(-4),
      validUntil: d(10),
      taxRate: 5,
      discount: 5000,
      notes: "Rates valid for travel before 31 Mar. Includes all transfers & taxes.",
      terms: "50% advance to confirm. Balance 15 days before travel. Cancellation as per policy.",
      items: {
        create: [
          { label: "Luxury accommodation (4 nights)", detail: "Suryagarh + Desert Camp, twin sharing", quantity: 6, unitPrice: 18000, sortOrder: 1 },
          { label: "AC Tempo Traveller with driver", detail: "5 days incl. fuel, tolls, parking", quantity: 1, unitPrice: 42000, sortOrder: 2 },
          { label: "Camel safari & dune experience", quantity: 6, unitPrice: 2500, sortOrder: 3 },
          { label: "Monument entry & guide charges", quantity: 1, unitPrice: 18000, sortOrder: 4 },
        ],
      },
    },
  });

  const q2 = await prisma.quote.create({
    data: {
      number: "QT-2026-0002",
      leadId: leads[10].id,
      title: "Udaipur Honeymoon — 4N/5D",
      status: "ACCEPTED",
      issueDate: d(-30),
      validUntil: d(-15),
      taxRate: 5,
      discount: 0,
      notes: "Complimentary room upgrade & couple spa included.",
      terms: "Non-refundable advance of 40%.",
      items: {
        create: [
          { label: "The Leela Palace — Lake View Suite (4 nights)", quantity: 4, unitPrice: 28000, sortOrder: 1 },
          { label: "Private airport transfers", quantity: 2, unitPrice: 3500, sortOrder: 2 },
          { label: "Candlelight dinner on Lake Pichola", quantity: 1, unitPrice: 12000, sortOrder: 3 },
          { label: "Kumbhalgarh day trip with guide", quantity: 1, unitPrice: 15000, sortOrder: 4 },
        ],
      },
    },
  });

  const q3 = await prisma.quote.create({
    data: {
      number: "QT-2026-0003",
      leadId: leads[3].id,
      title: "Royal Rajasthan — 14 Nights",
      status: "DRAFT",
      issueDate: d(-1),
      validUntil: d(20),
      taxRate: 5,
      discount: 20000,
      notes: "Ultra-luxury heritage circuit, Oberoi & Taj palaces.",
      items: {
        create: [
          { label: "Heritage palace hotels (14 nights)", detail: "Deluxe category, twin sharing", quantity: 2, unitPrice: 165000, sortOrder: 1 },
          { label: "Private chauffeur-driven luxury car", quantity: 1, unitPrice: 98000, sortOrder: 2 },
          { label: "English-speaking guides", quantity: 1, unitPrice: 42000, sortOrder: 3 },
        ],
      },
    },
  });

  // ---- Invoices + payments ----
  const inv1 = await prisma.invoice.create({
    data: {
      number: "INV-2026-0001",
      leadId: leads[4].id,
      bookingId: b1.id,
      status: "PAID",
      issueDate: d(-6),
      dueDate: d(4),
      taxRate: 5,
      discount: 0,
      terms: "Payment received in full. Bon voyage!",
      items: {
        create: [
          { label: "Pushkar Fair Special — 3N/4D (3 pax)", detail: "Ananta Spa & Resort, all transfers", quantity: 1, unitPrice: 78000, sortOrder: 1 },
          { label: "Hot air balloon add-on", quantity: 3, unitPrice: 4000, sortOrder: 2 },
        ],
      },
    },
  });
  await prisma.payment.createMany({
    data: [
      { invoiceId: inv1.id, amount: 45000, method: "UPI", reference: "UPI/PUSH/4471", paidAt: d(-6) },
      { invoiceId: inv1.id, amount: 45900, method: "Bank Transfer", reference: "NEFT/HDFC/8890", paidAt: d(-2) },
    ],
  });

  const inv2 = await prisma.invoice.create({
    data: {
      number: "INV-2026-0002",
      leadId: leads[5].id,
      bookingId: b2.id,
      status: "PARTIAL",
      issueDate: d(-3),
      dueDate: d(7),
      taxRate: 5,
      discount: 3000,
      terms: "50% advance received. Balance due 5 days before travel.",
      items: {
        create: [
          { label: "Ranthambore Tiger Trail — 3N/4D (4 pax)", detail: "Oberoi Vanyavilas, 3 safaris", quantity: 1, unitPrice: 118000, sortOrder: 1 },
          { label: "Extra safari — Zone 4", quantity: 1, unitPrice: 12000, sortOrder: 2 },
        ],
      },
    },
  });
  await prisma.payment.create({
    data: { invoiceId: inv2.id, amount: 64000, method: "Card", reference: "RZP/RANTH/2231", paidAt: d(-3) },
  });

  const inv3 = await prisma.invoice.create({
    data: {
      number: "INV-2026-0003",
      leadId: leads[10].id,
      bookingId: b5.id,
      status: "PAID",
      issueDate: d(-28),
      dueDate: d(-18),
      taxRate: 5,
      discount: 0,
      terms: "Fully paid. Thank you!",
      items: {
        create: [
          { label: "Udaipur Honeymoon — 4N/5D", detail: "The Leela Palace, lake-view suite", quantity: 1, unitPrice: 143000, sortOrder: 1 },
          { label: "Candlelight dinner experience", quantity: 1, unitPrice: 12000, sortOrder: 2 },
        ],
      },
    },
  });
  await prisma.payment.create({
    data: { invoiceId: inv3.id, amount: 162750, method: "Bank Transfer", reference: "NEFT/LEELA/1123", paidAt: d(-26) },
  });

  const inv4 = await prisma.invoice.create({
    data: {
      number: "INV-2026-0004",
      leadId: leads[2].id,
      bookingId: b3.id,
      status: "UNPAID",
      issueDate: d(-1),
      dueDate: d(9),
      taxRate: 5,
      discount: 5000,
      terms: "50% advance required to confirm luxury tents.",
      items: {
        create: [
          { label: "Jaisalmer Desert Safari — 4N/5D (6 pax)", quantity: 1, unitPrice: 210000, sortOrder: 1 },
        ],
      },
    },
  });

  // ---- Social accounts ----
  await prisma.socialAccount.createMany({
    data: [
      { channel: "Instagram", handle: "@padhaaro.sa", followers: 48200, growth: 6.4, engagement: 4.8, url: "https://instagram.com" },
      { channel: "Facebook", handle: "Padhaaro Sa Hospitality", followers: 31500, growth: 2.1, engagement: 2.3, url: "https://facebook.com" },
      { channel: "WhatsApp", handle: "+91 98290 45678", followers: 12800, growth: 9.7, engagement: 18.5, url: "https://wa.me/919829045678" },
      { channel: "YouTube", handle: "Padhaaro Travels", followers: 15600, growth: 4.2, engagement: 6.1, url: "https://youtube.com" },
      { channel: "X", handle: "@padhaaro", followers: 8400, growth: 1.3, engagement: 1.9, url: "https://x.com" },
      { channel: "LinkedIn", handle: "Padhaaro Sa..", followers: 5200, growth: 3.8, engagement: 3.2, url: "https://linkedin.com" },
    ],
  });

  // ---- Social posts ----
  await prisma.socialPost.createMany({
    data: [
      { channel: "Instagram", content: "🐫 Sunset over the Sam dunes — Jaisalmer desert nights await! Book your Rajasthan escape. #PadhaaroSa #Jaisalmer", campaign: "Desert Season", status: "PUBLISHED", publishedAt: d(-3), likes: 1840, comments: 96, shares: 210, reach: 24500 },
      { channel: "Instagram", content: "The Pink City in golden hour 💛 Hawa Mahal like you've never seen it. Swipe for our 5-day Jaipur itinerary.", campaign: "Golden Triangle", status: "PUBLISHED", publishedAt: d(-8), likes: 2210, comments: 130, shares: 305, reach: 31200 },
      { channel: "Facebook", content: "Monsoon offer! Flat 15% off on Udaipur honeymoon packages booked this week. 💑", campaign: "Monsoon Sale", status: "PUBLISHED", publishedAt: d(-5), likes: 640, comments: 48, shares: 88, reach: 12400 },
      { channel: "YouTube", content: "Full travel vlog: Jaipur → Jodhpur → Jaisalmer in 7 days (4K)", campaign: "Royal Rajasthan", status: "PUBLISHED", publishedAt: d(-12), likes: 980, comments: 210, shares: 140, reach: 46000 },
      { channel: "Instagram", content: "Pushkar Fair 2026 is coming 🎡 Reserve your luxury tent now — limited availability!", campaign: "Pushkar Fair", status: "SCHEDULED", scheduledAt: d(2), likes: 0, comments: 0, shares: 0, reach: 0 },
      { channel: "WhatsApp", content: "Broadcast: New Ranthambore tiger-safari packages live! Reply TIGER for details. 🐅", campaign: "Wildlife", status: "SCHEDULED", scheduledAt: d(1), likes: 0, comments: 0, shares: 0, reach: 0 },
      { channel: "LinkedIn", content: "We planned an 18-guest corporate offsite across 3 palace cities. Here's how. #MICE #CorporateTravel", campaign: "Corporate MICE", status: "DRAFT", likes: 0, comments: 0, shares: 0, reach: 0 },
      { channel: "Facebook", content: "Kerala backwaters + Goa beaches combo — escape the heat! 🌴 DM to plan.", campaign: "Summer Coast", status: "DRAFT", likes: 0, comments: 0, shares: 0, reach: 0 },
    ],
  });

  // ---- Events ----
  const ev1 = await prisma.event.create({
    data: {
      title: "Kapoor – Sethi Royal Wedding",
      type: "Wedding",
      status: "CONFIRMED",
      startDate: d(40),
      endDate: d(43),
      location: "Udaipur",
      venue: "The Leela Palace, Lake Pichola",
      guests: 350,
      budget: 8500000,
      leadId: leads[2].id,
      notes: "3-day destination wedding. Mehndi, sangeet, pheras. Fireworks + live qawwali.",
    },
  });
  const ev2 = await prisma.event.create({
    data: {
      title: "TechNova Annual Offsite",
      type: "Corporate",
      status: "PLANNING",
      startDate: d(70),
      endDate: d(73),
      location: "Jaipur",
      venue: "Fairmont Jaipur",
      guests: 220,
      budget: 4200000,
      leadId: leads[9].id,
      notes: "Corporate MICE — team-building at Amber Fort, gala dinner, awards night.",
    },
  });
  const ev3 = await prisma.event.create({
    data: {
      title: "Pushkar Camel Fair Group Departure",
      type: "Festival",
      status: "ONGOING",
      startDate: d(18),
      endDate: d(21),
      location: "Pushkar",
      venue: "Fairgrounds & Ananta Resort",
      guests: 45,
      budget: 1350000,
      leadId: leads[4].id,
      notes: "Group festival tour — hot air balloon, cultural evenings.",
    },
  });
  const ev4 = await prisma.event.create({
    data: {
      title: "Jaipur → Goa Signature Coastal Tour",
      type: "Group Tour",
      status: "PLANNING",
      startDate: d(90),
      endDate: d(97),
      location: "Jaipur to Goa",
      venue: "Multi-city",
      guests: 28,
      budget: 2800000,
      notes: "Flagship 7N cross-country tour: Jaipur heritage + Goa beaches.",
    },
  });

  await prisma.eventAssignment.createMany({
    data: [
      { eventId: ev1.id, agentId: sneha.id, role: "Lead Planner" },
      { eventId: ev1.id, agentId: anjali.id, role: "Hospitality" },
      { eventId: ev1.id, agentId: rohit.id, role: "Logistics" },
      { eventId: ev2.id, agentId: sneha.id, role: "Lead Planner" },
      { eventId: ev2.id, agentId: vikram.id, role: "Coordinator" },
      { eventId: ev3.id, agentId: meera.id, role: "Coordinator" },
      { eventId: ev3.id, agentId: rohit.id, role: "Logistics" },
      { eventId: ev4.id, agentId: vikram.id, role: "Lead Planner" },
      { eventId: ev4.id, agentId: anjali.id, role: "Coordinator" },
    ],
  });

  // ---- Tours ----
  await prisma.tour.createMany({
    data: [
      { title: "Royal Rajasthan Heritage Tour", code: "PDH-RAJ-08", category: "Domestic", style: "Group Tour", destination: "Jaipur, Jodhpur, Udaipur, Jaisalmer", nights: 7, days: 8, priceFrom: 62000, status: "Active", availability: "Available", highlights: "Amber Fort, Mehrangarh, Lake Pichola, Sam dunes", inclusions: "Hotels, breakfast, transfers, guide", exclusions: "Flights, lunch, entry fees" },
      { title: "Golden Triangle Express", code: "PDH-GT-05", category: "Domestic", style: "Fixed Departure", destination: "Delhi, Agra, Jaipur", nights: 4, days: 5, priceFrom: 28000, status: "Active", availability: "Limited", highlights: "Taj Mahal at sunrise, Amber Fort, Qutub Minar" },
      { title: "Udaipur Romantic Honeymoon", code: "PDH-HM-04", category: "Domestic", style: "Honeymoon", destination: "Udaipur, Kumbhalgarh", nights: 4, days: 5, priceFrom: 55000, status: "Active", availability: "Available", highlights: "Lake-view suite, candlelight dinner, couple spa" },
      { title: "Jaisalmer Desert Adventure", code: "PDH-ADV-03", category: "Domestic", style: "Adventure", destination: "Jaisalmer, Sam", nights: 3, days: 4, priceFrom: 34000, status: "Active", availability: "Available", highlights: "Dune bashing, camel safari, luxury tents" },
      { title: "Char Dham Yatra", code: "PDH-REL-11", category: "Domestic", style: "Religious", destination: "Yamunotri, Gangotri, Kedarnath, Badrinath", nights: 10, days: 11, priceFrom: 48000, status: "Active", availability: "Limited", highlights: "Complete Char Dham pilgrimage with priest support" },
      { title: "Thailand Beach Escape", code: "PDH-INT-06", category: "International", style: "Group Tour", destination: "Bangkok, Pattaya, Phuket", nights: 6, days: 7, priceFrom: 78000, status: "Active", availability: "Available", highlights: "Coral island, Phi Phi tour, city shopping" },
      { title: "Dubai Luxury Getaway", code: "PDH-INT-05", category: "International", style: "Customized", destination: "Dubai, Abu Dhabi", nights: 5, days: 6, priceFrom: 95000, status: "Active", availability: "Available", highlights: "Burj Khalifa, desert safari, Ferrari World" },
      { title: "Kerala Backwaters & Munnar", code: "PDH-KL-06", category: "Domestic", style: "Seasonal", destination: "Kochi, Munnar, Alleppey", nights: 5, days: 6, priceFrom: 42000, status: "Active", availability: "Available", highlights: "Houseboat stay, tea gardens, Ayurveda" },
      { title: "Jaipur to Goa Coastal Signature", code: "PDH-GOA-07", category: "Domestic", style: "Group Tour", destination: "Jaipur, Goa", nights: 7, days: 8, priceFrom: 68000, status: "Draft", availability: "Available", highlights: "Heritage + beaches cross-country flagship" },
      { title: "Corporate MICE — Rajasthan", code: "PDH-COR-04", category: "Domestic", style: "Corporate", destination: "Jaipur", nights: 3, days: 4, priceFrom: 38000, status: "Active", availability: "Available", highlights: "Team building, gala dinner, conference hall" },
    ],
  });

  // ---- Destinations ----
  await prisma.destination.createMany({
    data: [
      { name: "Jaipur", category: "City", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Oct – Mar", description: "The Pink City — Hawa Mahal, Amber Fort, City Palace." },
      { name: "Udaipur", category: "City", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Sep – Mar", description: "City of Lakes with palaces on Lake Pichola." },
      { name: "Jaisalmer", category: "City", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Nov – Feb", description: "The Golden City and Thar desert gateway." },
      { name: "Jodhpur", category: "City", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Oct – Mar", description: "The Blue City beneath Mehrangarh Fort." },
      { name: "Mehrangarh Fort", category: "Fort", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Oct – Mar", description: "One of India's largest and most majestic forts." },
      { name: "Ranthambore", category: "Wildlife", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Oct – Jun", description: "Premier tiger reserve and safari destination." },
      { name: "Goa", category: "Beach", country: "India", state: "Goa", region: "Domestic", bestSeason: "Nov – Feb", description: "Sun, sand and Portuguese heritage." },
      { name: "Mount Abu", category: "Hill Station", country: "India", state: "Rajasthan", region: "Domestic", bestSeason: "Oct – Mar", description: "Rajasthan's only hill station with Dilwara temples." },
      { name: "Dubai", category: "City", country: "UAE", state: null, region: "International", bestSeason: "Nov – Mar", description: "Futuristic skyline, desert safaris and luxury shopping." },
      { name: "Bangkok", category: "City", country: "Thailand", state: null, region: "International", bestSeason: "Nov – Feb", description: "Temples, street food and vibrant nightlife." },
    ],
  });

  // ---- Hotels ----
  await prisma.hotel.createMany({
    data: [
      { name: "The Oberoi Udaivilas", city: "Udaipur", stars: 5, category: "Luxury", mealPlan: "MAP", priceFrom: 45000, totalRooms: 90, availableRooms: 12, phone: "+91 294 243 3300", status: "Active" },
      { name: "Rambagh Palace", city: "Jaipur", stars: 5, category: "Heritage", mealPlan: "CP", priceFrom: 38000, totalRooms: 78, availableRooms: 20, phone: "+91 141 221 1919", status: "Active" },
      { name: "Suryagarh Jaisalmer", city: "Jaisalmer", stars: 5, category: "Heritage", mealPlan: "MAP", priceFrom: 22000, totalRooms: 83, availableRooms: 31, phone: "+91 2992 269 269", status: "Active" },
      { name: "The Oberoi Vanyavilas", city: "Ranthambore", stars: 5, category: "Resort", mealPlan: "AP", priceFrom: 52000, totalRooms: 25, availableRooms: 4, phone: "+91 746 223 3000", status: "Active" },
      { name: "Fairmont Jaipur", city: "Jaipur", stars: 5, category: "Luxury", mealPlan: "CP", priceFrom: 15000, totalRooms: 255, availableRooms: 88, phone: "+91 141 670 0000", status: "Active" },
      { name: "Ananta Spa & Resort", city: "Pushkar", stars: 4, category: "Resort", mealPlan: "MAP", priceFrom: 9000, totalRooms: 100, availableRooms: 45, phone: "+91 145 305 5555", status: "Active" },
      { name: "Hotel Pearl Palace", city: "Jaipur", stars: 3, category: "Budget", mealPlan: "EP", priceFrom: 2500, totalRooms: 40, availableRooms: 18, phone: "+91 141 237 3700", status: "Active" },
      { name: "Taj Lake Palace", city: "Udaipur", stars: 5, category: "Heritage", mealPlan: "CP", priceFrom: 55000, totalRooms: 83, availableRooms: 6, phone: "+91 294 242 8800", status: "Active" },
    ],
  });

  // ---- Vehicles ----
  await prisma.vehicle.createMany({
    data: [
      { model: "Toyota Innova Crysta", type: "SUV", registration: "RJ14 CB 4521", capacity: 6, driverName: "Ramesh Yadav", driverPhone: "+91 98290 71001", pricePerDay: 3500, status: "Available", gps: true },
      { model: "Maruti Dzire", type: "Sedan", registration: "RJ14 AC 1180", capacity: 4, driverName: "Suresh Meena", driverPhone: "+91 98290 71002", pricePerDay: 2200, status: "On Trip", gps: true },
      { model: "Force Traveller 26", type: "Tempo Traveller", registration: "RJ14 PF 8890", capacity: 16, driverName: "Mahaveer Singh", driverPhone: "+91 98290 71003", pricePerDay: 6500, status: "Available", gps: true },
      { model: "Volvo 9600 Coach", type: "Luxury Coach", registration: "RJ14 VC 3300", capacity: 45, driverName: "Gopal Sharma", driverPhone: "+91 98290 71004", pricePerDay: 18000, status: "Available", gps: true },
      { model: "Toyota Fortuner", type: "SUV", registration: "RJ14 FT 7001", capacity: 6, driverName: "Kailash Rathore", driverPhone: "+91 98290 71005", pricePerDay: 5500, status: "Maintenance", gps: true },
      { model: "Tempo Traveller 12", type: "Tempo Traveller", registration: "RJ14 TT 2244", capacity: 12, driverName: "Bhanwar Lal", driverPhone: "+91 98290 71006", pricePerDay: 5000, status: "On Trip", gps: false },
    ],
  });

  // ---- Guides ----
  await prisma.guide.createMany({
    data: [
      { name: "Prakash Sharma", languages: "Hindi, English, French", city: "Jaipur", experience: 12, specialization: "Heritage & Forts", phone: "+91 98290 81001", dailyRate: 3000, rating: 4.9, available: true },
      { name: "Isabelle Dubois", languages: "English, French, Spanish", city: "Udaipur", experience: 8, specialization: "Art & Culture", phone: "+91 98290 81002", dailyRate: 3500, rating: 4.8, available: true },
      { name: "Mohammed Rafiq", languages: "Hindi, English, Arabic", city: "Jaisalmer", experience: 15, specialization: "Desert & Havelis", phone: "+91 98290 81003", dailyRate: 2800, rating: 4.7, available: false },
      { name: "Deepa Nair", languages: "Hindi, English, Malayalam", city: "Jodhpur", experience: 6, specialization: "Culinary Tours", phone: "+91 98290 81004", dailyRate: 2500, rating: 4.6, available: true },
      { name: "Hiroshi Tanaka", languages: "English, Japanese", city: "Jaipur", experience: 10, specialization: "Photography Tours", phone: "+91 98290 81005", dailyRate: 4000, rating: 4.9, available: true },
    ],
  });

  // ---- Vendors ----
  await prisma.vendor.createMany({
    data: [
      { name: "Oberoi Hotels & Resorts", type: "Hotel", contactPerson: "Rajeev Kohli", phone: "+91 11 2389 0505", email: "sales@oberoi.com", city: "Jaipur", contractStatus: "Active", outstanding: 240000, rating: 4.9 },
      { name: "IndiGo Airlines", type: "Airline", contactPerson: "Corporate Desk", phone: "+91 124 617 3838", email: "corp@goindigo.in", city: "Gurugram", contractStatus: "Active", outstanding: 0, rating: 4.4 },
      { name: "Pink City Cabs", type: "Transport", contactPerson: "Naresh Gupta", phone: "+91 98290 90001", email: "book@pinkcitycabs.in", city: "Jaipur", contractStatus: "Active", outstanding: 55000, rating: 4.5 },
      { name: "Spice Route Caterers", type: "Restaurant", contactPerson: "Chef Vikas", phone: "+91 98290 90002", email: "events@spiceroute.in", city: "Jaipur", contractStatus: "Pending", outstanding: 18000, rating: 4.6 },
      { name: "Thar Adventure Co.", type: "Activity Provider", contactPerson: "Vijay Singh", phone: "+91 98290 90003", email: "info@tharadventure.in", city: "Jaisalmer", contractStatus: "Active", outstanding: 32000, rating: 4.7 },
      { name: "Udaipur Local Partners", type: "Local Partner", contactPerson: "Mahendra Paliwal", phone: "+91 98290 90004", email: "hello@udaipurlocal.in", city: "Udaipur", contractStatus: "Expired", outstanding: 0, rating: 4.3 },
    ],
  });

  // ---- Excursions / Activities ----
  await prisma.excursion.createMany({
    data: [
      { name: "Hot Air Balloon Ride", type: "Adventure", city: "Jaipur", duration: "1 hour", price: 12000, description: "Sunrise flight over Amber Fort and the Aravallis." },
      { name: "Amber Fort Elephant Ride", type: "Sightseeing", city: "Jaipur", duration: "45 mins", price: 1800, description: "Royal ascent to the fort gates." },
      { name: "Camel Safari — Sam Dunes", type: "Adventure", city: "Jaisalmer", duration: "2 hours", price: 2500, description: "Sunset camel safari with folk dinner." },
      { name: "Vintage Car Museum", type: "Museum", city: "Udaipur", duration: "1.5 hours", price: 600, description: "Classic Rolls-Royce & Cadillac collection." },
      { name: "Lake Pichola Boat Ride", type: "Local Tour", city: "Udaipur", duration: "1 hour", price: 900, description: "Private boat past Jag Mandir island." },
      { name: "Chokhi Dhani Cultural Evening", type: "Event Ticket", city: "Jaipur", duration: "3 hours", price: 1100, description: "Ethnic village resort with dinner & shows." },
      { name: "Flying Fox Zipline — Mehrangarh", type: "Adventure", city: "Jodhpur", duration: "1.5 hours", price: 2200, description: "Six ziplines over lakes and fort walls." },
    ],
  });

  // ---- Travelers ----
  await prisma.traveler.createMany({
    data: [
      { name: "Rohan Mehta", email: "rohan.mehta@gmail.com", phone: "+91 98111 22334", gender: "Male", nationality: "Indian", passportNo: "M1234567", passportExpiry: d(1600), visaStatus: "Not Required", emergencyContact: "Sunita Mehta +91 98111 00000", specialRequests: "Vegetarian meals" },
      { name: "James Wilson", email: "james.w@britmail.co.uk", phone: "+44 7700 900123", gender: "Male", nationality: "British", passportNo: "GBR889001", passportExpiry: d(900), visaStatus: "Approved", emergencyContact: "Emma Wilson +44 7700 900999", specialRequests: "Wheelchair access at hotels" },
      { name: "Sophie Laurent", email: "sophie.l@bonjour.fr", phone: "+33 6 12 34 56 78", gender: "Female", nationality: "French", passportNo: "FRA556677", passportExpiry: d(400), visaStatus: "Approved", emergencyContact: "Pierre Laurent +33 6 00 00 00 00" },
      { name: "Ananya Iyer", email: "ananya.iyer@gmail.com", phone: "+91 90000 12345", gender: "Female", nationality: "Indian", passportNo: "N7654321", passportExpiry: d(2000), visaStatus: "Not Required", medicalNotes: "Mild peanut allergy" },
      { name: "Kenji Watanabe", email: "kenji.w@jptravel.jp", phone: "+81 90 1234 5678", gender: "Male", nationality: "Japanese", passportNo: "JPN223344", passportExpiry: d(120), visaStatus: "Applied", emergencyContact: "Aiko Watanabe" },
      { name: "The Kapoor Family (6)", email: "s.kapoor@gmail.com", phone: "+91 98730 00112", gender: "Other", nationality: "Indian", visaStatus: "Not Required", specialRequests: "Two connecting rooms, early check-in" },
    ],
  });

  // ---- Flights ----
  await prisma.flight.createMany({
    data: [
      { airline: "IndiGo", flightNo: "6E-234", pnr: "K7X9P2", fromCity: "Jaipur", toCity: "Goa", departAt: d(90), arriveAt: d(90), seat: "12A-12F", baggage: "15kg + 7kg cabin", status: "Confirmed" },
      { airline: "Air India", flightNo: "AI-865", pnr: "R4M8Q1", fromCity: "Delhi", toCity: "Udaipur", departAt: d(38), arriveAt: d(38), seat: "8C, 8D", baggage: "25kg", status: "Confirmed" },
      { airline: "Vistara", flightNo: "UK-995", pnr: "T2N6L9", fromCity: "Mumbai", toCity: "Jaipur", departAt: d(52), arriveAt: d(52), seat: "3A, 3B", baggage: "20kg", status: "Pending" },
      { airline: "Emirates", flightNo: "EK-543", pnr: "E9D3F7", fromCity: "Jaipur", toCity: "Dubai", departAt: d(74), arriveAt: d(74), seat: "22H, 22J", baggage: "30kg", status: "Confirmed" },
      { airline: "Thai Airways", flightNo: "TG-316", pnr: "H5S1K8", fromCity: "Delhi", toCity: "Bangkok", departAt: d(120), arriveAt: d(120), seat: "TBA", baggage: "30kg", status: "Pending" },
      { airline: "SpiceJet", flightNo: "SG-478", pnr: "W3B7V2", fromCity: "Jaisalmer", toCity: "Jaipur", departAt: d(33), arriveAt: d(33), status: "Delayed" },
    ],
  });

  // ---- Documents ----
  await prisma.travelDocument.createMany({
    data: [
      { title: "James Wilson — India e-Visa", type: "Visa", owner: "James Wilson", number: "IN-EV-889001", issuedAt: d(-30), expiresAt: d(150), status: "Valid" },
      { title: "Kapoor Family — Travel Insurance", type: "Insurance", owner: "The Kapoor Family", number: "TATA-AIG-556677", issuedAt: d(-10), expiresAt: d(40), status: "Valid" },
      { title: "Kenji Watanabe — India Tourist Visa", type: "Visa", owner: "Kenji Watanabe", number: "IN-TV-223344", issuedAt: d(-5), expiresAt: d(20), status: "Expiring" },
      { title: "Sophie Laurent — Passport Copy", type: "Passport", owner: "Sophie Laurent", number: "FRA556677", expiresAt: d(400), status: "Valid" },
      { title: "Ranthambore — Hotel Voucher (Vanyavilas)", type: "Hotel Voucher", owner: "Deepak Agarwal", number: "VCH-RTB-1123", issuedAt: d(-3), expiresAt: d(14), status: "Valid" },
      { title: "Thailand Group — Travel Agreement", type: "Agreement", owner: "Group of 18", number: "AGR-TH-2026-04", issuedAt: d(-2), status: "Pending" },
      { title: "Dubai Trip — Air Tickets", type: "Ticket", owner: "James Wilson", number: "EK-543-E9D3F7", issuedAt: d(-1), expiresAt: d(74), status: "Valid" },
    ],
  });

  // ---- Reviews & Feedback ----
  await prisma.review.createMany({
    data: [
      { traveler: "Ananya Iyer", type: "Review", tour: "Pushkar Fair Special", rating: 5, nps: 10, comment: "Absolutely magical! The hot air balloon at dawn was unforgettable. Meera planned everything perfectly.", resolved: true },
      { traveler: "Deepak Agarwal", type: "Review", tour: "Ranthambore Tiger Trail", rating: 5, nps: 9, comment: "Spotted two tigers! Vanyavilas was world-class. Highly recommend Padhaaro.", resolved: true },
      { traveler: "Neha Bhatt", type: "Review", tour: "Udaipur Honeymoon", rating: 5, nps: 10, comment: "The candlelight dinner on Lake Pichola made our honeymoon. Thank you Anjali!", resolved: true },
      { traveler: "James Wilson", type: "Suggestion", tour: "Royal Rajasthan", rating: 4, nps: 8, comment: "Excellent trip — would love an extra day in Jodhpur next time.", resolved: false },
      { traveler: "Sophie Laurent", type: "Complaint", tour: "Jodhpur Blue City", rating: 3, nps: 6, comment: "AC in the car stopped working on day 2. Was fixed quickly but caused discomfort.", resolved: false },
      { traveler: "Kenji Watanabe", type: "Review", tour: "Golden Triangle", rating: 5, nps: 10, comment: "Guide Prakash was incredibly knowledgeable. Best Taj Mahal sunrise!", resolved: true },
    ],
  });

  console.log("✅  Seed complete:");
  console.log("   Agents:   " + (await prisma.agent.count()));
  console.log("   Sign in:  meera@padhaaro.com / " + SEED_PASSWORD);
  console.log("   Leads:    " + (await prisma.lead.count()));
  console.log("   Bookings: " + (await prisma.booking.count()));
  console.log("   Quotes:   " + (await prisma.quote.count()));
  console.log("   Invoices: " + (await prisma.invoice.count()));
  console.log("   Payments: " + (await prisma.payment.count()));
  console.log("   Team:     " + (await prisma.agent.count()));
  console.log("   Social:   " + (await prisma.socialAccount.count()) + " channels, " + (await prisma.socialPost.count()) + " posts");
  console.log("   Events:   " + (await prisma.event.count()));
  console.log("   Tours:    " + (await prisma.tour.count()) + " | Destinations: " + (await prisma.destination.count()) + " | Hotels: " + (await prisma.hotel.count()));
  console.log("   Fleet:    " + (await prisma.vehicle.count()) + " | Guides: " + (await prisma.guide.count()) + " | Vendors: " + (await prisma.vendor.count()));
  console.log("   Activities:" + (await prisma.excursion.count()) + " | Travelers: " + (await prisma.traveler.count()) + " | Flights: " + (await prisma.flight.count()));
  console.log("   Documents:" + (await prisma.travelDocument.count()) + " | Reviews: " + (await prisma.review.count()));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
