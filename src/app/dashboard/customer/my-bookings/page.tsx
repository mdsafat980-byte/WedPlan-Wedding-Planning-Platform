"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Loader2,
  MapPin,
  MessageSquare,
  Search,
  Store,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState, PageHeader } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/constants";
import type { Booking, BookingStatus } from "@/lib/types";

type Filter = "all" | BookingStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
];

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ items: Booking[] }>("/api/customer/bookings");
      setBookings(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: bookings.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
    };
    for (const booking of bookings) base[booking.status] += 1;
    return base;
  }, [bookings]);

  const visible = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((item) => item.status === filter)),
    [bookings, filter],
  );

  const cancel = async () => {
    if (!cancelTarget) return;
    setWorking(cancelTarget.id);
    try {
      const updated = await api<Booking>(
        `/api/customer/bookings/${cancelTarget.id}/cancel`,
        { method: "PATCH" },
      );
      setBookings((current) =>
        current.map((item) => (item.id === cancelTarget.id ? updated : item)),
      );
      toast.success("Booking request cancelled");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel this request");
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Bookings"
        description="Track every enquiry, confirmation and cancelled request."
        action={
          <Link href="/services">
            <Button>
              <Search /> Find more vendors
            </Button>
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              filter === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {item.label}
            <span
              className={`ml-1.5 ${
                filter === item.value
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground/70"
              }`}
            >
              {counts[item.value]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title={bookings.length === 0 ? "No booking requests yet" : "Nothing in this filter"}
          description={
            bookings.length === 0
              ? "Find a vendor you love, pick an available date and send a request. Every response will appear here."
              : "Try another filter to see the rest of your booking history."
          }
          action={
            bookings.length === 0 ? (
              <Link href="/services">
                <Button>Browse services</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={() => setFilter("all")}>
                Show all bookings
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((booking) => (
            <Card key={booking.id} className="border-border/80">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="h-36 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-36">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={booking.service?.images?.[0] || "/placeholder-service.svg"}
                      alt={booking.service?.serviceName || "Wedding service"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold">
                        {booking.service?.serviceName || "Service no longer available"}
                      </h3>
                      <StatusBadge status={booking.status} />
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Store size={13} />
                      {booking.vendor?.businessName || booking.vendor?.name || "Vendor"}
                      {booking.service && (
                        <span className="text-muted-foreground/60">
                          · {booking.service.category} · {formatPrice(booking.service.price)}
                        </span>
                      )}
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} /> {formatDate(booking.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} /> {booking.eventLocation}
                      </span>
                      <span>Requested {formatDate(booking.createdAt)}</span>
                    </div>

                    {booking.message && (
                      <p className="mt-3 flex gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
                        <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                        <span>{booking.message}</span>
                      </p>
                    )}

                    {booking.status === "pending" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {booking.service && (
                          <Link href={`/services/${booking.service.id}`}>
                            <Button size="sm" variant="outline">
                              View service
                            </Button>
                          </Link>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setCancelTarget(booking)}
                        >
                          <XCircle /> Cancel request
                        </Button>
                      </div>
                    )}

                    {booking.status === "accepted" && booking.service && (
                      <div className="mt-3">
                        <Link href={`/services/${booking.service.id}`}>
                          <Button size="sm" variant="outline">
                            View service details
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              Your request for “{cancelTarget?.service?.serviceName || "this service"}” on{" "}
              {formatDate(cancelTarget?.eventDate)} will be withdrawn. The vendor will no longer
              see it as pending. You can send a new request for another date later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={working === cancelTarget?.id}
              onClick={() => void cancel()}
            >
              {working === cancelTarget?.id ? <Loader2 className="animate-spin" /> : null}
              Cancel request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
