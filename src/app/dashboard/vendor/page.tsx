"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Crown,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageHeader, StatCard } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/constants";
import type { Booking, VendorStats } from "@/lib/types";

export default function VendorOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, bookingData] = await Promise.all([
        api<VendorStats>("/api/vendor/stats"),
        api<{ items: Booking[] }>("/api/vendor/bookings"),
      ]);
      setStats(statsData);
      setBookings(bookingData.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-9 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-80 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-serif text-xl font-bold">Dashboard unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => void load()}>Try again</Button>
      </div>
    );
  }

  const recent = bookings.slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "vendor"}`}
        description="A quick view of your listings, booking requests and subscription."
        action={
          <Link href="/dashboard/vendor/add-service">
            <Button><PlusCircle /> Add service</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total services" value={stats?.totalServices ?? 0} icon={Sparkles} hint={`${stats?.pendingServices ?? 0} awaiting review`} />
        <StatCard label="Active services" value={stats?.activeServices ?? 0} icon={CheckCircle2} tone="green" hint={`Free plan limit: ${stats?.freeLimit ?? 3}`} />
        <StatCard label="Pending requests" value={stats?.pendingBookings ?? 0} icon={Clock} tone="amber" hint="Waiting for your response" />
        <StatCard label="Accepted bookings" value={stats?.acceptedBookings ?? 0} icon={CalendarCheck} tone="stone" hint="Confirmed celebrations" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">Recent booking requests</CardTitle>
            <Link href="/dashboard/vendor/bookings" className="text-xs font-bold text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <CalendarCheck className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">No booking requests yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Approved services will start appearing to customers on the browse page.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((booking) => (
                  <div key={booking.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {booking.service?.serviceName || "Service removed"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {booking.customer?.name || "Customer"} · {formatDate(booking.eventDate)} ·{" "}
                        {booking.eventLocation}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-xl">
                <Crown size={18} className="text-[#c9a227]" /> Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</p>
                  <p className="mt-1 font-serif text-2xl font-bold capitalize">
                    {stats?.plan || "free"}
                  </p>
                </div>
                <StatusBadge status={stats?.plan === "premium" ? "approved" : "pending"} />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {stats?.plan === "premium"
                  ? `Premium is active${stats.subscriptionExpiresAt ? ` until ${formatDate(stats.subscriptionExpiresAt)}` : ""}. Enjoy unlimited listings and your premium badge.`
                  : `Free vendors can publish up to ${stats?.freeLimit ?? 3} active services. Upgrade for unlimited listings.`}
              </p>
              <Link href="/dashboard/vendor/subscription" className="mt-4 block">
                <Button className="w-full" variant={stats?.plan === "premium" ? "outline" : "default"}>
                  {stats?.plan === "premium" ? "Manage subscription" : "Upgrade to Premium"}
                  <ArrowRight />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/vendor/add-service" className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                Add a new service <PlusCircle size={16} className="text-primary" />
              </Link>
              <Link href="/dashboard/vendor/my-services" className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                Manage my listings <Sparkles size={16} className="text-primary" />
              </Link>
              <Link href="/dashboard/profile" className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-muted">
                Update business profile <Crown size={16} className="text-primary" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
