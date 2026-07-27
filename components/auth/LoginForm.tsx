"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { login, type FormState } from "@/app/actions/auth";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <Field label="Email" required>
        <Input
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@padhaaro.com"
          required
          autoFocus
        />
      </Field>

      <Field label="Password" required>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2.5 text-sm text-brand-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full justify-center">Sign in</SubmitButton>
    </form>
  );
}
