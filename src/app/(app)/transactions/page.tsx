import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, SearchX } from "lucide-react";

import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import {
  TRANSACTION_LIST_SELECT,
  TransactionList,
} from "@/components/transactions/transaction-list";
import { TransactionsPagination } from "@/components/transactions/transactions-pagination";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  escapeLike,
  hasActiveFilters,
  PAGE_SIZE,
  parseTransactionFilters,
  transactionsHref,
  type TransactionFilters as Filters,
} from "@/lib/validations/transaction-filters";

export const metadata: Metadata = { title: "Transactions · SpendWise" };

/** The query-builder methods we filter with (shared by the list and totals queries). */
type Filterable<T> = {
  eq(column: string, value: string): T;
  gte(column: string, value: string): T;
  lte(column: string, value: string): T;
  ilike(column: string, pattern: string): T;
};

function applyFilters<T extends Filterable<T>>(query: T, f: Filters): T {
  let q = query;
  if (f.type) q = q.eq("type", f.type);
  if (f.category) q = q.eq("category_id", f.category);
  if (f.from) q = q.gte("occurred_on", f.from);
  if (f.to) q = q.lte("occurred_on", f.to);
  if (f.q) q = q.ilike("note", `%${escapeLike(f.q)}%`);
  return q;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseTransactionFilters(await searchParams);
  const active = hasActiveFilters(filters);
  const { profile } = await requireUser();
  const currency = profile?.currency ?? "INR";
  const supabase = await createClient();

  const fromRow = (filters.page - 1) * PAGE_SIZE;

  // RLS means these only ever return the signed-in user's rows.
  const [{ data: categories }, list, totals] = await Promise.all([
    supabase.from("categories").select("id, name, type").order("name"),
    applyFilters(supabase.from("transactions").select(TRANSACTION_LIST_SELECT, { count: "exact" }), filters)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .range(fromRow, fromRow + PAGE_SIZE - 1),
    // Totals for everything matching the filters (all pages). Fine at personal-app scale;
    // later this can move into a Postgres function that sums in the database.
    applyFilters(supabase.from("transactions").select("type, amount"), filters),
  ]);

  // PGRST103 = asked for a page past the end (e.g. after deleting rows). Not a real error.
  const pageOutOfRange = list.error?.code === "PGRST103";
  const loadError = (list.error && !pageOutOfRange) || totals.error;
  if (loadError) console.error("Loading transactions failed:", list.error ?? totals.error);

  const transactions = pageOutOfRange ? [] : (list.data ?? []);
  const total = list.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const spent = (totals.data ?? []).filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const income = (totals.data ?? []).filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
          <p className="text-muted-foreground">Search, filter and manage your income and expenses.</p>
        </div>
        <AddTransactionDialog categories={categories ?? []} />
      </div>

      {/* key: re-mount the form when the URL changes (e.g. "Clear filters") so inputs reset */}
      <TransactionFilters
        key={transactionsHref(filters)}
        filters={filters}
        categories={categories ?? []}
        active={active}
      />

      {loadError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your transactions. Please refresh the page.
        </p>
      ) : transactions.length > 0 ? (
        <>
          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
            <p>
              Showing {fromRow + 1}–{fromRow + transactions.length} of {total}
            </p>
            <p className="tabular-nums">
              Spent <span className="text-foreground font-medium">{formatCurrency(spent, currency)}</span>
              {" · "}
              Income{" "}
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(income, currency)}
              </span>
            </p>
          </div>
          <TransactionList transactions={transactions} currency={currency} categories={categories ?? []} />
          <TransactionsPagination filters={filters} totalPages={totalPages} />
        </>
      ) : pageOutOfRange || active ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <SearchX className="size-5" />
          </span>
          <div>
            <p className="font-medium">
              {pageOutOfRange ? "This page is empty" : "No transactions match these filters"}
            </p>
            <p className="text-muted-foreground text-sm">
              {pageOutOfRange ? "Go back to the first page." : "Try a different search or clear the filters."}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={pageOutOfRange ? transactionsHref(filters, 1) : "/transactions"}>
              {pageOutOfRange ? "First page" : "Clear filters"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <ArrowLeftRight className="size-5" />
          </span>
          <div>
            <p className="font-medium">No transactions yet</p>
            <p className="text-muted-foreground text-sm">Add your first expense or income to get started.</p>
          </div>
        </div>
      )}
    </div>
  );
}
