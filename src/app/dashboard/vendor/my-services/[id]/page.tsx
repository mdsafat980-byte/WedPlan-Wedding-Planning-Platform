"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared";
import { ServiceForm } from "@/components/dashboard/service-form";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api<{ items: Service[] }>("/api/vendor/services")
      .then((data) => {
        if (!active) return;
        const found = data.items.find((item) => item.id === params.id);
        if (!found) setError("Service not found or it does not belong to your account");
        else setService(found);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load service");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Edit Service"
        description="Update the details below. Changes are reviewed by an admin before going live again."
        action={
          <Link href="/dashboard/vendor/my-services">
            <Button variant="outline"><ArrowLeft /> Back to services</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Loading service…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Link href="/dashboard/vendor/my-services" className="mt-3 inline-block">
            <Button variant="outline">Back to my services</Button>
          </Link>
        </div>
      ) : service ? (
        <ServiceForm initial={service} />
      ) : null}
    </div>
  );
}
