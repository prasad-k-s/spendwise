"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { safeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

import { loginSchema, signupSchema } from "@/lib/validations/auth";

export type AuthFormState = {
  /** A message for the whole form, e.g. "Invalid email or password". */
  error?: string;
  /** A success message, e.g. "Check your email". */
  message?: string;
  /** Validation errors per field. */
  fieldErrors?: Partial<Record<"fullName" | "email" | "password", string[]>>;
  /** What the user typed (minus the password), so the form keeps it after an error. */
  values?: { fullName?: string; email?: string };
};

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const values = { email: raw.email };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Please confirm your email first. Check your inbox for the link.", values };
    }
    return { error: "Invalid email or password.", values };
  }

  revalidatePath("/", "layout");
  redirect(safeNextPath(formData.get("next")));
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
  const values = { fullName: raw.fullName, email: raw.email };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Saved in raw_user_meta_data; the sign-up trigger copies it into profiles.full_name.
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "An account with this email already exists. Try logging in.", values };
    }
    if (error.code === "over_email_send_rate_limit") {
      return { error: "Too many sign-up emails sent. Please try again in a while.", values };
    }
    return { error: error.message, values };
  }

  // "Confirm email" turned off in Supabase → the user is signed in right away.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    message: `We sent a confirmation link to ${parsed.data.email}. Click it to finish signing up.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
