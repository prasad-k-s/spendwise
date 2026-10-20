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

/** The app's timezone, used on the server to decide what "this month" means. */
export const APP_TIMEZONE = "Asia/Kolkata";

/**
 * First day of the current month and first day of next month, as "YYYY-MM-DD",
 * in the app's timezone. Use as: occurred_on >= start AND occurred_on < end.
 */
export function currentMonthRange(timeZone = APP_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" })
    .formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")!.value);
  const month = Number(parts.find((p) => p.type === "month")!.value); // 1–12

  const pad = (n: number) => String(n).padStart(2, "0");
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  return {
    start: `${year}-${pad(month)}-01`,
    end: `${nextYear}-${pad(nextMonth)}-01`,
    label: new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone }).format(
      new Date(),
    ),
  };
}
