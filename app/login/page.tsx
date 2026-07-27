import Image from "next/image";
import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — Padhaaro Sa..",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, s] = await Promise.all([searchParams, getSettings()]);

  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-gradient-to-br from-cream-100 via-cream to-cream-200">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-white shadow-pop bg-white">
            <Image src={s.logoUrl || "/logo.png"} alt={s.companyName} fill sizes="64px" className="object-cover" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink mt-4">{s.companyName}</h1>
          <p className="text-sm text-ink-faint mt-1">{s.tagline || "Travel & Hospitality CRM"}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-pop border border-line p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-ink-soft mb-5">Sign in to reach your workspace.</p>
          <LoginForm next={next ?? "/"} />
        </div>

        <p className="text-center text-xs text-ink-faint mt-6">
          Trouble signing in? Ask an admin to reset your password.
        </p>
      </div>
    </div>
  );
}
