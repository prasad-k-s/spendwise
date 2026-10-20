"use client";

import { useCallback, useState, useTransition } from "react";
import { Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { deleteTransaction } from "@/app/(app)/transactions/actions";
import {
  TransactionForm,
  type EditableTransaction,
} from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/format";
import type { Category } from "@/types/database";

type Props = {
  transaction: EditableTransaction;
  /** Shown in the delete confirmation, e.g. "Food & Dining". */
  label: string;
  currency: string;
  categories: Pick<Category, "id" | "name" | "type">[];
};

/** The ⋮ menu on each transaction row, with Edit and Delete. */
export function TransactionRowActions({ transaction, label, currency, categories }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const closeEdit = useCallback(() => setEditOpen(false), []);

  function confirmDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteTransaction(transaction.id);
      if (result.ok) setDeleteOpen(false);
      else setDeleteError(result.error);
    });
  }

  return (
    <>
      {/* modal={false} so the menu doesn't fight the dialogs it opens over focus */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${label}`}>
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
          >
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
            <DialogDescription>Change the details and save.</DialogDescription>
          </DialogHeader>
          <TransactionForm
            categories={categories}
            transaction={transaction}
            onSuccess={closeEdit}
            onCancel={closeEdit}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(open) => !isDeleting && setDeleteOpen(open)}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this transaction?</DialogTitle>
            <DialogDescription>
              {label} · {transaction.type === "income" ? "+" : "−"}
              {formatCurrency(transaction.amount, currency)}. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="text-destructive text-sm">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
