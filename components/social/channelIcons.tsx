import { Instagram, Facebook, Youtube, Twitter, Linkedin, MessageCircle, Share2 } from "lucide-react";

export const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Facebook,
  YouTube: Youtube,
  X: Twitter,
  LinkedIn: Linkedin,
  WhatsApp: MessageCircle,
};

export function ChannelIcon({ channel, className }: { channel: string; className?: string }) {
  const Icon = CHANNEL_ICONS[channel] ?? Share2;
  return <Icon className={className} />;
}
