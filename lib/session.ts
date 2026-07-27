// Signed session tokens.
//
// Deliberately dependency-free and built on Web Crypto so this module works in
// BOTH the edge runtime (middleware) and the node runtime (server actions).
// Nothing here may import "next/headers" — middleware cannot use it.

export const SESSION_COOKIE = "padhaaro_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number; // epoch ms
};

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set — refusing to sign sessions with a default key.");
  }
  return "dev-only-insecure-secret";
}

const enc = new TextEncoder();

function toB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sign(body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return toB64Url(new Uint8Array(sig));
}

/** Compare without leaking where the first difference is. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(
  agent: { id: string; name: string; email: string; role: string }
): Promise<string> {
  const payload: Session = {
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const body = toB64Url(enc.encode(JSON.stringify(payload)));
  return `${body}.${await sign(body)}`;
}

export async function verifySessionToken(token?: string | null): Promise<Session | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  if (!safeEqual(await sign(body), sig)) return null;

  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64Url(body))) as Session;
    if (!p?.id || typeof p.exp !== "number" || p.exp < Date.now()) return null;
    return p;
  } catch {
    return null;
  }
}
