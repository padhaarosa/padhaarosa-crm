"use server";

import { prisma } from "@/lib/prisma";
import { str, num, date, reqStr } from "@/lib/form";
import { revalidatePath } from "next/cache";

export async function createPost(fd: FormData) {
  const status = reqStr(fd, "status", "DRAFT");
  await prisma.socialPost.create({
    data: {
      channel: reqStr(fd, "channel", "Instagram"),
      content: reqStr(fd, "content", ""),
      campaign: str(fd, "campaign"),
      status,
      scheduledAt: status === "SCHEDULED" ? date(fd, "scheduledAt") : null,
      publishedAt: status === "PUBLISHED" ? date(fd, "scheduledAt") ?? new Date() : null,
      reach: num(fd, "reach") ?? 0,
    },
  });
  revalidatePath("/social");
}

export async function updatePost(id: string, fd: FormData) {
  const status = reqStr(fd, "status", "DRAFT");
  await prisma.socialPost.update({
    where: { id },
    data: {
      channel: reqStr(fd, "channel", "Instagram"),
      content: reqStr(fd, "content", ""),
      campaign: str(fd, "campaign"),
      status,
      scheduledAt: status === "SCHEDULED" ? date(fd, "scheduledAt") : null,
      publishedAt: status === "PUBLISHED" ? date(fd, "scheduledAt") ?? new Date() : null,
    },
  });
  revalidatePath("/social");
}

export async function deletePost(id: string) {
  await prisma.socialPost.delete({ where: { id } });
  revalidatePath("/social");
}

export async function markPublished(id: string) {
  await prisma.socialPost.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  revalidatePath("/social");
}

// ---- Connected accounts ----
function accountData(fd: FormData) {
  const accessToken = str(fd, "accessToken");
  return {
    handle: reqStr(fd, "handle", "@yourhandle"),
    url: str(fd, "url"),
    followers: num(fd, "followers") ?? 0,
    growth: num(fd, "growth") ?? 0,
    engagement: num(fd, "engagement") ?? 0,
    apiKey: str(fd, "apiKey"),
    accessToken,
    accountRef: str(fd, "accountRef"),
    connected: !!accessToken,
  };
}

export async function connectAccount(fd: FormData) {
  const channel = reqStr(fd, "channel", "Instagram");
  const data = accountData(fd);
  await prisma.socialAccount.upsert({ where: { channel }, update: data, create: { channel, ...data } });
  revalidatePath("/social");
}

export async function updateAccount(id: string, fd: FormData) {
  await prisma.socialAccount.update({ where: { id }, data: accountData(fd) });
  revalidatePath("/social");
}

/**
 * Publish a post through the platform's real API (uses the stored access token).
 * Facebook Pages support text posts directly; Instagram/YouTube require media
 * upload, so those fall back to a helpful message + the Share composer.
 */
export async function publishToApi(postId: string): Promise<{ ok: boolean; message: string }> {
  const post = await prisma.socialPost.findUnique({ where: { id: postId } });
  if (!post) return { ok: false, message: "Post not found." };
  const acc = await prisma.socialAccount.findUnique({ where: { channel: post.channel } });
  if (!acc?.accessToken) {
    return { ok: false, message: `No API token saved for ${post.channel}. Add it via Connect Account → API connection.` };
  }

  try {
    if (post.channel === "Facebook") {
      if (!acc.accountRef) return { ok: false, message: "Facebook Page ID (Account ref) is required." };
      const res = await fetch(`https://graph.facebook.com/v21.0/${acc.accountRef}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: post.content, access_token: acc.accessToken }),
      });
      const data: any = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        await prisma.socialPost.update({ where: { id: postId }, data: { status: "PUBLISHED", publishedAt: new Date() } });
        revalidatePath("/social");
        return { ok: true, message: `Published to Facebook ✓ (id ${data.id})` };
      }
      return { ok: false, message: data?.error?.message ?? `Facebook API returned ${res.status}.` };
    }

    if (post.channel === "Instagram") {
      return { ok: false, message: "Instagram Graph API needs an image/video container. Use 'Share now' or attach media." };
    }
    if (post.channel === "YouTube") {
      return { ok: false, message: "YouTube API is for video uploads, not text posts. Use 'Share now'." };
    }
    return { ok: false, message: `Auto-publish for ${post.channel} isn't wired to its API yet — use 'Share now' to open the composer.` };
  } catch (e: any) {
    return { ok: false, message: "API call failed: " + (e?.message ?? "network error") };
  }
}

export async function disconnectAccount(id: string) {
  await prisma.socialAccount.delete({ where: { id } });
  revalidatePath("/social");
}
