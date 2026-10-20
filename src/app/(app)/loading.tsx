import { Skeleton } from "@/components/ui/skeleton";

/** Fallback for any signed-in page that doesn't have its own loading.tsx. */
export default function AppLoading() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6" role="status" aria-label="Loading">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
