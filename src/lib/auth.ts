import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Returns the signed-in user and their profile, or sends them to /login.
 * Wrapped in React `cache`, so the layout and the page share one lookup per request.
 */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, currency")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
    displayName: profile?.full_name || user.email?.split("@")[0] || "there",
  };
});
