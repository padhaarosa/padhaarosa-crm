import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getResource } from "@/lib/resources";
import { ResourceManager } from "@/components/resource/ResourceManager";

export const dynamic = "force-dynamic";

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const spec = getResource(resource);
  if (!spec) notFound();

  const orderBy = spec.orderBy ? { [spec.orderBy.field]: spec.orderBy.dir } : undefined;
  const rows = await (prisma as any)[spec.model].findMany({ orderBy });

  // serialise dates to keep the client payload clean
  const plain = rows.map((r: Record<string, any>) => {
    const o: Record<string, any> = {};
    for (const k of Object.keys(r)) {
      const v = r[k];
      o[k] = v instanceof Date ? v.toISOString() : v;
    }
    return o;
  });

  return <ResourceManager spec={spec} rows={plain} />;
}
