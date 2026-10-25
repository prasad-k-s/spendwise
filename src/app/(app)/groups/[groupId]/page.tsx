import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Receipt } from "lucide-react";
import { z } from "zod";

import { InviteDialog } from "@/components/groups/invite-dialog";
import { MemberAvatar } from "@/components/groups/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Group · SpendWise" };

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  if (!z.uuid().safeParse(groupId).success) notFound();

  const { user } = await requireUser();
  const supabase = await createClient();

  // RLS: both return nothing unless you're a member of this group.
  const [{ data: group }, { data: members, error: membersError }] = await Promise.all([
    supabase.from("groups").select("id, name, created_at").eq("id", groupId).maybeSingle(),
    supabase
      .from("group_members")
      .select("user_id, role, joined_at, profile:profiles(full_name)")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true }),
  ]);

  if (!group) notFound();
  if (membersError) console.error("Loading group members failed:", membersError);

  const isOwner = members?.some((m) => m.user_id === user.id && m.role === "owner") ?? false;

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="grid gap-4">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/groups">
            <ArrowLeft /> All groups
          </Link>
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{group.name}</h1>
            <p className="text-muted-foreground">
              {members?.length ?? 0} {members?.length === 1 ? "member" : "members"}
            </p>
          </div>
          {isOwner && <InviteDialog groupId={group.id} groupName={group.name} />}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {isOwner
              ? "Invite people with a link. They join after signing in."
              : "Only owners can invite new people."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {(members ?? []).map((m) => {
              const name = m.profile?.full_name || "Member";
              const isYou = m.user_id === user.id;
              return (
                <li key={m.user_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <MemberAvatar name={name} />
                  <p className="min-w-0 flex-1 truncate font-medium">
                    {name}
                    {isYou && <span className="text-muted-foreground font-normal"> (you)</span>}
                  </p>
                  {m.role === "owner" && (
                    <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs font-medium">
                      Owner
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared expenses</CardTitle>
          <CardDescription>Add an expense and split it between members.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center text-sm">
            <Receipt className="size-5" />
            Splitting expenses is coming in the next step.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
