"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Category } from "@/types/database";

export function AddTransactionDialog({
  categories,
}: {
  categories: Pick<Category, "id" | "name" | "type">[];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Add transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>Record an expense or some income.</DialogDescription>
        </DialogHeader>
        {/* The form only mounts while open, so it starts fresh every time. */}
        <TransactionForm categories={categories} onSuccess={close} onCancel={close} />
      </DialogContent>
    </Dialog>
  );
}
