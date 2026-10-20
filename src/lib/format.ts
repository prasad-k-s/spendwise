/** Formats an amount as currency, e.g. 1250.5 → "₹1,250.50". */
export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

/** Formats a "YYYY-MM-DD" date as e.g. "Tue, 20 Oct 2026" without timezone shifts. */
export function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** Today's date as "YYYY-MM-DD" in the user's local timezone (call it in the browser). */
export function todayLocal() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
