import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted/40 flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
          <Wallet className="size-4" />
        </span>
        SpendWise
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
