"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Users, Plane, FileText, ReceiptIndianRupee, ChevronDown } from "lucide-react";

const QUICK = [
  { href: "/leads?new=1", label: "New Lead", icon: Users },
  { href: "/bookings?new=1", label: "New Booking", icon: Plane },
  { href: "/quotes?new=1", label: "New Quotation", icon: FileText },
  { href: "/invoices?new=1", label: "New Invoice", icon: ReceiptIndianRupee },
];

export function Topbar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/leads" + (q ? "?q=" + encodeURIComponent(q) : ""));
  };

  return (
    <header className="no-print sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-line/70">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16 max-w-[1400px] w-full mx-auto">
        <div className="w-10 lg:hidden" />

        <form onSubmit={submit} className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, contacts, destinations…"
            className="w-full rounded-xl border border-line bg-white/70 pl-9 pr-3 py-2.5 text-sm placeholder:text-ink-faint focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="btn-primary btn-sm sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-pop border border-line p-1.5 z-50 animate-fade-in">
                {QUICK.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-cream-200"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white border border-line pl-1 pr-3 py-1">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-plum-700 text-white text-xs font-bold">
              PS
            </span>
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-semibold text-ink">Admin</div>
              <div className="text-[10px] text-ink-faint">Padhaaro Sa..</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
