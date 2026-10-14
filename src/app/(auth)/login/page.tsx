import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Log in · SpendWise" };

const notices: Record<string, string> = {
  confirm_failed: "That confirmation link is invalid or has expired. Try logging in or sign up again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <LoginForm
      next={next ? safeNextPath(next) : undefined}
      notice={error ? notices[error] : undefined}
    />
  );
}
