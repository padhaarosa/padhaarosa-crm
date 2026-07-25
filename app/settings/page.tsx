import Image from "next/image";
import { Settings, Building2, Landmark, FileText, Users, ShieldCheck } from "lucide-react";
import { getSettings, getAgents } from "@/lib/data";
import { PageHeader, Card, CardHeader, Avatar, Badge } from "@/components/ui/primitives";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { updateSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [s, agents] = await Promise.all([getSettings(), getAgents()]);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your brand, contact and billing details across the CRM" icon={Settings} />

      <form action={updateSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Branding */}
          <Card>
            <CardHeader title="Company & Branding" subtitle="Shown on quotes, invoices & the sidebar" icon={Building2} />
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5 p-4 rounded-xl bg-gradient-to-r from-plum-800 to-maroon-600">
                <div className="relative h-16 w-16 rounded-full overflow-hidden ring-2 ring-white/40 bg-white shrink-0">
                  <Image src={s.logoUrl || "/logo.png"} alt={s.companyName} fill sizes="64px" className="object-cover" />
                </div>
                <div className="text-white">
                  <div className="font-display text-lg font-semibold">{s.companyName}</div>
                  <div className="text-gold-400 text-sm">{s.tagline}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company name" required>
                  <Input name="companyName" defaultValue={s.companyName} required />
                </Field>
                <Field label="Tagline">
                  <Input name="tagline" defaultValue={s.tagline} />
                </Field>
              </div>
            </div>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader title="Contact & Legal" subtitle="How customers reach you" icon={ShieldCheck} />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email"><Input name="email" type="email" defaultValue={s.email} /></Field>
              <Field label="Phone"><Input name="phone" defaultValue={s.phone} /></Field>
              <Field label="Website"><Input name="website" defaultValue={s.website} /></Field>
              <Field label="GSTIN"><Input name="gstin" defaultValue={s.gstin} /></Field>
              <Field label="Currency"><Input name="currency" defaultValue={s.currency} /></Field>
              <Field label="Address" className="sm:col-span-2"><Textarea name="address" defaultValue={s.address} className="min-h-[60px]" /></Field>
            </div>
          </Card>

          {/* Bank */}
          <Card>
            <CardHeader title="Payment Details" subtitle="Printed on invoices for customer payments" icon={Landmark} />
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Bank name"><Input name="bankName" defaultValue={s.bankName} /></Field>
              <Field label="Account number"><Input name="bankAccount" defaultValue={s.bankAccount} /></Field>
              <Field label="IFSC"><Input name="bankIfsc" defaultValue={s.bankIfsc} /></Field>
              <Field label="UPI ID"><Input name="upiId" defaultValue={s.upiId} /></Field>
            </div>
          </Card>

          {/* Invoice note */}
          <Card>
            <CardHeader title="Document Footer" subtitle="Thank-you note on quotes & invoices" icon={FileText} />
            <div className="p-5">
              <Field label="Footer message">
                <Textarea name="invoiceNotes" defaultValue={s.invoiceNotes} />
              </Field>
            </div>
          </Card>

          <div className="flex justify-end sticky bottom-4">
            <div className="bg-white rounded-xl shadow-pop border border-line p-2">
              <SubmitButton>Save Settings</SubmitButton>
            </div>
          </div>
        </div>

        {/* Team sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Team" subtitle={`${agents.length} members`} icon={Users} />
            <div className="divide-y divide-line">
              {agents.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={a.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink text-sm truncate">{a.name}</div>
                    <div className="text-xs text-ink-faint truncate">{a.email}</div>
                  </div>
                  <Badge tone={a.role === "Admin" ? "terracotta" : a.role === "Manager" ? "violet" : "slate"}>{a.role}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-cream-100 to-cream-200">
            <h3 className="font-display text-base font-semibold text-ink mb-2">About this CRM</h3>
            <p className="text-sm text-ink-soft leading-relaxed">
              Padhaaro Sa.. CRM keeps your leads, bookings, itineraries, quotes and payments together in one warm,
              royal workspace — so you spend less time on admin and more time crafting unforgettable journeys.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone="terracotta">Leads</Badge>
              <Badge tone="blue">Bookings</Badge>
              <Badge tone="amber">Quotes</Badge>
              <Badge tone="green">Payments</Badge>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
