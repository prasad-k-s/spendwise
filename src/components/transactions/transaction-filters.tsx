"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { TransactionFilters as Filters } from "@/lib/validations/transaction-filters";
import type { Category } from "@/types/database";

type Props = {
  filters: Filters;
  categories: Pick<Category, "id" | "name" | "type">[];
  active: boolean;
};

/**
 * Filter bar. Uses next/form, so "Apply" updates the URL (?q=…&type=…) with a
 * client-side navigation; the server page reads the URL and runs the query.
 * Submitting leaves out "page", so results start again from page 1.
 */
export function TransactionFilters({ filters, categories, active }: Props) {
  const [type, setType] = useState(filters.type ?? "");
  const groups = (["expense", "income"] as const).filter((t) => !type || t === type);

  return (
    <Form action="/transactions" className="bg-card grid gap-4 rounded-xl border p-4">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          name="q"
          type="search"
          placeholder="Search notes…"
          defaultValue={filters.q}
          aria-label="Search notes"
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="filter-type">Type</Label>
          <NativeSelect
            id="filter-type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
          >
            <option value="">All</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </NativeSelect>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="filter-category">Category</Label>
          <NativeSelect id="filter-category" name="category" defaultValue={filters.category ?? ""}>
            <option value="">All</option>
            {groups.map((group) => (
              <optgroup key={group} label={group === "expense" ? "Expenses" : "Income"}>
                {categories
                  .filter((c) => c.type === group)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </NativeSelect>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="filter-from">From</Label>
          <Input id="filter-from" name="from" type="date" defaultValue={filters.from} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="filter-to">To</Label>
          <Input id="filter-to" name="to" type="date" defaultValue={filters.to} />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {active && (
          <Button variant="ghost" asChild>
            <Link href="/transactions">
              <X /> Clear filters
            </Link>
          </Button>
        )}
        <Button type="submit">Apply</Button>
      </div>
    </Form>
  );
}
