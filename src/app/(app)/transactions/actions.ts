"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { transactionSchema, type TransactionField } from "@/lib/validations/transaction";

export type TransactionFormState = {
  ok?: boolean;
  /** A message for the whole form. */
  error?: string;
  fieldErrors?: Partial<Record<TransactionField, string[]>>;
  /** What the user typed, so the form keeps it after an error. */
  values?: Partial<Record<TransactionField, string>>;
};

export async function createTransaction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const values = {
    type: String(formData.get("type") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    occurredOn: String(formData.get("occurredOn") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
    note: String(formData.get("note") ?? ""),
  };

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { type, amount, categoryId, occurredOn, paymentMethod, note } = parsed.data;
  const supabase = await createClient();

  // user_id is filled in by the database (default auth.uid()), and RLS makes sure it's yours.
  const { error } = await supabase.from("transactions").insert({
    type,
    amount,
    category_id: categoryId,
    occurred_on: occurredOn,
    payment_method: paymentMethod,
    note: note || null,
  });

  if (error) {
    // 23514 = our database check: the category isn't yours or doesn't match the type.
    if (error.code === "23514") {
      return {
        fieldErrors: { categoryId: ["Choose a category that matches the type"] },
        values,
      };
    }
    console.error("createTransaction failed:", error);
    return { error: "Couldn't save the transaction. Please try again.", values };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { ok: true };
}
