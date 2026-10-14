import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/auth";

/** Layout for every signed-in page: sidebar on desktop, header with menu on all sizes. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, displayName } = await requireUser();

  return (
    <div className="min-h-dvh">
      <AppSidebar />
      <div className="flex min-h-dvh flex-col md:pl-64">
        <AppHeader name={displayName} email={user.email ?? ""} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
