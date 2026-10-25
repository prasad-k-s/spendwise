import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LinkIcon, Users } from "lucide-react";

import { acceptInvite } from "@/app/(app)/groups/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Join group · SpendWise" };

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ token }, { error }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  // Returns nothing for a bad, expired or cancelled link.
  const { data } = await supabase.rpc("get_invite_preview", { p_token: token });
  const invite = data?.[0];

  if (invite?.already_member) redirect(`/groups/${invite.group_id}`);

  return (
    <div className="mx-auto grid max-w-md gap-6 pt-6 sm:pt-12">
      {invite && !error ? (
        <Card className="text-center">
          <CardHeader>
            <span className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
              <Users className="size-6" />
            </span>
            <CardTitle className="text-2xl">Join {invite.group_name}</CardTitle>
            <CardDescription>
              You&apos;ve been invited to share expenses in this group ({invite.member_count}{" "}
              {invite.member_count === 1 ? "member" : "members"}).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <form action={acceptInvite.bind(null, token)}>
              <Button type="submit" className="w-full">
                Join group
              </Button>
            </form>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Not now</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
          <CardHeader>
            <span className="bg-muted text-muted-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
              <LinkIcon className="size-6" />
            </span>
            <CardTitle className="text-2xl">This invite link doesn&apos;t work</CardTitle>
            <CardDescription>
              It may have expired or been cancelled. Ask the group owner for a new link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/groups">Go to your groups</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
