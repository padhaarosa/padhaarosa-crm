"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Hotel, Utensils, Car, Pencil, Trash2, Plus, X, CalendarDays } from "lucide-react";
import { addItineraryDay, updateItineraryDay, deleteItineraryDay } from "@/app/actions/bookings";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { fmtDate, dateInputValue, cn } from "@/lib/utils";

type Day = {
  id: string;
  dayNumber: number;
  date: Date | string | null;
  title: string;
  location: string | null;
  hotel: string | null;
  meals: string | null;
  activities: string | null;
  transport: string | null;
};

function DayFields({ day }: { day?: Day }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Day title" required className="sm:col-span-2">
          <Input name="title" defaultValue={day?.title} placeholder="e.g. Arrival & City Palace" required />
        </Field>
        <Field label="Date">
          <Input name="date" type="date" defaultValue={dateInputValue(day?.date)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Location">
          <Input name="location" defaultValue={day?.location ?? ""} placeholder="e.g. Udaipur" />
        </Field>
        <Field label="Hotel / Stay">
          <Input name="hotel" defaultValue={day?.hotel ?? ""} placeholder="e.g. The Leela Palace" />
        </Field>
        <Field label="Meals">
          <Input name="meals" defaultValue={day?.meals ?? ""} placeholder="e.g. Breakfast, Dinner" />
        </Field>
        <Field label="Transport">
          <Input name="transport" defaultValue={day?.transport ?? ""} placeholder="e.g. AC Sedan" />
        </Field>
      </div>
      <Field label="Activities & sightseeing">
        <Textarea name="activities" defaultValue={day?.activities ?? ""} placeholder="Describe the day's plan…" />
      </Field>
    </div>
  );
}

export function ItineraryBuilder({ bookingId, days }: { bookingId: string; days: Day[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  async function addAction(fd: FormData) {
    await addItineraryDay(bookingId, fd);
    setAdding(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {days.map((day, i) => (
          <div key={day.id} className="relative pl-12 pb-4">
            {/* connector */}
            {i < days.length - 1 && <span className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-line" />}
            <span className="absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white font-display font-bold shadow-soft">
              {day.dayNumber}
            </span>

            {editing === day.id ? (
              <form
                action={async (fd) => {
                  await updateItineraryDay(day.id, bookingId, fd);
                  setEditing(null);
                  router.refresh();
                }}
                className="rounded-xl border border-brand-200 bg-white p-4 shadow-soft"
              >
                <DayFields day={day} />
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-line">
                  <button type="button" onClick={() => setEditing(null)} className="btn-ghost btn-sm">Cancel</button>
                  <SubmitButton className="btn-sm">Save Day</SubmitButton>
                </div>
              </form>
            ) : (
              <div className="group rounded-xl border border-line bg-white p-4 hover:shadow-soft transition">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-ink">{day.title}</h4>
                      {day.date && (
                        <span className="text-xs text-ink-faint inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" /> {fmtDate(day.date)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-ink-soft">
                      {day.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-brand-500" /> {day.location}</span>}
                      {day.hotel && <span className="inline-flex items-center gap-1"><Hotel className="h-3 w-3 text-brand-500" /> {day.hotel}</span>}
                      {day.meals && <span className="inline-flex items-center gap-1"><Utensils className="h-3 w-3 text-brand-500" /> {day.meals}</span>}
                      {day.transport && <span className="inline-flex items-center gap-1"><Car className="h-3 w-3 text-brand-500" /> {day.transport}</span>}
                    </div>
                    {day.activities && <p className="mt-2.5 text-sm text-ink-soft leading-relaxed">{day.activities}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button onClick={() => setEditing(day.id)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-cream-200 hover:text-ink" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <ConfirmButton
                      action={async () => {
                        await deleteItineraryDay(day.id, bookingId);
                        router.refresh();
                      }}
                      confirm={`Delete Day ${day.dayNumber}?`}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500"
                      title="Delete day"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {days.length === 0 && !adding && (
        <p className="text-sm text-ink-soft text-center py-4">No itinerary yet. Add the first day of the journey.</p>
      )}

      {/* Add day */}
      {adding ? (
        <form action={addAction} className="rounded-xl border border-brand-200 bg-cream-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-ink">Add Day {days.length + 1}</h4>
            <button type="button" onClick={() => setAdding(false)} className="text-ink-faint hover:text-ink"><X className="h-5 w-5" /></button>
          </div>
          <DayFields />
          <div className="flex justify-end gap-2 mt-3">
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost btn-sm">Cancel</button>
            <SubmitButton className="btn-sm">Add Day</SubmitButton>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-xl border-2 border-dashed border-line hover:border-brand-300 hover:bg-cream-100 text-ink-soft hover:text-brand-600 py-3 text-sm font-semibold inline-flex items-center justify-center gap-2 transition"
        >
          <Plus className="h-4 w-4" /> Add Day {days.length + 1}
        </button>
      )}
    </div>
  );
}
