# Padhaaro Sa.. — Travel & Hospitality CRM

A full-stack CRM to run a travel business in one place — leads, bookings & itineraries,
quotations, invoices and payments — with the **Padhaaro Sa..** Rajasthani heritage branding.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · MongoDB**.

---

## ✨ Features

- **Dashboard** — revenue trend, sales pipeline, conversion rate, upcoming departures,
  follow-ups due, lead sources and recent invoices at a glance.
- **Leads & Contacts** — drag-and-drop pipeline board (New → Won/Lost), list view with filters,
  full lead profile with an activity/follow-up timeline, call & WhatsApp shortcuts.
- **Bookings & Itineraries** — trip cards, a day-by-day itinerary builder (hotel, meals,
  transport, sightseeing), trip status tracking.
- **Quotations** — branded, printable quotes with line items, GST & discounts;
  one-click **convert quote → invoice**.
- **Invoices & Payments** — branded GST invoices, record part-payments (auto Paid/Partial/Overdue),
  outstanding & overdue tracking, bank/UPI details, print/PDF.
- **Settings** — edit company branding, contact, GSTIN, bank details and document footer;
  team roster.

All data is stored in **MongoDB** via Prisma (MongoDB Atlas, or any local replica set).

---

## 🚀 Getting started

```bash
# 1. install dependencies
npm install

# 2. point .env at your MongoDB database
#    DATABASE_URL="mongodb+srv://USER:PASS@CLUSTER.mongodb.net/padhaaro-crm"

# 3. push the schema, generate the client and load demo data
npm run setup          # = prisma generate + db push + seed

# 4. run in development
npm run dev            # http://localhost:3000

# — or — build & run production
npm run build
npm start
```

> The collections and demo data are created in your MongoDB database by `npm run setup`.
> To reload fresh demo data at any time: `npm run seed`.
>
> **Note:** Prisma writes to MongoDB through transactions, so the database must be a
> replica set. MongoDB Atlas (any tier, including free M0) works out of the box; a plain
> standalone `mongod` does not.

---

## 🧭 Useful scripts

| Script            | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server                      |
| `npm run build`   | Production build (runs `prisma generate`) |
| `npm start`       | Start the production server               |
| `npm run setup`   | Generate client + push schema + seed      |
| `npm run seed`    | Re-seed demo data                         |
| `npm run db:push` | Push the schema to MongoDB                |

---

## 🎨 Branding

The palette is drawn from the Padhaaro Sa.. logo (Hawa Mahal, Jaipur):
terracotta/rust primary, dusty mauve-plum sidebar, deep maroon and gold accents on warm cream.
Edit brand colours in [`tailwind.config.ts`](tailwind.config.ts) and company details on the **Settings** page.

The logo lives at [`public/logo.png`](public/logo.png).

---

## 🗂️ Project structure

```
app/                    # routes (dashboard, leads, bookings, quotes, invoices, settings)
  actions/              # server actions (CRUD for every module)
components/             # UI: layout, primitives, charts, per-module dialogs & panels
lib/                    # prisma client, utils, constants, money helpers
prisma/                 # schema.prisma + seed.ts
```

Made with ♥ for the road ahead — *Padharo mhare desh!* 🐫
