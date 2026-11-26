"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, Loader2, Lock, ReceiptText, Wallet } from "lucide-react";
import { EmptyState, PageHeader, StatCard } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/constants";
import type { Transaction } from "@/lib/types";

const FILTERS = ["all", "paid", "pending", "failed", "expired", "refunded"] as const;
type Filter = (typeof FILTERS)[number];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = filter === "all" ? "" : `?status=${filter}`;
      const data = await api<{ items: Transaction[] }>(
        `/api/admin/transactions${query}`,
      );
      setTransactions(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load transactions");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        acc.count += 1;
        if (transaction.status === "paid") {
          acc.paid += 1;
          acc.revenue += transaction.amount;
        }
        if (transaction.status === "pending") acc.pending += 1;
        return acc;
      },
      { count: 0, paid: 0, pending: 0, revenue: 0 },
    );
  }, [transactions]);

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="A read-only ledger of every Stripe checkout. Payments are never changed by hand."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Checkouts in view"
          value={totals.count}
          icon={ReceiptText}
          tone="stone"
          hint="Matching the current filter"
        />
        <StatCard
          label="Paid"
          value={totals.paid}
          icon={CreditCard}
          tone="green"
          hint="Verified by Stripe webhook"
        />
        <StatCard
          label="Pending"
          value={totals.pending}
          icon={Loader2}
          tone="amber"
          hint="Checkout started, not confirmed"
        />
        <StatCard
          label="Revenue in view"
          value={formatPrice(totals.revenue)}
          icon={Wallet}
          hint="Paid subscriptions only"
        />
      </div>

      <div className="my-5 flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              filter === value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={filter === "all" ? "No transactions yet" : `No ${filter} transactions`}
          description={
            filter === "all"
              ? "When a vendor starts a Premium checkout, the Stripe session appears here. Paid status only changes after the signed webhook arrives."
              : "Try another status filter to see the rest of the payment history."
          }
          action={
            filter !== "all" ? (
              <Button variant="outline" onClick={() => setFilter("all")}>
                Show all transactions
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden border-border/80 py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-4">Vendor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden lg:table-cell">Paid</TableHead>
                <TableHead className="hidden pr-4 xl:table-cell">Stripe session</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="pl-4">
                    <p className="text-sm font-bold">
                      {transaction.vendor?.businessName ||
                        transaction.vendor?.name ||
                        "Deleted vendor"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {transaction.vendor?.email || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs capitalize text-muted-foreground">
                    {transaction.plan}
                  </TableCell>
                  <TableCell className="text-sm font-bold">
                    {formatPrice(transaction.amount)}{" "}
                    <span className="text-[10px] font-normal uppercase text-muted-foreground">
                      {transaction.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={transaction.status} />
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {formatDateTime(transaction.createdAt)}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {transaction.paidAt ? formatDateTime(transaction.paidAt) : "—"}
                  </TableCell>
                  <TableCell className="hidden max-w-44 truncate pr-4 font-mono text-[10px] text-muted-foreground xl:table-cell">
                    {transaction.stripeSessionId || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/50 p-3 text-[11px] leading-5 text-muted-foreground">
        <Lock className="mt-0.5 size-3.5 shrink-0" />
        This page is read-only by design. Premium access is granted only when Stripe confirms a
        checkout through a signature-verified webhook, and revoked by subscription cancellation
        events.
      </p>
    </div>
  );
}
