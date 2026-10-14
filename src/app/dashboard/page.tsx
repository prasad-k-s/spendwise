import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard · SpendWise" };

// Temporary dashboard to prove auth works. The real layout comes in the app-shell step.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, currency")
    .eq("id", user.id)
    .single();

  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Hi {profile?.full_name ?? user.email} 👋
        </h1>
        <p className="text-muted-foreground">
          You&apos;re signed in as {user.email}. Currency: {profile?.currency ?? "INR"}. You have{" "}
          {categoryCount ?? 0} categories.
        </p>
      </div>
      <div>
        <SignOutButton />
      </div>
    </main>
  );
}
