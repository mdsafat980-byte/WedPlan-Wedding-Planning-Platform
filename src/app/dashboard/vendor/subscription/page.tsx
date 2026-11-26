"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Crown,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/constants";
import type { SubscriptionInfo } from "@/lib/types";

const FREE_FEATURES = [
  "Publish up to 3 active services",
  "Receive booking requests from couples",
  "Standard placement in browse results",
  "Admin-reviewed listings",
];

export default function VendorSubscriptionPage() {
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<SubscriptionInfo>("/api/vendor/subscription");
      setInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const upgrade = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const result = await api<{ url: string }>("/api/vendor/subscription/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!result.url) throw new Error("Stripe did not return a checkout link");
      window.location.href = result.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Stripe checkout is unavailable right now";
      setCheckoutError(message);
      toast.error(message);
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-9 w-64" />
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-serif text-xl font-bold">Subscription unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {error || "Could not load your subscription details"}
        </p>
        <Button className="mt-4" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    );
  }

  const isPremium = info.plan === "premium";
  const usagePercent = Math.min(
    100,
    Math.round((info.activeServices / Math.max(info.freeLimit, 1)) * 100),
  );

  return (
    <div>
      <PageHeader
        title="Subscription"
        description="Choose the plan that matches how many celebrations you take on."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className={`border-border/80 ${isPremium ? "opacity-80" : "ring-1 ring-primary/20"}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Sparkles size={20} className="text-primary" /> Free
              </CardTitle>
              {!isPremium && <StatusBadge status="approved" />}
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-4xl font-bold">
              $0 <span className="text-sm font-normal text-muted-foreground">forever</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to start receiving enquiries.
            </p>

            <div className="mt-5 rounded-xl border border-border bg-muted/50 p-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Active approved services</span>
                <span>
                  {info.activeServices} / {info.freeLimit}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full transition-all ${
                    usagePercent >= 100 ? "bg-amber-500" : "bg-primary"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {info.activeServices >= info.freeLimit && (
                <p className="mt-2 text-[11px] leading-4 text-amber-700">
                  You have reached the Free plan limit. Upgrade to publish more listings.
                </p>
              )}
            </div>

            <ul className="mt-5 space-y-2.5">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="mt-6 w-full" variant="outline" disabled>
              {isPremium ? "Included in Premium" : "Your current plan"}
            </Button>
          </CardContent>
        </Card>

        <Card
          className={`border-primary/40 bg-gradient-to-b from-accent/70 to-card ${
            isPremium ? "ring-2 ring-[#c9a227]/50" : ""
          }`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Crown size={20} className="text-[#c9a227]" /> Premium
              </CardTitle>
              {isPremium ? (
                <StatusBadge status="approved" />
              ) : (
                <span className="rounded-full bg-[#c9a227]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8a6d10]">
                  Most popular
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-4xl font-bold">
              {formatPrice(info.premium.price)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {info.premium.interval}
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlimited listings and a premium badge across WedPlan.
            </p>

            <div className="mt-5 rounded-xl border border-[#c9a227]/30 bg-[#c9a227]/10 p-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Current plan</span>
                <span className="capitalize">{info.plan}</span>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                {isPremium
                  ? `Premium is active${
                      info.subscriptionExpiresAt
                        ? ` until ${formatDate(info.subscriptionExpiresAt)}`
                        : ""
                    }. Your next renewal is handled securely by Stripe.`
                  : "Upgrade to remove the 3-service limit immediately after payment is verified."}
              </p>
            </div>

            <ul className="mt-5 space-y-2.5">
              {info.premium.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div className="mt-6 space-y-2">
                <Button className="w-full" variant="outline" disabled>
                  <ShieldCheck /> Premium is active
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  To cancel or change billing, contact support from your profile page.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => void upgrade()}
                  disabled={checkoutLoading || !info.stripeReady}
                >
                  {checkoutLoading ? <Loader2 className="animate-spin" /> : <CreditCard />}
                  {checkoutLoading ? "Opening Stripe…" : "Upgrade with Stripe"}
                  {!checkoutLoading && <ArrowRight />}
                </Button>
                {!info.stripeReady && (
                  <p className="flex items-start gap-1.5 text-[11px] leading-4 text-amber-700">
                    <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                    Stripe is not configured on this environment. Set
                    STRIPE_SECRET_KEY and STRIPE_PREMIUM_PRICE_ID on the server to enable
                    checkout.
                  </p>
                )}
                {checkoutError && (
                  <p className="rounded-lg bg-destructive/10 px-3 py-2 text-[11px] leading-4 text-destructive">
                    {checkoutError}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Lock,
            title: "Secure checkout",
            text: "Card details never touch the WedPlan servers — Stripe hosts the payment page.",
          },
          {
            icon: ShieldCheck,
            title: "Verified activation",
            text: "Premium only unlocks after Stripe sends a webhook with a valid signature.",
          },
          {
            icon: Crown,
            title: "No admin shortcuts",
            text: "Admins can review listings but can never mark a payment as paid by hand.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-4">
            <item.icon className="size-5 text-primary" />
            <p className="mt-2 text-sm font-bold">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Questions about billing?{" "}
        <Link href="/dashboard/profile" className="font-semibold text-primary hover:underline">
          Update your business profile
        </Link>{" "}
        so our team can reach you.
      </p>
    </div>
  );
}
