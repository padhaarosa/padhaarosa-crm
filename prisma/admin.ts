/**
 * Create or update an admin login, without touching any other data.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run admin
 *
 * Safe to re-run: an existing agent with that email has its password reset
 * and is promoted to Admin; otherwise a new agent is created.
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword, passwordProblem } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  const name = (process.env.ADMIN_NAME ?? "").trim() || "Administrator";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);

  const passwordHash = hashPassword(password);

  const existing = await prisma.agent.findUnique({ where: { email } });

  if (existing) {
    await prisma.agent.update({
      where: { email },
      data: { passwordHash, role: "Admin", active: true },
    });
    console.log(`Password reset for existing agent ${email} (promoted to Admin).`);
  } else {
    await prisma.agent.create({
      data: {
        name,
        email,
        passwordHash,
        role: "Admin",
        designation: "Owner",
        department: "Leadership",
      },
    });
    console.log(`Created admin ${email}.`);
  }

  console.log("You can now sign in at /login.");
}

main()
  .catch((e) => {
    console.error("Failed:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
