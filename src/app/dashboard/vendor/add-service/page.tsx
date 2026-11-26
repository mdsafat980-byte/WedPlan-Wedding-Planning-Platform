"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Crown } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared";
import { ServiceForm } from "@/components/dashboard/service-form";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { VendorStats } from "@/lib/types";

export default function AddServicePage() {
  const [stats, setStats] = useState<VendorStats | null>(null);

  useEffect(() => {
    api<VendorStats>("/api/vendor/stats")
      .then(setStats)
      .catch(() => null);
  }, []);

  const atLimit = stats && !stats.canPublishMore && stats.plan === "free";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Add a New Service"
        description="Tell couples what you offer. Your listing goes live after admin approval."
        action={
          <Link href="/dashboard/vendor/my-services">
            <Button variant="outline"><ArrowLeft /> Back to services</Button>
          </Link>
        }
      />

      {stats && (
        <div className={`mb-5 rounded-xl border p-4 text-sm ${atLimit ? "border-amber-200 bg-amber-50 text-amber-800" : "border-border bg-muted/50 text-muted-foreground"}`}>
          <p className="flex items-center gap-2 font-semibold">
            <Crown size={15} /> {stats.plan === "premium" ? "Premium plan" : "Free plan"}
          </p>
          <p className="mt-1 text-xs leading-5">
            {stats.plan === "premium"
              ? "You can publish unlimited active services."
              : atLimit
                ? `You have reached the ${stats.freeLimit} active service limit. Upgrade to Premium to add more listings.`
                : `You are using ${stats.serviceSlotsUsed} of ${stats.freeLimit} active service slots, including services awaiting review.`}
            {atLimit && (
              <Link href="/dashboard/vendor/subscription" className="ml-1 font-bold underline">
                Upgrade now
              </Link>
            )}
          </p>
        </div>
      )}

      <ServiceForm />
    </div>
  );
}
