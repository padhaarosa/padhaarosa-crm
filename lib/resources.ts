// Declarative definitions for every Travel-Management module.
// A single dynamic page + generic actions render CRUD for all of these.

import type { Tone } from "@/lib/constants";

export type FieldType = "text" | "number" | "money" | "date" | "textarea" | "select" | "bool" | "rating";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  hideInTable?: boolean;
  full?: boolean; // full width in the form grid
  default?: string | number;
  tones?: Record<string, Tone>; // colour a select value as a badge in the table
  primary?: boolean; // render as the bold first column
};

export type Kpi = {
  label: string;
  icon: string;
  tone: Tone;
  kind: "count" | "sum" | "avg" | "countWhere";
  field?: string;
  value?: string;
  money?: boolean;
  suffix?: string;
};

export type ResourceSpec = {
  slug: string;
  model: string; // prisma delegate name
  title: string;
  subtitle: string;
  icon: string; // lucide icon name
  singular: string;
  searchFields: string[];
  filterField?: string; // select field used for the filter chips
  orderBy?: { field: string; dir: "asc" | "desc" };
  shareable?: boolean; // enable "share to social"
  fields: Field[];
  kpis: Kpi[];
};

const AVAILABILITY_TONES: Record<string, Tone> = { Available: "green", Limited: "amber", "Sold Out": "red" };
const ACTIVE_TONES: Record<string, Tone> = { Active: "green", Draft: "slate", Inactive: "red", Pending: "amber", Expired: "red" };

export const RESOURCES: Record<string, ResourceSpec> = {
  // 1. TOURS ----------------------------------------------------------------
  tours: {
    slug: "tours",
    model: "tour",
    title: "Tour Packages",
    subtitle: "Your full catalog of domestic & international tours",
    icon: "Map",
    singular: "Tour",
    searchFields: ["title", "destination", "code"],
    filterField: "style",
    shareable: true,
    orderBy: { field: "createdAt", dir: "desc" },
    fields: [
      { name: "title", label: "Tour title", type: "text", required: true, primary: true, placeholder: "e.g. Royal Rajasthan 7N/8D", full: true },
      { name: "code", label: "Tour code", type: "text", placeholder: "e.g. PDH-RAJ-07" },
      { name: "category", label: "Category", type: "select", options: ["Domestic", "International"], default: "Domestic", tones: { Domestic: "blue", International: "violet" } },
      { name: "style", label: "Tour type", type: "select", options: ["Group Tour", "Customized", "Fixed Departure", "Honeymoon", "Religious", "Adventure", "Corporate", "Seasonal"], default: "Group Tour" },
      { name: "destination", label: "Destination", type: "text", placeholder: "e.g. Jaipur, Udaipur, Jaisalmer" },
      { name: "nights", label: "Nights", type: "number", default: 3 },
      { name: "days", label: "Days", type: "number", default: 4 },
      { name: "priceFrom", label: "Price from (₹)", type: "money", default: 0 },
      { name: "status", label: "Status", type: "select", options: ["Active", "Draft", "Inactive"], default: "Active", tones: ACTIVE_TONES },
      { name: "availability", label: "Availability", type: "select", options: ["Available", "Limited", "Sold Out"], default: "Available", tones: AVAILABILITY_TONES },
      { name: "highlights", label: "Highlights", type: "textarea", full: true, hideInTable: true },
      { name: "inclusions", label: "Inclusions", type: "textarea", full: true, hideInTable: true },
      { name: "exclusions", label: "Exclusions", type: "textarea", full: true, hideInTable: true },
    ],
    kpis: [
      { label: "Total Tours", icon: "Map", tone: "terracotta", kind: "count" },
      { label: "Active", icon: "CheckCircle2", tone: "green", kind: "countWhere", field: "status", value: "Active" },
      { label: "International", icon: "Globe", tone: "violet", kind: "countWhere", field: "category", value: "International" },
      { label: "Avg Price", icon: "IndianRupee", tone: "amber", kind: "avg", field: "priceFrom", money: true },
    ],
  },

  // 2. DESTINATIONS ---------------------------------------------------------
  destinations: {
    slug: "destinations",
    model: "destination",
    title: "Destinations",
    subtitle: "Countries, cities, attractions & tourist places",
    icon: "MapPin",
    singular: "Destination",
    searchFields: ["name", "state", "country"],
    filterField: "category",
    shareable: true,
    orderBy: { field: "name", dir: "asc" },
    fields: [
      { name: "name", label: "Name", type: "text", required: true, primary: true, placeholder: "e.g. Jaipur" },
      { name: "category", label: "Type", type: "select", options: ["Country", "State", "City", "Attraction", "Fort", "Temple", "Beach", "Hill Station", "Wildlife"], default: "City", tones: { Fort: "amber", Temple: "violet", Beach: "blue", Wildlife: "green" } },
      { name: "region", label: "Region", type: "select", options: ["Domestic", "International"], default: "Domestic", tones: { Domestic: "blue", International: "violet" } },
      { name: "country", label: "Country", type: "text", default: "India" },
      { name: "state", label: "State", type: "text", placeholder: "e.g. Rajasthan" },
      { name: "bestSeason", label: "Best season", type: "text", placeholder: "e.g. Oct – Mar" },
      { name: "description", label: "Description", type: "textarea", full: true, hideInTable: true },
    ],
    kpis: [
      { label: "Destinations", icon: "MapPin", tone: "terracotta", kind: "count" },
      { label: "Domestic", icon: "Home", tone: "blue", kind: "countWhere", field: "region", value: "Domestic" },
      { label: "International", icon: "Globe", tone: "violet", kind: "countWhere", field: "region", value: "International" },
    ],
  },

  // 3. HOTELS ---------------------------------------------------------------
  hotels: {
    slug: "hotels",
    model: "hotel",
    title: "Hotels",
    subtitle: "Hotel inventory, room availability & pricing",
    icon: "Hotel",
    singular: "Hotel",
    searchFields: ["name", "city"],
    filterField: "category",
    orderBy: { field: "name", dir: "asc" },
    fields: [
      { name: "name", label: "Hotel name", type: "text", required: true, primary: true, full: true, placeholder: "e.g. The Leela Palace" },
      { name: "city", label: "City", type: "text", default: "Jaipur" },
      { name: "stars", label: "Star rating", type: "number", default: 4 },
      { name: "category", label: "Category", type: "select", options: ["Budget", "Deluxe", "Luxury", "Heritage", "Resort"], default: "Deluxe", tones: { Luxury: "violet", Heritage: "amber", Resort: "green" } },
      { name: "mealPlan", label: "Meal plan", type: "select", options: ["EP", "CP", "MAP", "AP"], default: "CP" },
      { name: "priceFrom", label: "Price / night (₹)", type: "money", default: 0 },
      { name: "totalRooms", label: "Total rooms", type: "number", default: 0 },
      { name: "availableRooms", label: "Available rooms", type: "number", default: 0 },
      { name: "phone", label: "Phone", type: "text" },
      { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"], default: "Active", tones: ACTIVE_TONES },
      { name: "notes", label: "Notes", type: "textarea", full: true, hideInTable: true },
    ],
    kpis: [
      { label: "Hotels", icon: "Hotel", tone: "terracotta", kind: "count" },
      { label: "Rooms Available", icon: "BedDouble", tone: "green", kind: "sum", field: "availableRooms" },
      { label: "Luxury / Heritage", icon: "Crown", tone: "violet", kind: "countWhere", field: "category", value: "Luxury" },
      { label: "Avg Tariff", icon: "IndianRupee", tone: "amber", kind: "avg", field: "priceFrom", money: true },
    ],
  },

  // 4. TRANSPORT ------------------------------------------------------------
  transport: {
    slug: "transport",
    model: "vehicle",
    title: "Transport & Fleet",
    subtitle: "Vehicles, drivers & availability",
    icon: "Car",
    singular: "Vehicle",
    searchFields: ["model", "registration", "driverName"],
    filterField: "status",
    orderBy: { field: "createdAt", dir: "desc" },
    fields: [
      { name: "model", label: "Vehicle model", type: "text", required: true, primary: true, placeholder: "e.g. Toyota Innova Crysta" },
      { name: "type", label: "Type", type: "select", options: ["Sedan", "SUV", "Tempo Traveller", "Bus", "Luxury Coach"], default: "SUV" },
      { name: "registration", label: "Registration", type: "text", placeholder: "RJ14 AB 1234" },
      { name: "capacity", label: "Capacity", type: "number", default: 4 },
      { name: "driverName", label: "Driver", type: "text" },
      { name: "driverPhone", label: "Driver phone", type: "text", hideInTable: true },
      { name: "pricePerDay", label: "Price / day (₹)", type: "money", default: 0 },
      { name: "status", label: "Status", type: "select", options: ["Available", "On Trip", "Maintenance"], default: "Available", tones: { Available: "green", "On Trip": "blue", Maintenance: "amber" } },
      { name: "gps", label: "GPS enabled", type: "bool", default: 1 },
    ],
    kpis: [
      { label: "Fleet Size", icon: "Car", tone: "terracotta", kind: "count" },
      { label: "Available", icon: "CheckCircle2", tone: "green", kind: "countWhere", field: "status", value: "Available" },
      { label: "On Trip", icon: "Navigation", tone: "blue", kind: "countWhere", field: "status", value: "On Trip" },
      { label: "Total Seats", icon: "Users", tone: "violet", kind: "sum", field: "capacity" },
    ],
  },

  // 5. GUIDES ---------------------------------------------------------------
  guides: {
    slug: "guides",
    model: "guide",
    title: "Tour Guides",
    subtitle: "Certified guides, languages & availability",
    icon: "UserRound",
    singular: "Guide",
    searchFields: ["name", "city", "languages", "specialization"],
    filterField: "city",
    orderBy: { field: "rating", dir: "desc" },
    fields: [
      { name: "name", label: "Guide name", type: "text", required: true, primary: true },
      { name: "languages", label: "Languages", type: "text", default: "Hindi, English", placeholder: "Hindi, English, French" },
      { name: "city", label: "Base city", type: "text", default: "Jaipur" },
      { name: "experience", label: "Experience (yrs)", type: "number", default: 3 },
      { name: "specialization", label: "Specialization", type: "text", placeholder: "e.g. Heritage & Forts" },
      { name: "phone", label: "Phone", type: "text", hideInTable: true },
      { name: "dailyRate", label: "Daily rate (₹)", type: "money", default: 0 },
      { name: "rating", label: "Rating", type: "rating", default: 4.5 },
      { name: "available", label: "Available", type: "bool", default: 1 },
    ],
    kpis: [
      { label: "Guides", icon: "UserRound", tone: "terracotta", kind: "count" },
      { label: "Available", icon: "CheckCircle2", tone: "green", kind: "countWhere", field: "available", value: "true" },
      { label: "Avg Rating", icon: "Star", tone: "amber", kind: "avg", field: "rating", suffix: " ★" },
    ],
  },

  // 6. VENDORS --------------------------------------------------------------
  vendors: {
    slug: "vendors",
    model: "vendor",
    title: "Vendors & Suppliers",
    subtitle: "Hotels, airlines, transport & activity partners",
    icon: "Handshake",
    singular: "Vendor",
    searchFields: ["name", "city", "contactPerson"],
    filterField: "type",
    orderBy: { field: "name", dir: "asc" },
    fields: [
      { name: "name", label: "Vendor name", type: "text", required: true, primary: true, full: true },
      { name: "type", label: "Type", type: "select", options: ["Hotel", "Airline", "Transport", "Restaurant", "Activity Provider", "Local Partner"], default: "Hotel", tones: { Hotel: "blue", Airline: "violet", Transport: "amber", Restaurant: "green" } },
      { name: "contactPerson", label: "Contact person", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text", hideInTable: true },
      { name: "city", label: "City", type: "text", default: "Jaipur" },
      { name: "contractStatus", label: "Contract", type: "select", options: ["Active", "Pending", "Expired"], default: "Active", tones: ACTIVE_TONES },
      { name: "outstanding", label: "Payable (₹)", type: "money", default: 0 },
      { name: "rating", label: "Rating", type: "rating", default: 4.5, hideInTable: true },
    ],
    kpis: [
      { label: "Vendors", icon: "Handshake", tone: "terracotta", kind: "count" },
      { label: "Active Contracts", icon: "FileCheck", tone: "green", kind: "countWhere", field: "contractStatus", value: "Active" },
      { label: "Total Payable", icon: "Wallet", tone: "red", kind: "sum", field: "outstanding", money: true },
    ],
  },

  // 7. ACTIVITIES -----------------------------------------------------------
  activities: {
    slug: "activities",
    model: "excursion",
    title: "Activities & Sightseeing",
    subtitle: "Experiences, adventure activities & tickets",
    icon: "Ticket",
    singular: "Activity",
    searchFields: ["name", "city"],
    filterField: "type",
    orderBy: { field: "createdAt", dir: "desc" },
    fields: [
      { name: "name", label: "Activity name", type: "text", required: true, primary: true, full: true, placeholder: "e.g. Hot Air Balloon Ride" },
      { name: "type", label: "Type", type: "select", options: ["Sightseeing", "Adventure", "Museum", "Theme Park", "Local Tour", "Event Ticket"], default: "Sightseeing", tones: { Adventure: "red", Museum: "violet", "Theme Park": "amber" } },
      { name: "city", label: "City", type: "text", default: "Jaipur" },
      { name: "duration", label: "Duration", type: "text", placeholder: "e.g. 2 hours" },
      { name: "price", label: "Price / person (₹)", type: "money", default: 0 },
      { name: "description", label: "Description", type: "textarea", full: true, hideInTable: true },
    ],
    kpis: [
      { label: "Activities", icon: "Ticket", tone: "terracotta", kind: "count" },
      { label: "Adventure", icon: "Mountain", tone: "red", kind: "countWhere", field: "type", value: "Adventure" },
      { label: "Avg Price", icon: "IndianRupee", tone: "amber", kind: "avg", field: "price", money: true },
    ],
  },

  // 8. TRAVELERS ------------------------------------------------------------
  travelers: {
    slug: "travelers",
    model: "traveler",
    title: "Travelers",
    subtitle: "Passenger profiles, passports & visas",
    icon: "Users",
    singular: "Traveler",
    searchFields: ["name", "email", "phone", "passportNo"],
    filterField: "visaStatus",
    orderBy: { field: "createdAt", dir: "desc" },
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, primary: true },
      { name: "email", label: "Email", type: "text", hideInTable: true },
      { name: "phone", label: "Phone", type: "text" },
      { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], default: "Male", hideInTable: true },
      { name: "nationality", label: "Nationality", type: "text", default: "Indian" },
      { name: "passportNo", label: "Passport no.", type: "text" },
      { name: "passportExpiry", label: "Passport expiry", type: "date", hideInTable: true },
      { name: "visaStatus", label: "Visa status", type: "select", options: ["Not Required", "Applied", "Approved", "Rejected"], default: "Not Required", tones: { "Not Required": "slate", Applied: "amber", Approved: "green", Rejected: "red" } },
      { name: "emergencyContact", label: "Emergency contact", type: "text", hideInTable: true },
      { name: "specialRequests", label: "Special requests", type: "textarea", full: true, hideInTable: true },
      { name: "medicalNotes", label: "Medical notes", type: "textarea", full: true, hideInTable: true },
    ],
    kpis: [
      { label: "Travelers", icon: "Users", tone: "terracotta", kind: "count" },
      { label: "Visa Approved", icon: "BadgeCheck", tone: "green", kind: "countWhere", field: "visaStatus", value: "Approved" },
      { label: "Visa Pending", icon: "Clock", tone: "amber", kind: "countWhere", field: "visaStatus", value: "Applied" },
    ],
  },

  // 9. FLIGHTS --------------------------------------------------------------
  flights: {
    slug: "flights",
    model: "flight",
    title: "Flights",
    subtitle: "Air bookings, PNRs & schedules",
    icon: "PlaneTakeoff",
    singular: "Flight",
    searchFields: ["airline", "flightNo", "pnr", "fromCity", "toCity"],
    filterField: "status",
    orderBy: { field: "departAt", dir: "asc" },
    fields: [
      { name: "airline", label: "Airline", type: "text", required: true, primary: true, placeholder: "e.g. IndiGo" },
      { name: "flightNo", label: "Flight no.", type: "text", placeholder: "6E-234" },
      { name: "pnr", label: "PNR", type: "text" },
      { name: "fromCity", label: "From", type: "text", default: "Jaipur" },
      { name: "toCity", label: "To", type: "text", default: "Goa" },
      { name: "departAt", label: "Departure", type: "date" },
      { name: "arriveAt", label: "Arrival", type: "date", hideInTable: true },
      { name: "seat", label: "Seat", type: "text", hideInTable: true },
      { name: "baggage", label: "Baggage", type: "text", hideInTable: true, placeholder: "15kg + 7kg cabin" },
      { name: "status", label: "Status", type: "select", options: ["Confirmed", "Pending", "Cancelled", "Delayed"], default: "Confirmed", tones: { Confirmed: "green", Pending: "amber", Cancelled: "red", Delayed: "amber" } },
    ],
    kpis: [
      { label: "Flights", icon: "PlaneTakeoff", tone: "terracotta", kind: "count" },
      { label: "Confirmed", icon: "CheckCircle2", tone: "green", kind: "countWhere", field: "status", value: "Confirmed" },
      { label: "Pending", icon: "Clock", tone: "amber", kind: "countWhere", field: "status", value: "Pending" },
    ],
  },

  // 10. DOCUMENTS -----------------------------------------------------------
  documents: {
    slug: "documents",
    model: "travelDocument",
    title: "Travel Documents",
    subtitle: "Passports, visas, vouchers, tickets & agreements",
    icon: "FolderOpen",
    singular: "Document",
    searchFields: ["title", "owner", "number"],
    filterField: "type",
    orderBy: { field: "createdAt", dir: "desc" },
    fields: [
      { name: "title", label: "Document title", type: "text", required: true, primary: true, full: true, placeholder: "e.g. Kapoor Family — Thailand Visa" },
      { name: "type", label: "Type", type: "select", options: ["Passport", "Visa", "Ticket", "Hotel Voucher", "Insurance", "Invoice", "Travel Permit", "Agreement"], default: "Passport", tones: { Passport: "blue", Visa: "violet", Insurance: "green", Ticket: "amber" } },
      { name: "owner", label: "Owner / Traveler", type: "text" },
      { name: "number", label: "Reference no.", type: "text" },
      { name: "issuedAt", label: "Issued on", type: "date", hideInTable: true },
      { name: "expiresAt", label: "Expires on", type: "date" },
      { name: "status", label: "Status", type: "select", options: ["Valid", "Expiring", "Expired", "Pending"], default: "Valid", tones: { Valid: "green", Expiring: "amber", Expired: "red", Pending: "slate" } },
    ],
    kpis: [
      { label: "Documents", icon: "FolderOpen", tone: "terracotta", kind: "count" },
      { label: "Valid", icon: "ShieldCheck", tone: "green", kind: "countWhere", field: "status", value: "Valid" },
      { label: "Expiring", icon: "AlertTriangle", tone: "amber", kind: "countWhere", field: "status", value: "Expiring" },
    ],
  },

  // 11. REVIEWS -------------------------------------------------------------
  reviews: {
    slug: "reviews",
    model: "review",
    title: "Reviews & Feedback",
    subtitle: "Ratings, complaints, suggestions & NPS",
    icon: "MessageSquareHeart",
    singular: "Review",
    searchFields: ["traveler", "tour", "comment"],
    filterField: "type",
    orderBy: { field: "createdAt", dir: "desc" },
    fields: [
      { name: "traveler", label: "Traveler", type: "text", required: true, primary: true },
      { name: "type", label: "Type", type: "select", options: ["Review", "Complaint", "Suggestion"], default: "Review", tones: { Review: "green", Complaint: "red", Suggestion: "blue" } },
      { name: "tour", label: "Tour / Trip", type: "text", placeholder: "e.g. Udaipur Honeymoon" },
      { name: "rating", label: "Rating (1-5)", type: "rating", default: 5 },
      { name: "nps", label: "NPS (0-10)", type: "number", default: 9 },
      { name: "comment", label: "Comment", type: "textarea", full: true, hideInTable: true },
      { name: "resolved", label: "Resolved", type: "bool", default: 0 },
    ],
    kpis: [
      { label: "Feedback", icon: "MessageSquareHeart", tone: "terracotta", kind: "count" },
      { label: "Avg Rating", icon: "Star", tone: "amber", kind: "avg", field: "rating", suffix: " ★" },
      { label: "Avg NPS", icon: "TrendingUp", tone: "green", kind: "avg", field: "nps" },
      { label: "Complaints", icon: "AlertTriangle", tone: "red", kind: "countWhere", field: "type", value: "Complaint" },
    ],
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);

export function getResource(slug: string): ResourceSpec | undefined {
  return RESOURCES[slug];
}
