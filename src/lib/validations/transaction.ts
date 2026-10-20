import { z } from "zod";

import type { PaymentMethod } from "@/types/database";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
];

const paymentMethodValues = ["cash", "upi", "card", "bank_transfer", "other"] as const;

/** Validates the add/edit transaction form (all values arrive as strings from FormData). */
export const transactionSchema = z.object({
  type: z.enum(["expense", "income"], "Choose expense or income"),
  amount: z
    .string()
    .trim()
    .transform((value) => value.replace(/,/g, ""))
    .refine((value) => value !== "", "Enter an amount")
    .refine(
      (value) => /^\d{1,10}(\.\d{1,2})?$/.test(value),
      "Enter a valid amount, like 250 or 99.50",
    )
    .transform(Number)
    .refine((value) => value > 0, "Amount must be more than 0"),
  categoryId: z.uuid("Choose a category"),
  occurredOn: z.iso.date("Pick a valid date"),
  paymentMethod: z.enum(paymentMethodValues, "Choose a payment method"),
  note: z.string().trim().max(200, "Keep the note under 200 characters"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type TransactionField = keyof TransactionInput;
