import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  // simulate connectAccount()
  const acc = await p.socialAccount.upsert({
    where: { channel: "Instagram" },
    update: {},
    create: { channel: "Instagram", handle: "@test.padhaaro", url: "https://instagram.com/test", followers: 1234, growth: 5, engagement: 4 },
  });
  console.log("  " + (acc.handle === "@test.padhaaro" ? "✅" : "❌") + " connectAccount creates channel");

  const res = await fetch("http://localhost:3000/social");
  const html = await res.text();
  console.log("  " + (html.includes("@test.padhaaro") ? "✅" : "❌") + " account renders on /social page");
  console.log("  " + (html.includes("Share now") ? "✅" : "❌") + " (no posts yet — share buttons appear once posts exist)");

  // simulate a post + share button presence
  await p.socialPost.create({ data: { channel: "Instagram", content: "Test post for share", status: "DRAFT" } });
  const res2 = await fetch("http://localhost:3000/social");
  const html2 = await res2.text();
  console.log("  " + (html2.includes("Share now") ? "✅" : "❌") + " Share-now button renders on posts");

  // cleanup (simulate disconnectAccount + delete post)
  await p.socialPost.deleteMany({ where: { content: "Test post for share" } });
  await p.socialAccount.delete({ where: { id: acc.id } });
  const gone = await p.socialAccount.count();
  console.log("  " + (gone === 0 ? "✅" : "❌") + " disconnectAccount removes channel (back to empty)");
}

main().finally(() => p.$disconnect());
