import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder rows shaped like TransactionList, shown while it loads. */
export function TransactionListSkeleton({ groups = 2, rows = 3 }: { groups?: number; rows?: number }) {
  return (
    <div className="grid gap-6" aria-hidden="true">
      {Array.from({ length: groups }, (_, g) => (
        <div key={g}>
          <Skeleton className="mb-2 h-4 w-32" />
          <div className="divide-y rounded-xl border">
            {Array.from({ length: rows }, (_, r) => (
              <div key={r} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48 max-w-full" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
