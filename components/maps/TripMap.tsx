import { MapPin, Navigation } from "lucide-react";

/**
 * Renders a Google Maps embed for a trip. With 2+ stops it draws the driving
 * route (e.g. Jaipur → Jodhpur → Goa); with a single place it shows a map pin.
 * Uses the keyless classic Maps embed — no API key required.
 */
export function TripMap({ stops, height = 320 }: { stops: string[]; height?: number }) {
  const clean = stops.map((s) => s.trim()).filter(Boolean);
  if (clean.length === 0) return null;

  const enc = (s: string) => encodeURIComponent(s.includes(",") ? s : `${s}, India`);

  let src: string;
  if (clean.length >= 2) {
    const first = clean[0];
    const rest = clean.slice(1);
    const daddr = rest.map(enc).join("+to:");
    src = `https://maps.google.com/maps?saddr=${enc(first)}&daddr=${daddr}&output=embed`;
  } else {
    src = `https://maps.google.com/maps?q=${enc(clean[0])}&z=11&output=embed`;
  }

  return (
    <div>
      {/* Route chips */}
      <div className="flex items-center flex-wrap gap-1.5 mb-3">
        {clean.map((s, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-cream-200 text-ink px-2.5 py-1 text-xs font-semibold">
              <MapPin className="h-3 w-3 text-brand-500" /> {s}
            </span>
            {i < clean.length - 1 && <Navigation className="h-3 w-3 text-ink-faint rotate-90" />}
          </span>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden border border-line" style={{ height }}>
        <iframe
          title="Trip route map"
          src={src}
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <a
        href={
          clean.length >= 2
            ? `https://www.google.com/maps/dir/${clean.map((s) => encodeURIComponent(s)).join("/")}`
            : `https://www.google.com/maps/search/${encodeURIComponent(clean[0])}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3"
      >
        <Navigation className="h-4 w-4" /> Open route in Google Maps
      </a>
    </div>
  );
}
