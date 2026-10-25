import {
  ArrowLeftRight,
  LayoutDashboard,
  PiggyBank,
  Settings,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Shown as disabled with a "Soon" badge until the page is built. */
  comingSoon?: boolean;
};

export const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Categories", href: "/categories", icon: Tags, comingSoon: true },
  { title: "Groups", href: "/groups", icon: Users },
  { title: "Budgets", href: "/budgets", icon: PiggyBank, comingSoon: true },
];

export const secondaryNav: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings, comingSoon: true },
];
