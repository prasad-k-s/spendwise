import { CategoryIcon } from "@/components/categories/category-icon";
import { TransactionRowActions } from "@/components/transactions/transaction-row-actions";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/validations/transaction";
import type { Category, Transaction } from "@/types/database";

export type TransactionWithCategory = Pick<
  Transaction,
  "id" | "type" | "amount" | "category_id" | "occurred_on" | "note" | "payment_method"
> & {
  category: Pick<Category, "name" | "icon" | "color"> | null;
};

const paymentLabel = Object.fromEntries(PAYMENT_METHODS.map((m) => [m.value, m.label]));

/** Groups transactions by day, keeping the newest-first order from the database. */
function groupByDate(transactions: TransactionWithCategory[]) {
  const groups = new Map<string, TransactionWithCategory[]>();
  for (const t of transactions) {
    groups.set(t.occurred_on, [...(groups.get(t.occurred_on) ?? []), t]);
  }
  return [...groups.entries()];
}

/** Columns to select from Supabase for this list. */
export const TRANSACTION_LIST_SELECT =
  "id, type, amount, category_id, occurred_on, note, payment_method, category:categories(name, icon, color)" as const;

export function TransactionList({
  transactions,
  currency,
  categories,
}: {
  transactions: TransactionWithCategory[];
  currency: string;
  /** Pass the user's categories to show Edit/Delete on each row. Leave out for a read-only list. */
  categories?: Pick<Category, "id" | "name" | "type">[];
}) {
  return (
    <div className="grid gap-6">
      {groupByDate(transactions).map(([date, items]) => (
        <section key={date} aria-label={formatDate(date)}>
          <h2 className="text-muted-foreground mb-2 text-sm font-medium">{formatDate(date)}</h2>
          <ul className="bg-card divide-y rounded-xl border">
            {items.map((t) => (
              <li key={t.id} className={cn("flex items-center gap-3 py-3 pl-4", categories ? "pr-2" : "pr-4")}>
                <CategoryIcon icon={t.category?.icon} color={t.category?.color} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.category?.name ?? "Uncategorized"}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    {[t.note, paymentLabel[t.payment_method]].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 font-semibold tabular-nums",
                    t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                  )}
                >
                  {t.type === "income" ? "+" : "−"}
                  {formatCurrency(t.amount, currency)}
                </p>
                {categories && (
                  <TransactionRowActions
                    transaction={t}
                    label={t.category?.name ?? "Uncategorized"}
                    currency={currency}
                    categories={categories}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
