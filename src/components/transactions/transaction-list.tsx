import { CategoryIcon } from "@/components/categories/category-icon";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/validations/transaction";
import type { Category, Transaction } from "@/types/database";

export type TransactionWithCategory = Pick<
  Transaction,
  "id" | "type" | "amount" | "occurred_on" | "note" | "payment_method"
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

export function TransactionList({
  transactions,
  currency,
}: {
  transactions: TransactionWithCategory[];
  currency: string;
}) {
  return (
    <div className="grid gap-6">
      {groupByDate(transactions).map(([date, items]) => (
        <section key={date} aria-label={formatDate(date)}>
          <h2 className="text-muted-foreground mb-2 text-sm font-medium">{formatDate(date)}</h2>
          <ul className="bg-card divide-y rounded-xl border">
            {items.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
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
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
