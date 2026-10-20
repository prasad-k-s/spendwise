import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Wallet } from "lucide-react";

import { LinkPending } from "@/components/link-pending";
import {
  TRANSACTION_LIST_SELECT,
  TransactionList,
} from "@/components/transactions/transaction-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { currentMonthRange, formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard · SpendWise" };

export default async function DashboardPage() {
  const { displayName, profile } = await requireUser();
  const currency = profile?.currency ?? "INR";
  const month = currentMonthRange();
  const supabase = await createClient();

  // RLS means both queries only ever see the signed-in user's rows.
  const [{ data: monthRows, error: monthError }, { data: recent, error: recentError }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("type, amount")
        .gte("occurred_on", month.start)
        .lt("occurred_on", month.end),
      supabase
        .from("transactions")
        .select(TRANSACTION_LIST_SELECT)
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  if (monthError) console.error("Loading monthly totals failed:", monthError);
  if (recentError) console.error("Loading recent transactions failed:", recentError);

  const spent = (monthRows ?? []).filter((r) => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
  const income = (monthRows ?? []).filter((r) => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
  const net = income - spent;

  const stats = [
    { label: "Spent", value: spent, icon: ArrowDownRight, className: "" },
    { label: "Income", value: income, icon: ArrowUpRight, className: "text-emerald-600 dark:text-emerald-400" },
    {
      label: "Left over",
      value: net,
      icon: Wallet,
      className: net < 0 ? "text-destructive" : "",
    },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hi {displayName} 👋</h1>
        <p className="text-muted-foreground">Here&apos;s your money for {month.label}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, className }) => (
          <Card key={label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardDescription>{label} this month</CardDescription>
              <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-semibold tabular-nums", className)}>
                {monthError ? "—" : formatCurrency(value, currency)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="grid gap-1.5">
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>Your latest 5 income and expenses.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/transactions">
              View all <ArrowRight />
              <LinkPending className="-ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentError ? (
            <p className="text-destructive text-sm">Couldn&apos;t load your transactions. Please refresh the page.</p>
          ) : recent && recent.length > 0 ? (
            <TransactionList transactions={recent} currency={currency} />
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
              No transactions yet.{" "}
              <Link href="/transactions" className="text-foreground font-medium underline-offset-4 hover:underline">
                Add your first one
              </Link>
              .
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
