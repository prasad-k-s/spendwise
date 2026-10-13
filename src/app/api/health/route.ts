import { NextResponse } from "next/server";

import { getSupabaseEnv } from "@/lib/supabase/env";

// Never cache: this should check the connection every time it's called.
export const dynamic = "force-dynamic";

/** GET /api/health: checks that the app can reach Supabase with the configured URL and key. */
export async function GET() {
  try {
    const { url, publishableKey } = getSupabaseEnv();
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, supabase: `Supabase responded with ${res.status}. Check your URL and key.` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, supabase: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, supabase: message }, { status: 500 });
  }
}
