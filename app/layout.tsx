import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ScrollKeeper } from "@/components/ui/ScrollKeeper";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth screens render bare — no sidebar, no topbar.
  const pathname = (await headers()).get("x-pathname") ?? "";
  const bare = pathname === "/login" || pathname.startsWith("/login/");

  if (bare) {
    return (
      <html lang="en" className={`${sans.variable} ${display.variable}`}>
        <body>{children}</body>
      </html>
    );
  }

  const user = await getSession();

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>
        <ScrollKeeper />
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 lg:pl-[248px]">
            <Topbar user={user} />
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
