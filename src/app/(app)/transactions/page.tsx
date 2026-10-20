import type { Metadata } from "next";
import { ArrowLeftRight } from "lucide-react";

import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionList } from "@/components/transactions/transaction-list";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Transactions · SpendWise" };

export default async function TransactionsPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  // RLS means these only ever return the signed-in user's rows.
  const [{ data: categories }, { data: transactions, error }] = await Promise.all([
    supabase.from("categories").select("id, name, type").order("name"),
    supabase
      .from("transactions")
      .select("id, type, amount, occurred_on, note, payment_method, category:categories(name, icon, color)")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (error) console.error("Loading transactions failed:", error);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
          <p className="text-muted-foreground">Your latest income and expenses.</p>
        </div>
        <AddTransactionDialog categories={categories ?? []} />
      </div>

      {error ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your transactions. Please refresh the page.
        </p>
      ) : transactions && transactions.length > 0 ? (
        <TransactionList transactions={transactions} currency={profile?.currency ?? "INR"} />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <ArrowLeftRight className="size-5" />
          </span>
          <div>
            <p className="font-medium">No transactions yet</p>
            <p className="text-muted-foreground text-sm">
              Add your first expense or income to get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
