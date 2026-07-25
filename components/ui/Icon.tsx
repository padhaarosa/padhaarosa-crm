import {
  Map, MapPin, Hotel, Car, UserRound, Handshake, Ticket, Users, PlaneTakeoff,
  FolderOpen, MessageSquareHeart, CheckCircle2, Globe, IndianRupee, Home, BedDouble,
  Crown, Navigation, Star, FileCheck, Wallet, Mountain, BadgeCheck, Clock, ShieldCheck,
  AlertTriangle, TrendingUp, Calendar, BarChart3, Circle,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Map, MapPin, Hotel, Car, UserRound, Handshake, Ticket, Users, PlaneTakeoff,
  FolderOpen, MessageSquareHeart, CheckCircle2, Globe, IndianRupee, Home, BedDouble,
  Crown, Navigation, Star, FileCheck, Wallet, Mountain, BadgeCheck, Clock, ShieldCheck,
  AlertTriangle, TrendingUp, Calendar, BarChart3,
};

export function getIcon(name?: string) {
  return (name && ICONS[name]) || Circle;
}

export function Icon({ name, className }: { name?: string; className?: string }) {
  const Cmp = getIcon(name);
  return <Cmp className={className} />;
}
