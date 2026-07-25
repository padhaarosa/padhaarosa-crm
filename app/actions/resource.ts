"use server";

import { prisma } from "@/lib/prisma";
import { getResource } from "@/lib/resources";
import { str, num, date, bool } from "@/lib/form";
import { revalidatePath } from "next/cache";

function buildData(slug: string, fd: FormData) {
  const spec = getResource(slug);
  if (!spec) throw new Error("Unknown resource: " + slug);
  const data: Record<string, unknown> = {};
  for (const f of spec.fields) {
    switch (f.type) {
      case "number":
      case "money":
      case "rating":
        data[f.name] = num(fd, f.name) ?? (typeof f.default === "number" ? f.default : 0);
        break;
      case "date":
        data[f.name] = date(fd, f.name);
        break;
      case "bool":
        data[f.name] = bool(fd, f.name);
        break;
      default: {
        const v = str(fd, f.name);
        if (v != null) data[f.name] = v;
        else if (f.required) data[f.name] = String(f.default ?? "Untitled");
        else if (f.default != null) data[f.name] = String(f.default);
        else data[f.name] = null;
      }
    }
  }
  return { spec, data };
}

export async function saveResource(slug: string, id: string | null, fd: FormData) {
  const { spec, data } = buildData(slug, fd);
  const delegate = (prisma as any)[spec.model];
  if (id) await delegate.update({ where: { id }, data });
  else await delegate.create({ data });
  revalidatePath(`/travel/${slug}`);
  revalidatePath("/reports");
  revalidatePath("/calendar");
}

export async function removeResource(slug: string, id: string) {
  const spec = getResource(slug);
  if (!spec) return;
  await (prisma as any)[spec.model].delete({ where: { id } });
  revalidatePath(`/travel/${slug}`);
  revalidatePath("/reports");
}

/** Social-media integration: turn a catalog item into a ready-to-schedule post. */
export async function shareResourceToSocial(slug: string, id: string) {
  const spec = getResource(slug);
  if (!spec) return;
  const row = await (prisma as any)[spec.model].findUnique({ where: { id } });
  if (!row) return;

  let content = "";
  if (slug === "tours") {
    content = `✨ ${row.title} ✨\n${row.nights}N/${row.days}D across ${row.destination}. Starting ₹${Math.round(row.priceFrom).toLocaleString("en-IN")}/-\nDM to book your journey! 🧳 #PadhaaroSa #${String(row.destination).replace(/[^a-zA-Z]/g, "")}`;
  } else if (slug === "destinations") {
    content = `📍 Discover ${row.name}${row.state ? `, ${row.state}` : ""} 🌏\n${row.description ?? "A must-visit on your Rajasthan bucket list."}\nPlan your trip with Padhaaro Sa.. ✈️ #Travel #${String(row.name).replace(/[^a-zA-Z]/g, "")}`;
  } else {
    content = `Check out ${row.title ?? row.name} with Padhaaro Sa..! #Travel`;
  }

  await prisma.socialPost.create({
    data: { channel: "Instagram", content, campaign: spec.singular, status: "DRAFT" },
  });
  revalidatePath("/social");
  revalidatePath(`/travel/${slug}`);
}
