import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export function AppHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="bg-background/80 sticky top-0 z-20 flex h-16 items-center gap-2 border-b px-4 backdrop-blur sm:px-6">
      <MobileNav />
      <div className="ml-auto flex items-center gap-1">
        <UserMenu name={name} email={email} />
      </div>
    </header>
  );
}
