"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  Check,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  X,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/constants";
import type { Booking, BookingStatus } from "@/lib/types";

type Filter = "all" | "pending" | "accepted" | "rejected";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All requests" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ items: Booking[] }>("/api/vendor/bookings");
      setBookings(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load booking requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: bookings.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
    };
    for (const booking of bookings) {
      if (booking.status === "pending") base.pending += 1;
      if (booking.status === "accepted") base.accepted += 1;
      if (booking.status === "rejected") base.rejected += 1;
    }
    return base;
  }, [bookings]);

  const visible = useMemo(
    () => (filter === "all" ? bookings : bookings.filter((item) => item.status === filter)),
    [bookings, filter],
  );

  const updateStatus = async (booking: Booking, status: Extract<BookingStatus, "accepted" | "rejected">) => {
    setWorking(booking.id);
    try {
      const updated = await api<Booking>(`/api/vendor/bookings/${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setBookings((current) =>
        current.map((item) => (item.id === booking.id ? updated : item)),
      );
      toast.success(
        status === "accepted"
          ? "Booking accepted — the customer can see your confirmation now"
          : "Booking request declined",
      );
      setRejectTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this request");
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Booking Requests"
        description="Review enquiries from couples and respond before their date fills up."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
              filter === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {item.label}
            <span className={`ml-1.5 ${filter === item.value ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>
              {counts[item.value]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
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
              ? "When a couple requests one of your approved services, their enquiry will appear here with the event date and location."
              : "Try another filter to see the rest of your booking requests."
          }
          action={
            bookings.length === 0 ? (
              <Link href="/dashboard/vendor/my-services">
                <Button variant="outline">Review my listings</Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={() => setFilter("all")}>
                Show all requests
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
                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-36">
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
                        {booking.service?.serviceName || "Service removed"}
                      </h3>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} /> {formatDate(booking.eventDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} /> {booking.eventLocation}
                      </span>
                      <span>Requested {formatDate(booking.createdAt)}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-2.5">
                      <Avatar className="size-8">
                        <AvatarImage src={booking.customer?.image || undefined} alt={booking.customer?.name || "Customer"} />
                        <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                          {initials(booking.customer?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {booking.customer?.name || "Customer"}
                        </p>
                        {booking.customer?.email && (
                          <p className="truncate text-[11px] text-muted-foreground">
                            <Mail className="mr-1 inline size-3" />
                            {booking.customer.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {booking.message && (
                      <p className="mt-3 flex gap-2 rounded-lg bg-accent/60 px-3 py-2 text-xs leading-5 text-accent-foreground">
                        <MessageSquare className="mt-0.5 size-3.5 shrink-0" />
                        <span>{booking.message}</span>
                      </p>
                    )}

                    {booking.status === "pending" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={working === booking.id}
                          onClick={() => void updateStatus(booking, "accepted")}
                        >
                          {working === booking.id ? <Loader2 className="animate-spin" /> : <Check />}
                          Accept request
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={working === booking.id}
                          onClick={() => setRejectTarget(booking)}
                        >
                          <X /> Decline
                        </Button>
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
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              {rejectTarget?.customer?.name || "The customer"} will see that their request for{" "}
              “{rejectTarget?.service?.serviceName || "this service"}” on{" "}
              {formatDate(rejectTarget?.eventDate)} was declined. They can still book another
              available date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep request</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={working === rejectTarget?.id}
              onClick={() => rejectTarget && void updateStatus(rejectTarget, "rejected")}
            >
              {working === rejectTarget?.id ? <Loader2 className="animate-spin" /> : null}
              Decline request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
