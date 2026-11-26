"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_NAMES } from "@/lib/constants";

type Props = {
  initialSearch?: string;
  initialCategory?: string;
  initialLocation?: string;
  initialSort?: string;
};

export function ServiceFilters({
  initialSearch = "",
  initialCategory = "",
  initialLocation = "",
  initialSort = "newest",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory || "all");
  const [sort, setSort] = useState(initialSort || "newest");

  const hasFilters = Boolean(search || location || category !== "all" || sort !== "newest");

  const apply = (overrides: Record<string, string | undefined> = {}) => {
    const values = {
      search,
      location,
      category: category === "all" ? "" : category,
      sort,
      ...overrides,
    };
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value && !(key === "sort" && value === "newest")) params.set(key, value);
    });
    startTransition(() => {
      router.push(params.size ? `/services?${params.toString()}` : "/services");
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <form
        className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          apply();
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by service name…"
            className="h-10 pl-9"
            aria-label="Search services"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="City or region"
            className="h-10 pl-9"
            aria-label="Filter by location"
          />
        </div>

        <Select
          value={category}
          onValueChange={(value) => {
            const next = String(value);
            setCategory(next);
            apply({ category: next === "all" ? "" : next });
          }}
        >
          <SelectTrigger className="h-10 w-full">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORY_NAMES.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" className="h-10" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Search />}
          Search
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sort by
          </span>
          <Select
            value={sort}
            onValueChange={(value) => {
              const next = String(value);
              setSort(next);
              apply({ sort: next });
            }}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="price_asc">Price: low to high</SelectItem>
              <SelectItem value="price_desc">Price: high to low</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
            </SelectContent>
          </Select>
          {pending && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" /> Updating results
            </span>
          )}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setLocation("");
              setCategory("all");
              setSort("newest");
              startTransition(() => router.push("/services"));
            }}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
