import { Logo } from "@/components/layout/logo";
import { NavLinks } from "@/components/layout/nav-links";

/** Fixed sidebar for tablets and desktops (md and up). */
export function AppSidebar() {
  return (
    <aside className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Logo />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        <NavLinks />
      </div>
    </aside>
  );
}
