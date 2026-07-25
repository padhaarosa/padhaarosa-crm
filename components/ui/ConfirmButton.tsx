"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfirmButton({
  action,
  children,
  confirm = "Are you sure?",
  className,
  title,
}: {
  action: () => Promise<unknown>;
  children: React.ReactNode;
  confirm?: string;
  className?: string;
  title?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirm)) start(() => void action());
      }}
      className={cn(className, pending && "opacity-60 pointer-events-none")}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
