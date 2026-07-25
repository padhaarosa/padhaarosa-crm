"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { publishToApi } from "@/app/actions/social";

export function PublishButton({ postId }: { postId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const router = useRouter();

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <button
        onClick={() =>
          start(async () => {
            const r = await publishToApi(postId);
            setMsg({ ok: r.ok, text: r.message });
            if (r.ok) router.refresh();
          })
        }
        disabled={pending}
        className="btn-sm inline-flex items-center gap-1.5 rounded-lg bg-plum-800 text-white hover:bg-plum-700 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Publish via API
      </button>
      {msg && (
        <span className={`text-xs inline-flex items-center gap-1 ${msg.ok ? "text-emerald-600" : "text-rose-500"}`}>
          {msg.ok ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />} {msg.text}
        </span>
      )}
    </div>
  );
}
