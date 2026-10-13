import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-2xl">
        <Wallet className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">SpendWise</h1>
        <p className="text-muted-foreground max-w-md text-base sm:text-lg">
          Track your spending and split shared expenses with the people you live, travel and work
          with.
        </p>
      </div>
      <div className="flex gap-3">
        <Button size="lg">Get started</Button>
        <Button size="lg" variant="outline">
          Learn more
        </Button>
      </div>
    </main>
  );
}
