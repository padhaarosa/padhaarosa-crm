import Link from "next/link";
import { Share2, Users, Eye, CalendarClock, Heart, MessageSquare, Repeat2, TrendingUp, Trash2, ExternalLink, Megaphone, Link2, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";
import { fmtDate, relativeDay } from "@/lib/utils";
import { SOCIAL_META, POST_STATUS_META } from "@/lib/constants";
import { PageHeader, Card, CardHeader, StatTile, StatusBadge, Badge, EmptyState } from "@/components/ui/primitives";
import { FilterChips } from "@/components/ui/FilterChips";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { ChannelIcon } from "@/components/social/channelIcons";
import { SocialPostDialog } from "@/components/social/SocialPostDialog";
import { ConnectAccountDialog } from "@/components/social/ConnectAccountDialog";
import { ShareMenu } from "@/components/social/ShareMenu";
import { PublishButton } from "@/components/social/PublishButton";
import { deletePost, disconnectAccount, markPublished } from "@/app/actions/social";

export const dynamic = "force-dynamic";

function fmtK(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default async function SocialPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = sp.status ?? "";

  const [accounts, posts, allPosts, settings] = await Promise.all([
    prisma.socialAccount.findMany(),
    prisma.socialPost.findMany({ where: status ? { status } : {}, orderBy: [{ scheduledAt: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }] }),
    prisma.socialPost.findMany({ select: { reach: true, status: true } }),
    getSettings(),
  ]);

  const order = ["Instagram", "Facebook", "WhatsApp", "YouTube", "X", "LinkedIn"];
  const sortedAccounts = [...accounts].sort((a, b) => order.indexOf(a.channel) - order.indexOf(b.channel));

  const totalFollowers = accounts.reduce((s, a) => s + a.followers, 0);
  const totalReach = allPosts.reduce((s, p) => s + p.reach, 0);
  const scheduled = allPosts.filter((p) => p.status === "SCHEDULED").length;
  const avgEng = accounts.length ? (accounts.reduce((s, a) => s + a.engagement, 0) / accounts.length).toFixed(1) : "0";

  const site = settings.website?.startsWith("http") ? settings.website : `https://${settings.website || "padhaaro.com"}`;
  const apiChannels = new Set(accounts.filter((a) => a.accessToken).map((a) => a.channel));
  const filters = [{ key: "", label: "All" }, ...Object.entries(POST_STATUS_META).map(([key, m]) => ({ key, label: m.label }))];

  return (
    <div>
      <PageHeader title="Social Media" subtitle="Connect your channels, plan content & share to live platforms" icon={Share2}>
        <ConnectAccountDialog variant="secondary" />
        <SocialPostDialog />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Total Followers" value={fmtK(totalFollowers)} sub={`${accounts.length} channels`} icon={Users} tone="terracotta" />
        <StatTile label="Total Reach" value={fmtK(totalReach)} sub="Published content" icon={Eye} tone="blue" />
        <StatTile label="Scheduled" value={String(scheduled)} sub="Posts queued" icon={CalendarClock} tone="amber" />
        <StatTile label="Avg Engagement" value={avgEng + "%"} icon={TrendingUp} tone="green" />
      </div>

      {/* Connected channels */}
      {accounts.length === 0 ? (
        <Card className="mb-8">
          <EmptyState
            icon={Link2}
            title="No channels connected yet"
            message="Connect your Instagram, Facebook, WhatsApp and more to track followers and share content."
            action={<ConnectAccountDialog />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {sortedAccounts.map((a) => {
            const meta = SOCIAL_META[a.channel];
            return (
              <div key={a.id} className="card p-4 relative overflow-hidden group">
                <span className="absolute top-0 left-0 right-0 h-1" style={{ background: meta?.color }} />
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-white shrink-0" style={{ background: meta?.color }}>
                    <ChannelIcon channel={a.channel} className="h-5 w-5" />
                  </span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <ConnectAccountDialog account={a} variant="secondary" label="" className="btn-sm !px-1.5" />
                    <ConfirmButton action={disconnectAccount.bind(null, a.id)} confirm={`Disconnect ${a.channel}?`} className="grid h-7 w-7 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmButton>
                  </div>
                </div>
                <div className="mt-3 font-display text-xl font-semibold text-ink">{fmtK(a.followers)}</div>
                <a href={a.url ?? "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-ink-faint truncate flex items-center gap-1 hover:text-brand-600">
                  {a.handle} {a.url && <ExternalLink className="h-3 w-3" />}
                </a>
                <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                  <span className="text-emerald-600 font-semibold">▲ {a.growth}%</span>
                  <span className="text-ink-faint">· {a.engagement}% eng.</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content calendar / feed */}
      <Card>
        <CardHeader
          title="Content Calendar"
          subtitle={`${posts.length} posts`}
          icon={Megaphone}
          action={
            <FilterChips
              small
              chips={filters.map((f) => ({ href: f.key ? `/social?status=${f.key}` : "/social", label: f.label, active: status === f.key }))}
            />
          }
        />
        <div className="divide-y divide-line">
          {posts.map((p) => {
            const meta = SOCIAL_META[p.channel];
            return (
              <div key={p.id} className="group flex gap-4 px-5 py-4 hover:bg-cream-100 transition">
                <span className="grid h-11 w-11 place-items-center rounded-xl text-white shrink-0 self-start" style={{ background: meta?.color }}>
                  <ChannelIcon channel={p.channel} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-ink">{meta?.label ?? p.channel}</span>
                    <StatusBadge meta={POST_STATUS_META} status={p.status} />
                    {p.campaign && <Badge tone="terracotta">{p.campaign}</Badge>}
                    <span className="text-xs text-ink-faint ml-auto">
                      {p.status === "SCHEDULED" && p.scheduledAt ? `Scheduled ${relativeDay(p.scheduledAt)}` : p.publishedAt ? fmtDate(p.publishedAt) : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{p.content}</p>
                  {p.status === "PUBLISHED" && (
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-ink-faint">
                      <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {fmtK(p.likes)}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {fmtK(p.comments)}</span>
                      <span className="inline-flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" /> {fmtK(p.shares)}</span>
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {fmtK(p.reach)} reach</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <ShareMenu text={p.content} url={site} label="Share now" className="btn-secondary btn-sm" align="left" />
                    {apiChannels.has(p.channel) && p.status !== "PUBLISHED" && <PublishButton postId={p.id} />}
                    {p.status !== "PUBLISHED" && (
                      <ConfirmButton action={markPublished.bind(null, p.id)} confirm="Mark this post as published?" className="btn-ghost btn-sm inline-flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5" /> Mark published
                      </ConfirmButton>
                    )}
                    <SocialPostDialog post={p} variant="secondary" label="Edit" className="btn-sm" />
                    <ConfirmButton
                      action={deletePost.bind(null, p.id)}
                      confirm="Delete this post?"
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-rose-50 hover:text-rose-500 ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ConfirmButton>
                  </div>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="px-5 py-12">
              <EmptyState icon={Megaphone} title="No posts yet" message="Compose your first post and share it to your channels." action={<SocialPostDialog />} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
