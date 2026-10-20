"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LinkPending } from "@/components/link-pending";
import { mainNav, secondaryNav, type NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const base = "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors";

  if (item.comingSoon) {
    return (
      <span aria-disabled="true" className={cn(base, "text-muted-foreground/60 cursor-not-allowed")}>
        <Icon className="size-4" />
        {item.title}
        <span className="bg-muted text-muted-foreground ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        base,
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {item.title}
      <LinkPending className="ml-auto" />
    </Link>
  );
}

/** The sidebar links, shared by the desktop sidebar and the mobile menu. */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-6" aria-label="Main">
      <ul className="grid gap-1">
        {mainNav.map((item) => (
          <li key={item.href}>
            <NavLink item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
      <ul className="mt-auto grid gap-1">
        {secondaryNav.map((item) => (
          <li key={item.href}>
            <NavLink item={item} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
