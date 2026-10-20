import type { Metadata } from "next";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

<<<<<<< Updated upstream
=======
import {
  TRANSACTION_LIST_SELECT,
  TransactionList,
} from "@/components/transactions/transaction-list";
import { Button } from "@/components/ui/button";
>>>>>>> Stashed changes
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard · SpendWise" };

const stats = [
  { label: "Spent this month", icon: ArrowDownRight },
  { label: "Income this month", icon: ArrowUpRight },
  { label: "Balance", icon: Wallet },
];

export default async function DashboardPage() {
  const { displayName, profile } = await requireUser();
  const currency = profile?.currency ?? "INR";
<<<<<<< Updated upstream
  const zero = new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(0);
=======
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
>>>>>>> Stashed changes

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Hi {displayName} 👋</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your money.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, icon: Icon }) => (
          <Card key={label} className="gap-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardDescription>{label}</CardDescription>
              <Icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{zero}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>Your latest income and expenses will show up here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
            No transactions yet. Add one from the Transactions page.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
