"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  createTransaction,
  updateTransaction,
  type TransactionFormState,
} from "@/app/(app)/transactions/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { todayLocal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/validations/transaction";
import type { Category, CategoryType, Transaction } from "@/types/database";

const initialState: TransactionFormState = {};

export type EditableTransaction = Pick<
  Transaction,
  "id" | "type" | "amount" | "category_id" | "occurred_on" | "payment_method" | "note"
>;

type Props = {
  categories: Pick<Category, "id" | "name" | "type">[];
  /** Pass a transaction to edit it; leave out to add a new one. */
  transaction?: EditableTransaction;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TransactionForm({ categories, transaction, onSuccess, onCancel }: Props) {
  const action = transaction ? updateTransaction.bind(null, transaction.id) : createTransaction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [type, setType] = useState<CategoryType>(transaction?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [today] = useState(todayLocal);

  const errors = state.fieldErrors;
  // After an error, show what the user typed; otherwise start from the transaction being edited.
  const values = state.values ?? {
    amount: transaction ? String(transaction.amount) : undefined,
    occurredOn: transaction?.occurred_on,
    paymentMethod: transaction?.payment_method,
    note: transaction?.note ?? undefined,
  };
  const options = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state, onSuccess]);

  function changeType(next: CategoryType) {
    setType(next);
    setCategoryId(""); // categories differ between expense and income
  }

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {state.error}
        </p>
      )}

      {/* Expense / income switch */}
      <fieldset className="grid gap-2">
        <legend className="sr-only">Type</legend>
        <div className="bg-muted grid grid-cols-2 gap-1 rounded-lg p-1">
          {(["expense", "income"] as const).map((option) => (
            <label
              key={option}
              className={cn(
                "has-focus-visible:ring-ring/50 cursor-pointer rounded-md py-1.5 text-center text-sm font-medium capitalize transition-colors has-focus-visible:ring-[3px]",
                type === option
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <input
                type="radio"
                name="type"
                value={option}
                checked={type === option}
                onChange={() => changeType(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          name="amount"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          defaultValue={values?.amount}
          aria-invalid={!!errors?.amount}
          aria-describedby={errors?.amount ? "amount-error" : undefined}
          className="text-lg tabular-nums"
          autoFocus
        />
        <FieldError id="amount-error" errors={errors?.amount} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="categoryId">Category</Label>
          <NativeSelect
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-invalid={!!errors?.categoryId}
            aria-describedby={errors?.categoryId ? "categoryId-error" : undefined}
          >
            <option value="" disabled>
              Choose…
            </option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
          <FieldError id="categoryId-error" errors={errors?.categoryId} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="occurredOn">Date</Label>
          <Input
            id="occurredOn"
            name="occurredOn"
            type="date"
            defaultValue={values?.occurredOn ?? today}
            aria-invalid={!!errors?.occurredOn}
            aria-describedby={errors?.occurredOn ? "occurredOn-error" : undefined}
          />
          <FieldError id="occurredOn-error" errors={errors?.occurredOn} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="paymentMethod">Paid with</Label>
        <NativeSelect
          id="paymentMethod"
          name="paymentMethod"
          defaultValue={values?.paymentMethod ?? "upi"}
          aria-invalid={!!errors?.paymentMethod}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </NativeSelect>
        <FieldError id="paymentMethod-error" errors={errors?.paymentMethod} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="note">
          Note <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="note"
          name="note"
          maxLength={200}
          placeholder="e.g. Lunch with team"
          defaultValue={values?.note}
          aria-invalid={!!errors?.note}
          aria-describedby={errors?.note ? "note-error" : undefined}
        />
        <FieldError id="note-error" errors={errors?.note} />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {transaction ? "Save changes" : `Save ${type}`}
        </Button>
      </div>
    </form>
  );
}
