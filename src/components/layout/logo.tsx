import Link from "next/link";
import { Wallet } from "lucide-react";

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold">
      <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
        <Wallet className="size-4" />
      </span>
      SpendWise
    </Link>
  );
}
