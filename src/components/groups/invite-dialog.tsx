"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Loader2, UserPlus } from "lucide-react";

import { getInviteLink, type InviteLinkResult } from "@/app/(app)/groups/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function InviteDialog({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [result, setResult] = useState<InviteLinkResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, startLoading] = useTransition();

  function onOpenChange(open: boolean) {
    if (!open) return;
    setCopied(false);
    startLoading(async () => setResult(await getInviteLink(groupId)));
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. on http). The link is still selectable in the input.
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus /> Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people to {groupName}</DialogTitle>
          <DialogDescription>
            Anyone with this link can join after signing in. Share it on WhatsApp, email or
            anywhere.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !result ? (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> Creating link…
          </div>
        ) : result.ok ? (
          <div className="grid gap-2">
            <div className="flex gap-2">
              <Input
                readOnly
                value={result.url}
                aria-label="Invite link"
                onFocus={(e) => e.currentTarget.select()}
                className="font-mono text-xs"
              />
              <Button type="button" variant="outline" onClick={() => copy(result.url)}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Expires on{" "}
              {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                new Date(result.expiresAt),
              )}
              .
            </p>
          </div>
        ) : (
          <p role="alert" className="text-destructive text-sm">
            {result.error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
