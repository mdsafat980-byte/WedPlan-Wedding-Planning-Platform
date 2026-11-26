"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarCheck, CheckCircle2, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import type { Booking } from "@/lib/types";

export function BookingForm({
  serviceId,
  serviceName,
  vendorName,
}: {
  serviceId: string;
  serviceName: string;
  vendorName: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user) {
      router.push(`/auth/login?redirect=/services/${serviceId}`);
      return;
    }
    if (user.role !== "customer") {
      setError(
        user.role === "vendor"
          ? "Vendor accounts cannot submit customer booking requests."
          : "Admin accounts cannot submit customer booking requests.",
      );
      return;
    }
    if (!eventDate || !eventLocation.trim()) {
      setError("Please choose an event date and enter the event location.");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await api<Booking>("/api/customer/bookings", {
        method: "POST",
        body: JSON.stringify({ serviceId, eventDate, eventLocation, message }),
      });
      setCreated(booking);
      toast.success("Booking request sent to the vendor");
      setEventDate("");
      setEventLocation("");
      setMessage("");
    } catch (err) {
      const text =
        err instanceof ApiError ? err.message : "We could not send your booking request";
      setError(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" /> Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div id="book" className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-primary">
          <LockKeyhole size={18} />
          <h3 className="font-serif text-xl font-bold text-foreground">Request this service</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to send a booking request for {serviceName}. You will be able to track
          the vendor&apos;s response from your dashboard.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href={`/auth/login?redirect=/services/${serviceId}`} className="flex-1">
            <Button className="w-full">Sign in to book</Button>
          </Link>
          <Link href="/auth/register" className="flex-1">
            <Button variant="outline" className="w-full">Create account</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (created) {
    return (
      <div id="book" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <CheckCircle2 className="text-emerald-600" size={26} />
        <h3 className="mt-3 font-serif text-xl font-bold text-emerald-900">
          Request sent successfully
        </h3>
        <p className="mt-2 text-sm leading-6 text-emerald-800">
          {vendorName} has received your request for {serviceName}. The status is{" "}
          <strong>pending</strong> until the vendor responds.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/dashboard/customer/my-bookings">
            <Button className="w-full sm:w-auto">View my bookings</Button>
          </Link>
          <Button variant="outline" onClick={() => setCreated(null)}>
            Book another date
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "customer") {
    return (
      <div id="book" className="rounded-2xl border border-border bg-card p-6">
        <ShieldCheck className="text-primary" size={22} />
        <h3 className="mt-3 font-serif text-xl font-bold">Customer booking only</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Booking requests can only be submitted from a customer account. Vendors manage
          their own listings, and admins review the platform.
        </p>
        <Link href={`/dashboard/${user.role}`} className="mt-4 inline-block">
          <Button variant="outline">Go to my dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <form id="book" onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <CalendarCheck size={18} />
        <h3 className="font-serif text-xl font-bold text-foreground">Request this service</h3>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        No payment is taken now. The vendor will confirm availability.
      </p>

      <div className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="eventDate">Event date *</Label>
          <Input
            id="eventDate"
            type="date"
            min={today}
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="eventLocation">Event location *</Label>
          <Input
            id="eventLocation"
            placeholder="Venue name, city"
            value={eventLocation}
            onChange={(event) => setEventLocation(event.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="message">Additional message</Label>
          <Textarea
            id="message"
            placeholder="Guest count, timings, colours, anything the vendor should know…"
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-5 w-full" disabled={submitting}>
        {submitting ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
        {submitting ? "Sending request…" : "Send booking request"}
      </Button>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        Your request is stored securely and only shared with this vendor.
      </p>
    </form>
  );
}
