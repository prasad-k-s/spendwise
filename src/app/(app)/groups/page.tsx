import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { LinkPending } from "@/components/link-pending";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Groups · SpendWise" };

export default async function GroupsPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // My memberships, with each group's details and member count. RLS limits this to my groups.
  const { data: memberships, error } = await supabase
    .from("group_members")
    .select("role, group:groups(id, name, created_at, group_members(count))")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  if (error) console.error("Loading groups failed:", error);

  const groups = (memberships ?? []).flatMap((m) =>
    m.group
      ? [{ ...m.group, role: m.role, memberCount: m.group.group_members[0]?.count ?? 1 }]
      : [],
  );

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Groups</h1>
          <p className="text-muted-foreground">Share and split expenses with other people.</p>
        </div>
        <CreateGroupDialog />
      </div>

      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your groups. Please refresh the page.
        </p>
      ) : groups.length > 0 ? (
        <ul className="bg-card divide-y rounded-xl border">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/groups/${g.id}`}
                className="hover:bg-accent/50 flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                  <Users className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{g.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {g.memberCount} {g.memberCount === 1 ? "member" : "members"}
                    {g.role === "owner" && " · You're the owner"}
                  </p>
                </div>
                <LinkPending />
                <ChevronRight className="text-muted-foreground size-4" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <Users className="size-5" />
          </span>
          <div>
            <p className="font-medium">No groups yet</p>
            <p className="text-muted-foreground text-sm">
              Create one for your flat, a trip or family, then invite people with a link.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
