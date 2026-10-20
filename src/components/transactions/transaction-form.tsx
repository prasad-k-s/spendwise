"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { createTransaction, type TransactionFormState } from "@/app/(app)/transactions/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { todayLocal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/validations/transaction";
import type { Category, CategoryType } from "@/types/database";

const initialState: TransactionFormState = {};

type Props = {
  categories: Pick<Category, "id" | "name" | "type">[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TransactionForm({ categories, onSuccess, onCancel }: Props) {
  const [state, formAction, isPending] = useActionState(createTransaction, initialState);
  const [type, setType] = useState<CategoryType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [today] = useState(todayLocal);

  const errors = state.fieldErrors;
  const values = state.values;
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
          Save {type}
        </Button>
      </div>
    </form>
  );
}
