"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { changePassword, type FormState } from "@/app/actions/auth";
import { Card, CardHeader } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ChangePasswordCard({ email }: { email: string }) {
  const [state, formAction] = useActionState<FormState, FormData>(changePassword, {});

  return (
    <Card>
      <CardHeader title="Change Password" subtitle={email} icon={KeyRound} />
      {/*
        Standalone form — the surrounding Settings page is itself one big <form>,
        and HTML forbids nesting, so this card lives outside it.
      */}
      <form action={formAction} className="p-5 space-y-4">
        <input type="hidden" name="username" value={email} autoComplete="username" readOnly hidden />

        <Field label="Current password" required>
          <Input name="currentPassword" type="password" autoComplete="current-password" required />
        </Field>
        <Field label="New password" required hint="At least 8 characters, with a letter and a number.">
          <Input name="newPassword" type="password" autoComplete="new-password" required />
        </Field>
        <Field label="Confirm new password" required>
          <Input name="confirmPassword" type="password" autoComplete="new-password" required />
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
        {state.ok && (
          <p className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            {state.ok}
          </p>
        )}

        <div className="flex justify-end">
          <SubmitButton variant="secondary">Update Password</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
