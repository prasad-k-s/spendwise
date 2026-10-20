import {
  Briefcase,
  Car,
  Circle,
  CircleEllipsis,
  CirclePlus,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** Icon names stored in categories.icon → lucide components. Unknown names fall back to a circle. */
const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  "shopping-cart": ShoppingCart,
  car: Car,
  "shopping-bag": ShoppingBag,
  receipt: Receipt,
  house: House,
  "heart-pulse": HeartPulse,
  clapperboard: Clapperboard,
  "graduation-cap": GraduationCap,
  plane: Plane,
  "circle-ellipsis": CircleEllipsis,
  wallet: Wallet,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "circle-plus": CirclePlus,
};

export function CategoryIcon({
  icon,
  color,
  className,
}: {
  icon?: string | null;
  color?: string | null;
  className?: string;
}) {
  const Icon = (icon && ICONS[icon]) || Circle;
  const tint = color ?? "#64748b";

  return (
    <span
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", className)}
      style={{ backgroundColor: `${tint}1f`, color: tint }}
      aria-hidden="true"
    >
      <Icon className="size-4" />
    </span>
  );
}
