import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { LinkPending } from "@/components/link-pending";
import { Button } from "@/components/ui/button";
import {
  transactionsHref,
  type TransactionFilters,
} from "@/lib/validations/transaction-filters";

export function TransactionsPagination({
  filters,
  totalPages,
}: {
  filters: TransactionFilters;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const { page } = filters;

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      {page > 1 ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={transactionsHref(filters, page - 1)}>
            <ChevronLeft /> Previous <LinkPending />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft /> Previous
        </Button>
      )}

      <p className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={transactionsHref(filters, page + 1)}>
            <LinkPending /> Next <ChevronRight />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next <ChevronRight />
        </Button>
      )}
    </nav>
  );
}
