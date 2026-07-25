"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Plane,
  FileText,
  ReceiptIndianRupee,
  Settings,
  Menu,
  X,
  Compass,
  CalendarHeart,
  UsersRound,
  Share2,
  Map,
  MapPin,
  Hotel,
  PlaneTakeoff,
  Car,
  Ticket,
  UserRound,
  Handshake,
  FolderOpen,
  MessageSquareHeart,
  Calendar,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS: { title: string; items: { href: string; label: string; icon: typeof Users }[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads & Contacts", icon: Users },
      { href: "/bookings", label: "Bookings & Trips", icon: Plane },
      { href: "/quotes", label: "Quotations", icon: FileText },
      { href: "/invoices", label: "Invoices & Payments", icon: ReceiptIndianRupee },
    ],
  },
  {
    title: "Travel Management",
    items: [
      { href: "/travel/tours", label: "Tour Packages", icon: Map },
      { href: "/travel/destinations", label: "Destinations", icon: MapPin },
      { href: "/travel/hotels", label: "Hotels", icon: Hotel },
      { href: "/travel/flights", label: "Flights", icon: PlaneTakeoff },
      { href: "/travel/transport", label: "Transport & Fleet", icon: Car },
      { href: "/travel/activities", label: "Activities", icon: Ticket },
      { href: "/travel/guides", label: "Tour Guides", icon: UserRound },
      { href: "/travel/travelers", label: "Travelers", icon: Users },
      { href: "/travel/vendors", label: "Vendors", icon: Handshake },
      { href: "/travel/documents", label: "Documents", icon: FolderOpen },
      { href: "/travel/reviews", label: "Reviews & Feedback", icon: MessageSquareHeart },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/events", label: "Events & MICE", icon: CalendarHeart },
      { href: "/calendar", label: "Travel Calendar", icon: Calendar },
      { href: "/team", label: "Team & Employees", icon: UsersRound },
    ],
  },
  {
    title: "Marketing & Insights",
    items: [
      { href: "/social", label: "Social Media", icon: Share2 },
      { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavList = () => (
    <>
      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-5 last:mb-0">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-plum-200/60">
            {section.title}
          </div>
          <nav className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false} // 17 links: skip the background prefetch burst (trips proxy rate-limits)
                  onClick={() => setOpen(false)}
                  className={cn("nav-link", active && "nav-link-active")}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.4 : 2} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <button
        onClick={() => setOpen(true)}
        className="no-print lg:hidden fixed top-3.5 left-4 z-40 grid h-10 w-10 place-items-center rounded-xl bg-plum-800 text-white shadow-pop"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-plum-900/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 w-[248px] flex flex-col",
          "bg-gradient-to-b from-plum-800 via-plum-800 to-maroon-600",
          "transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5">
          <div className="relative h-11 w-11 shrink-0 rounded-full ring-2 ring-white/30 overflow-hidden bg-white/90">
            <Image src="/logo.png" alt="Padhaaro Sa.." fill sizes="44px" className="object-cover" priority />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[17px] font-semibold text-white leading-tight truncate">
              Padhaaro Sa..
            </div>
            <div className="text-[11px] text-gold-400 tracking-wide">Hospitality Services</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden ml-auto text-white/70 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-5 h-px bg-white/10" />

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavList />
        </div>

        {/* Footer card */}
        <div className="p-3">
          <div className="rounded-xl bg-white/10 p-3.5 text-plum-100">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
              <Compass className="h-4 w-4 text-gold-400" />
              Padharo mhare desh
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-plum-100/70">
              Every journey begins with a warm Rajasthani welcome.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
