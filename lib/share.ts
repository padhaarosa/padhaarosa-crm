// Real, key-less social share integrations via each platform's public web intent.
// Clicking a link opens the platform's own composer prefilled with your content.

export type ShareTarget = "WhatsApp" | "Facebook" | "X" | "LinkedIn" | "Telegram" | "Email";

export function buildShareUrls(text: string, url: string): Record<ShareTarget, string> {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  const tu = encodeURIComponent(`${text}\n${url}`);
  return {
    WhatsApp: `https://wa.me/?text=${tu}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`,
    X: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
    LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
    Telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    Email: `mailto:?subject=${encodeURIComponent("A journey with Padhaaro Sa..")}&body=${tu}`,
  };
}

export const SHARE_TARGETS: { key: ShareTarget; label: string; color: string; icon: string }[] = [
  { key: "WhatsApp", label: "WhatsApp", color: "#25D366", icon: "MessageCircle" },
  { key: "Facebook", label: "Facebook", color: "#1877F2", icon: "Facebook" },
  { key: "X", label: "X (Twitter)", color: "#111827", icon: "Twitter" },
  { key: "LinkedIn", label: "LinkedIn", color: "#0A66C2", icon: "Linkedin" },
  { key: "Telegram", label: "Telegram", color: "#0088CC", icon: "Send" },
  { key: "Email", label: "Email", color: "#6E5F72", icon: "Mail" },
];
