import { TransactionListSkeleton } from "@/components/transactions/transaction-list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6" role="status" aria-label="Loading transactions">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <TransactionListSkeleton groups={2} rows={4} />
    </div>
  );
}
