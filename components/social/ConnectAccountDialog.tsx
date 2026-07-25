"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Link2, KeyRound } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { connectAccount, updateAccount } from "@/app/actions/social";
import { SOCIAL_CHANNELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Account = {
  id: string;
  channel: string;
  handle: string;
  url: string | null;
  followers: number;
  growth: number;
  engagement: number;
  apiKey?: string | null;
  accessToken?: string | null;
  accountRef?: string | null;
};

const API_HINT: Record<string, string> = {
  Facebook: "Meta Graph API — paste a Page access token + Page ID to auto-publish text posts.",
  Instagram: "Meta Graph API (IG Business) — token + IG account ID. Posting needs media.",
  YouTube: "YouTube Data API — OAuth token + Channel ID (video uploads).",
  X: "X API v2 — bearer/OAuth token.",
  LinkedIn: "LinkedIn Marketing API — access token + org URN.",
  WhatsApp: "WhatsApp Cloud API — token + phone number ID.",
};

export function ConnectAccountDialog({
  account,
  variant = "primary",
  label,
  className,
}: {
  account?: Account;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(account?.channel ?? "Instagram");
  const router = useRouter();
  const isEdit = !!account;
  const activeChannel = isEdit ? account!.channel : channel;

  async function submit(fd: FormData) {
    if (isEdit) await updateAccount(account!.id, fd);
    else await connectAccount(fd);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}>
        {isEdit ? <Pencil className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "Connect Account")}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={isEdit ? "Edit Account" : "Connect Social Account"} subtitle="Link a channel so it appears in your dashboard & posts" size="md">
        <form action={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Channel" required>
              {isEdit ? (
                <Input name="channel" defaultValue={account!.channel} readOnly className="bg-cream-100" />
              ) : (
                <Select name="channel" value={channel} onChange={(e) => setChannel(e.target.value)} options={SOCIAL_CHANNELS} />
              )}
            </Field>
            <Field label="Handle / Username" required>
              <Input name="handle" defaultValue={account?.handle ?? ""} placeholder="@padhaaro.sa" required />
            </Field>
            <Field label="Profile URL" className="sm:col-span-2">
              <Input name="url" type="url" defaultValue={account?.url ?? ""} placeholder="https://instagram.com/padhaaro.sa" />
            </Field>
            <Field label="Followers">
              <Input name="followers" type="number" min={0} defaultValue={account?.followers ?? 0} />
            </Field>
            <Field label="Growth (%)">
              <Input name="growth" type="number" step="0.1" defaultValue={account?.growth ?? 0} />
            </Field>
            <Field label="Engagement (%)">
              <Input name="engagement" type="number" step="0.1" defaultValue={account?.engagement ?? 0} />
            </Field>
          </div>

          {/* API connection */}
          <div className="rounded-xl border border-line bg-cream-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-ink">API connection (optional)</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              {API_HINT[activeChannel] ?? "Paste your API token to enable auto-publishing from the content calendar."}
            </p>
            <Field label="Access token">
              <Input name="accessToken" type="password" defaultValue={account?.accessToken ?? ""} placeholder="Paste OAuth / API access token" autoComplete="off" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Account / Page ID">
                <Input name="accountRef" defaultValue={account?.accountRef ?? ""} placeholder="Page ID / Channel ID" />
              </Field>
              <Field label="App ID / API key">
                <Input name="apiKey" defaultValue={account?.apiKey ?? ""} placeholder="Optional" />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save" : "Connect"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
