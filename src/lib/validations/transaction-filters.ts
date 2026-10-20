import { z } from "zod";

export const PAGE_SIZE = 20;

export type TransactionFilters = {
  q?: string;
  type?: "expense" | "income";
  category?: string;
  from?: string;
  to?: string;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

/**
 * Reads filters from the URL (?q=&type=&category=&from=&to=&page=).
 * Anything invalid is ignored instead of erroring, so a hand-edited URL still works.
 */
export function parseTransactionFilters(params: SearchParams): TransactionFilters {
  const q = first(params.q)?.slice(0, 100);
  const type = z.enum(["expense", "income"]).safeParse(first(params.type)).data;
  const category = z.uuid().safeParse(first(params.category)).data;
  let from = z.iso.date().safeParse(first(params.from)).data;
  let to = z.iso.date().safeParse(first(params.to)).data;
  const page = z.coerce.number().int().min(1).max(10_000).safeParse(first(params.page)).data ?? 1;

  // Dates entered the wrong way round? Swap them.
  if (from && to && from > to) [from, to] = [to, from];

  return { q, type, category, from, to, page };
}

/** True when any filter (not just the page) is set. */
export function hasActiveFilters(f: TransactionFilters) {
  return Boolean(f.q || f.type || f.category || f.from || f.to);
}

/** Builds a /transactions URL for these filters, e.g. for pagination links. */
export function transactionsHref(f: TransactionFilters, page = f.page) {
  const params = new URLSearchParams();
  if (f.q) params.set("q", f.q);
  if (f.type) params.set("type", f.type);
  if (f.category) params.set("category", f.category);
  if (f.from) params.set("from", f.from);
  if (f.to) params.set("to", f.to);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

/** Escapes % and _ so a search for "50%" matches literally in ILIKE. */
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
