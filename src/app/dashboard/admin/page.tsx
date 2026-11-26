"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/constants";
import type { AdminStats, Service, Transaction } from "@/lib/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, pendingData, transactionData] = await Promise.all([
        api<AdminStats>("/api/admin/stats"),
        api<{ items: Service[] }>("/api/admin/services?status=pending"),
        api<{ items: Transaction[] }>("/api/admin/transactions"),
      ]);
      setStats(statsData);
      setPending(pendingData.items);
      setTransactions(transactionData.items.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the admin dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (service: Service) => {
    setWorking(service.id);
    try {
      await api<Service>(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      });
      setPending((current) => current.filter((item) => item.id !== service.id));
      setStats((current) =>
        current
          ? {
              ...current,
              pendingServices: Math.max(0, current.pendingServices - 1),
            }
          : current,
      );
      toast.success(`“${service.serviceName}” is now live`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not approve this service");
    } finally {
      setWorking(null);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-9 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-serif text-xl font-bold">Dashboard unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Platform Overview"
        description="Moderate listings, keep an eye on vendors and follow subscription revenue."
        action={
          <Link href="/dashboard/admin/manage-services">
            <Button>
              <ShieldCheck /> Review services
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered users"
          value={stats?.users ?? 0}
          icon={Users}
          hint={`${stats?.vendors ?? 0} vendors · ${stats?.customers ?? 0} customers`}
        />
        <StatCard
          label="Services"
          value={stats?.totalServices ?? 0}
          icon={Sparkles}
          tone="stone"
          hint={`${stats?.pendingServices ?? 0} awaiting review`}
        />
        <StatCard
          label="Paid transactions"
          value={stats?.paidTransactions ?? 0}
          icon={CreditCard}
          tone="green"
          hint={`${stats?.transactions ?? 0} total checkouts`}
        />
        <StatCard
          label="Subscription revenue"
          value={formatPrice(stats?.revenue ?? 0)}
          icon={Wallet}
          tone="amber"
          hint="Verified Stripe payments only"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">Services awaiting review</CardTitle>
            <Link
              href="/dashboard/admin/manage-services"
              className="text-xs font-bold text-primary hover:underline"
            >
              Manage all
            </Link>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Check className="mx-auto text-emerald-600" />
                <p className="mt-2 text-sm font-semibold">All caught up</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Every submitted listing has been reviewed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pending.slice(0, 6).map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="h-16 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-12 sm:w-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.images?.[0] || "/placeholder-service.svg"}
                        alt={service.serviceName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{service.serviceName}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {service.vendor?.businessName || service.vendor?.name || "Vendor"} ·{" "}
                        {service.category} · {formatDate(service.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        disabled={working === service.id}
                        onClick={() => void approve(service)}
                      >
                        {working === service.id ? <Loader2 className="animate-spin" /> : <Check />}
                        Approve
                      </Button>
                      <Link href="/dashboard/admin/manage-services">
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-xl">Recent transactions</CardTitle>
              <Link
                href="/dashboard/admin/transactions"
                className="text-xs font-bold text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subscription checkouts have been created yet.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {transaction.vendor?.businessName ||
                            transaction.vendor?.name ||
                            "Vendor"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(transaction.createdAt)} · {transaction.plan}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {formatPrice(transaction.amount)}
                        </p>
                        <StatusBadge status={transaction.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Admin shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/dashboard/admin/manage-users", label: "Manage users", icon: Users },
                {
                  href: "/dashboard/admin/manage-services",
                  label: "Moderate services",
                  icon: ShieldCheck,
                },
                {
                  href: "/dashboard/admin/transactions",
                  label: "Payment history",
                  icon: Wallet,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  <span className="flex items-center gap-2">
                    <item.icon size={16} className="text-primary" /> {item.label}
                  </span>
                  <ArrowRight size={15} className="text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <Store size={14} /> Payment policy
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
              Subscription status is only changed by verified Stripe webhooks. Admin tools are
              read-only for payments, so revenue figures always reflect real checkouts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
