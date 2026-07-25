"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, MessageCircle, Facebook, Twitter, Linkedin, Send, Mail, Copy, Check } from "lucide-react";
import { buildShareUrls, SHARE_TARGETS, type ShareTarget } from "@/lib/share";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle, Facebook, Twitter, Linkedin, Send, Mail,
};

export function ShareMenu({
  text,
  url,
  label = "Share",
  className = "btn-secondary btn-sm",
  align = "right",
}: {
  text: string;
  url: string;
  label?: string;
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const urls = buildShareUrls(text, url);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(target: ShareTarget) {
    window.open(urls[target], "_blank", "noopener,noreferrer,width=640,height=640");
    setOpen(false);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        /* user cancelled */
      }
      setOpen(false);
    } else {
      setOpen((o) => !o);
    }
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={className}
        title="Share to social platforms"
      >
        <Share2 className="h-4 w-4" /> {label}
      </button>

      {open && (
        <div className={cn("absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-pop border border-line p-1.5 animate-fade-in", align === "right" ? "right-0" : "left-0")}>
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Share to</div>
          {SHARE_TARGETS.map((t) => {
            const Icon = ICONS[t.icon] ?? Share2;
            return (
              <button
                key={t.key}
                onClick={() => go(t.key)}
                className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-ink hover:bg-cream-200"
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg text-white shrink-0" style={{ background: t.color }}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {t.label}
              </button>
            );
          })}
          <div className="my-1 h-px bg-line" />
          <button onClick={copyCaption} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-ink hover:bg-cream-200">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-cream-200 text-ink-soft shrink-0">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </span>
            {copied ? "Caption copied!" : "Copy caption"}
          </button>
        </div>
      )}
    </div>
  );
}
