/**
 * Returns a safe in-app path to redirect to after sign-in.
 * Only allows relative paths like "/transactions" so nobody can
 * craft a login link that sends users to another website.
 */
export function safeNextPath(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
