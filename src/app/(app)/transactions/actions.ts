"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  transactionSchema,
  type TransactionField,
  type TransactionInput,
} from "@/lib/validations/transaction";

export type TransactionFormState = {
  ok?: boolean;
  /** A message for the whole form. */
  error?: string;
  fieldErrors?: Partial<Record<TransactionField, string[]>>;
  /** What the user typed, so the form keeps it after an error. */
  values?: Partial<Record<TransactionField, string>>;
};

export type DeleteResult = { ok: true } | { ok: false; error: string };

const idSchema = z.uuid();

/** Reads and validates the transaction form. */
function parseForm(formData: FormData) {
  const values = {
    type: String(formData.get("type") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    occurredOn: String(formData.get("occurredOn") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
  return { values, parsed: transactionSchema.safeParse(values) };
}

/** Maps validated form data to database column names. */
function toRow(data: TransactionInput) {
  return {
    type: data.type,
    amount: data.amount,
    category_id: data.categoryId,
    occurred_on: data.occurredOn,
    payment_method: data.paymentMethod,
    note: data.note || null,
  };
}

/** Turns a database error into a form error. */
function dbErrorToState(
  error: { code?: string },
  values: TransactionFormState["values"],
  action: string,
): TransactionFormState {
  // 23514 = our database check: the category isn't yours or doesn't match the type.
  if (error.code === "23514") {
    return { fieldErrors: { categoryId: ["Choose a category that matches the type"] }, values };
  }
  console.error(`${action} failed:`, error);
  return { error: "Couldn't save the transaction. Please try again.", values };
}

function refreshPages() {
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

export async function createTransaction(
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  const { values, parsed } = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  // user_id is filled in by the database (default auth.uid()), and RLS makes sure it's yours.
  const { error } = await supabase.from("transactions").insert(toRow(parsed.data));
  if (error) return dbErrorToState(error, values, "createTransaction");

  refreshPages();
  return { ok: true };
}

/** Use with .bind(null, id) so the form action receives the transaction id. */
export async function updateTransaction(
  id: string,
  _prev: TransactionFormState,
  formData: FormData,
): Promise<TransactionFormState> {
  if (!idSchema.safeParse(id).success) return { error: "This transaction no longer exists." };

  const { values, parsed } = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .update(toRow(parsed.data))
    .eq("id", id)
    .select("id");
  if (error) return dbErrorToState(error, values, "updateTransaction");
  // RLS hides other users' rows, so "0 rows updated" means not found (or not yours).
  if (!data?.length) return { error: "This transaction no longer exists.", values };

  refreshPages();
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<DeleteResult> {
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Transaction not found." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("transactions").delete().eq("id", id).select("id");

  if (error) {
    console.error("deleteTransaction failed:", error);
    return { ok: false, error: "Couldn't delete the transaction. Please try again." };
  }
  if (!data?.length) return { ok: false, error: "This transaction was already deleted." };

  refreshPages();
  return { ok: true };
}
