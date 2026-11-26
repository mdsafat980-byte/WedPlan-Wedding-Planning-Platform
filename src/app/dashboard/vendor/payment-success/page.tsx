"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { SubscriptionInfo } from "@/lib/types";

type ActivationState = "checking" | "waiting" | "active";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState<ActivationState>("checking");
  const attempts = useRef(0);

  const checkSubscription = useCallback(async () => {
    try {
      const info = await api<SubscriptionInfo>("/api/vendor/subscription");
      if (info.plan === "premium") {
        setState("active");
        return true;
      }
      setState("waiting");
      return false;
    } catch {
      setState("waiting");
      return false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      const done = await checkSubscription();
      if (!active || done) return;
      attempts.current += 1;
      if (attempts.current < 6) {
        timer = setTimeout(() => void poll(), 4000);
      }
    };

    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [checkSubscription]);

  const steps = [
    {
      icon: CreditCard,
      title: "Payment received",
      text: "Stripe accepted your checkout and returned you to WedPlan.",
      done: true,
    },
    {
      icon: ShieldCheck,
      title: "Webhook verification",
      text: "Our server verifies Stripe's signature before changing any account.",
      done: state === "active",
    },
    {
      icon: Crown,
      title: "Premium activated",
      text: "Unlimited listings and the premium badge are applied to your account.",
      done: state === "active",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <span
          className={`mx-auto grid size-16 place-items-center rounded-full ${
            state === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-[#c9a227]/15 text-[#8a6d10]"
          }`}
        >
          {state === "active" ? (
            <CheckCircle2 size={30} />
          ) : (
            <Loader2 size={30} className="animate-spin" />
          )}
        </span>
        <p className="eyebrow mt-5">Subscription</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">
          {state === "active" ? "Premium is active" : "Payment successful"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {state === "active"
            ? "Thank you for upgrading. Your listing limit has been removed and your premium badge is now visible to couples."
            : "Your payment went through. We are waiting for Stripe to confirm the subscription webhook — this usually takes a few seconds."}
        </p>
      </div>

      <Card className="mt-7 border-border/80">
        <CardContent className="p-5">
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.title} className="flex gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full ${
                    step.done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon size={17} />
                </span>
                <div>
                  <p className="text-sm font-bold">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          {sessionId && (
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
              <ReceiptText size={14} />
              <span className="truncate">Stripe session: {sessionId}</span>
            </div>
          )}

          {state === "waiting" && (
            <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
              Still confirming? Webhooks can be delayed on local environments. In production,
              make sure the Stripe endpoint is pointed at{" "}
              <code className="rounded bg-amber-100 px-1">/api/stripe/webhook</code>.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link href="/dashboard/vendor/subscription">
          <Button className="w-full sm:w-auto">
            View subscription <ArrowRight />
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => {
            attempts.current = 0;
            setState("checking");
            void checkSubscription();
          }}
          disabled={state === "checking"}
        >
          {state === "checking" ? <Loader2 className="animate-spin" /> : null}
          Check activation again
        </Button>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        <Link href="/dashboard/vendor" className="font-semibold text-primary hover:underline">
          Return to your dashboard
        </Link>
      </p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Confirming your payment…
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
