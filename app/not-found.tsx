import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <span className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-50 text-brand-500 mb-5">
        <Compass className="h-10 w-10" />
      </span>
      <h1 className="font-display text-3xl font-semibold text-ink">Lost on the road?</h1>
      <p className="text-ink-soft mt-2 max-w-sm">
        We couldn&apos;t find that page. Let&apos;s get you back to familiar territory.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
}
