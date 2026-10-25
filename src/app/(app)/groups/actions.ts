"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { groupNameSchema } from "@/lib/validations/group";

export type CreateGroupState = {
  error?: string;
  fieldErrors?: { name?: string[] };
  values?: { name?: string };
};

export type InviteLinkResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

const idSchema = z.uuid();

export async function createGroup(
  _prev: CreateGroupState,
  formData: FormData,
): Promise<CreateGroupState> {
  const name = String(formData.get("name") ?? "");
  const parsed = groupNameSchema.safeParse(name);
  if (!parsed.success) {
    return { fieldErrors: { name: z.flattenError(parsed.error).formErrors }, values: { name } };
  }

  const supabase = await createClient();
  // create_group() makes the group and adds you as its owner in one step.
  const { data: groupId, error } = await supabase.rpc("create_group", { p_name: parsed.data });

  if (error || !groupId) {
    console.error("createGroup failed:", error);
    return { error: "Couldn't create the group. Please try again.", values: { name } };
  }

  revalidatePath("/groups");
  redirect(`/groups/${groupId}`);
}

/**
 * Returns an invite link for the group, reusing the newest active one if there is one.
 * Only owners can do this (the database's RLS policies enforce it).
 */
export async function getInviteLink(groupId: string): Promise<InviteLinkResult> {
  if (!idSchema.safeParse(groupId).success) return { ok: false, error: "Group not found." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { data: existing } = await supabase
    .from("group_invites")
    .select("token, expires_at")
    .eq("group_id", groupId)
    .is("revoked_at", null)
    .gt("expires_at", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()) // ≥1 day left
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let invite = existing;
  if (!invite) {
    const { data, error } = await supabase
      .from("group_invites")
      .insert({ group_id: groupId })
      .select("token, expires_at")
      .single();

    if (error || !data) {
      console.error("getInviteLink failed:", error);
      return { ok: false, error: "Only group owners can invite people." };
    }
    invite = data;
  }

  return { ok: true, url: `${origin}/invite/${invite.token}`, expiresAt: invite.expires_at };
}

export async function acceptInvite(token: string) {
  const supabase = await createClient();
  const { data: groupId, error } = await supabase.rpc("accept_group_invite", { p_token: token });

  if (error || !groupId) {
    redirect(`/invite/${encodeURIComponent(token)}?error=invalid`);
  }

  revalidatePath("/groups");
  redirect(`/groups/${groupId}`);
}
