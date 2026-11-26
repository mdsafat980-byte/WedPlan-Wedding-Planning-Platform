import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
        <CreditCard size={28} />
      </span>
      <p className="eyebrow mt-5">Subscription</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">Checkout cancelled</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        No payment was taken and your plan has not changed. You can return to your dashboard or
        try the upgrade again whenever you are ready.
      </p>

      <Card className="mt-7 border-border/80 text-left">
        <CardContent className="flex items-start gap-3 p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <p className="text-xs leading-5 text-muted-foreground">
            WedPlan only activates Premium after Stripe confirms a successful payment through a
            signed webhook. Closing the checkout page never changes your account.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link href="/dashboard/vendor/subscription">
          <Button className="w-full sm:w-auto">Try upgrade again</Button>
        </Link>
        <Link href="/dashboard/vendor">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft /> Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
