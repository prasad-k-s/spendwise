"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Put inside a <Link>. Shows a small spinner from the moment the link is clicked
 * until the new page starts showing, so slow navigations feel responsive.
 */
export function LinkPending({ className }: { className?: string }) {
  const { pending } = useLinkStatus();
  return (
    <Loader2
      aria-hidden="true"
      className={cn(
        "size-4 animate-spin transition-opacity",
        pending ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
