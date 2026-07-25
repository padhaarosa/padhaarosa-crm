import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ScrollKeeper } from "@/components/ui/ScrollKeeper";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Padhaaro Sa.. — Travel CRM",
  description: "Run your travel & hospitality business in one place. Leads, bookings, itineraries, quotes, invoices & payments.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <ScrollKeeper />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 lg:pl-[248px]">
            <Topbar />
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] w-full mx-auto animate-fade-in overflow-x-hidden">
              {children}
            </main>
            <footer className="no-print px-6 py-6 text-center text-xs text-ink-faint">
              Padhaaro Sa.. Hospitality Services · Jaipur, Rajasthan · Made with{" "}
              <span className="text-brand-500">♥</span> for the road ahead
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
