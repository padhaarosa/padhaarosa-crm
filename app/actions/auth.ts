"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { reqStr } from "@/lib/form";
import { getSession, requireSession } from "@/lib/auth";
import { hashPassword, passwordProblem, safeCompare, verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, createSessionToken } from "@/lib/session";

export type FormState = { error?: string; ok?: string };

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/** Only allow relative paths back into the app — never an open redirect. */
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = reqStr(fd, "email").toLowerCase();
  const password = reqStr(fd, "password");
  const next = safeNext(reqStr(fd, "next", "/"));

  if (!email || !password) return { error: "Enter your email and password." };

  const agent = await prisma.agent.findUnique({ where: { email } });

  // A stored password always wins. Once the owner sets one in Settings, the
  // bootstrap credential below stops being consulted for them.
  let user = agent && agent.active && verifyPassword(password, agent.passwordHash) ? agent : null;

  // Owner bootstrap: the credential lives only in environment variables, never
  // in the repo or the seed. The first successful sign-in materialises the
  // agent row so the rest of the CRM has a real user to attach work to.
  if (!user && !agent?.passwordHash) {
    const ownerEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const ownerPassword = process.env.ADMIN_PASSWORD ?? "";

    if (ownerEmail && ownerPassword && email === ownerEmail && safeCompare(password, ownerPassword)) {
      user = await prisma.agent.upsert({
        where: { email: ownerEmail },
        update: { role: "Admin", active: true },
        create: {
          name: (process.env.ADMIN_NAME ?? "").trim() || "Administrator",
          email: ownerEmail,
          role: "Admin",
          designation: "Owner",
          department: "Leadership",
        },
      });
    }
  }

  // Same message either way — don't reveal which emails exist.
  if (!user) return { error: "Incorrect email or password." };

  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(user), cookieOptions);

  redirect(next);
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const session = await requireSession();

  const current = reqStr(fd, "currentPassword");
  const next = reqStr(fd, "newPassword");
  const confirm = reqStr(fd, "confirmPassword");

  if (!current || !next) return { error: "Fill in every field." };
  if (next !== confirm) return { error: "The new passwords don't match." };
  if (next === current) return { error: "Your new password must be different." };

  const problem = passwordProblem(next);
  if (problem) return { error: problem };

  const agent = await prisma.agent.findUnique({ where: { id: session.id } });
  if (!agent) return { error: "Your current password is incorrect." };

  // Someone who signed in with the bootstrap credential has no stored hash yet,
  // so accept the env password as "current" for that first change.
  const ownerEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const ownerPassword = process.env.ADMIN_PASSWORD ?? "";
  const currentIsValid = agent.passwordHash
    ? verifyPassword(current, agent.passwordHash)
    : Boolean(ownerPassword) && agent.email === ownerEmail && safeCompare(current, ownerPassword);

  if (!currentIsValid) return { error: "Your current password is incorrect." };

  await prisma.agent.update({
    where: { id: agent.id },
    data: { passwordHash: hashPassword(next) },
  });

  // Re-issue the cookie so the freshly signed-in tab keeps a valid session.
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(agent), cookieOptions);

  revalidatePath("/settings");
  return { ok: "Password updated." };
}

/** Convenience for the layout — never throws, just returns whoever is signed in. */
export async function currentUser() {
  return getSession();
}
