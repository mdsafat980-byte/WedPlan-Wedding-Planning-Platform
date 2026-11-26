"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Clock,
  Heart,
  MapPin,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { EmptyState, PageHeader, StatCard } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/constants";
import type { Booking, CustomerStats } from "@/lib/types";

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsData, bookingData] = await Promise.all([
        api<CustomerStats>("/api/customer/stats"),
        api<{ items: Booking[] }>("/api/customer/bookings"),
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

  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === "accepted" &&
            new Date(booking.eventDate).getTime() >= Date.now() - 86_400_000,
        )
        .sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
        ),
    [bookings],
  );

  const recent = bookings.slice(0, 5);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-9 w-72" />
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
        title={`Hello, ${user?.name?.split(" ")[0] || "there"}`}
        description="Your wedding plans, booking requests and confirmed vendors in one place."
        action={
          <Link href="/services">
            <Button>
              <Search /> Browse services
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total requests"
          value={stats?.total ?? 0}
          icon={Heart}
          hint="Every enquiry you have sent"
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={Clock}
          tone="amber"
          hint="Waiting for the vendor"
        />
        <StatCard
          label="Accepted"
          value={stats?.accepted ?? 0}
          icon={CalendarCheck}
          tone="green"
          hint="Confirmed celebrations"
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelled ?? 0}
          icon={XCircle}
          tone="stone"
          hint="Requests you withdrew"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-xl">Upcoming celebrations</CardTitle>
            <Link
              href="/dashboard/customer/my-bookings"
              className="text-xs font-bold text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <CalendarDays className="mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">No confirmed events yet</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  Once a vendor accepts one of your requests, the event will appear here with the
                  date and location.
                </p>
                <Link href="/services" className="mt-4 inline-block">
                  <Button size="sm" variant="outline">
                    Find your first vendor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={booking.service?.images?.[0] || "/placeholder-service.svg"}
                        alt={booking.service?.serviceName || "Wedding service"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base font-bold">
                        {booking.service?.serviceName || "Service removed"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {booking.vendor?.businessName || booking.vendor?.name || "Vendor"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} /> {formatDate(booking.eventDate)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {booking.eventLocation}
                        </span>
                      </div>
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
              <CardTitle className="font-serif text-xl">Recent requests</CardTitle>
            </CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nothing here yet. Browse the marketplace and send your first enquiry.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {recent.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {booking.service?.serviceName || "Service removed"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(booking.eventDate)}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-accent/80 to-card">
            <CardContent className="p-5">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles size={18} />
              </span>
              <h3 className="mt-3 font-serif text-xl font-bold">Still shaping the day?</h3>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Explore photographers, venues, florists and more — filter by category, location
                and price to match your budget.
              </p>
              <Link href="/services" className="mt-4 block">
                <Button className="w-full" variant="outline">
                  Explore the marketplace <ArrowRight />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Heart}
            title="Your planning journey starts here"
            description="Save time by comparing trusted wedding professionals in one place. Send a booking request and track every response from this dashboard."
            action={
              <Link href="/services">
                <Button>Browse wedding services</Button>
              </Link>
            }
          />
        </div>
      )}
    </div>
  );
}
