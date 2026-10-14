"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";

import { signup, type AuthFormState } from "@/app/(auth)/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const errors = state.fieldErrors;

  if (state.message) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <MailCheck className="size-6" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>{state.message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login" className="text-sm font-medium underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start tracking your spending in minutes</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-5" noValidate>
          {state.error && (
            <p
              role="alert"
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
            >
              {state.error}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder="Prasad K S"
              defaultValue={state.values?.fullName}
              aria-invalid={!!errors?.fullName}
              aria-describedby={errors?.fullName ? "fullName-error" : undefined}
              required
            />
            <FieldError id="fullName-error" errors={errors?.fullName} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              defaultValue={state.values?.email}
              aria-invalid={!!errors?.email}
              aria-describedby={errors?.email ? "email-error" : undefined}
              required
            />
            <FieldError id="email-error" errors={errors?.email} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors?.password}
              aria-describedby={errors?.password ? "password-error" : "password-hint"}
              required
            />
            {errors?.password ? (
              <FieldError id="password-error" errors={errors.password} />
            ) : (
              <p id="password-hint" className="text-muted-foreground text-sm">
                At least 8 characters.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Create account
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
