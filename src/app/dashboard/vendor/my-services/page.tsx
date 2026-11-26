"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2, Pencil, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/dashboard/shared";
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
import { formatPrice } from "@/lib/constants";
import type { Service } from "@/lib/types";

export default function VendorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ items: Service[] }>("/api/vendor/services");
      setServices(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const toggleAvailability = async (service: Service) => {
    setWorking(service.id);
    try {
      const updated = await api<Service>(`/api/vendor/services/${service.id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      setServices((current) =>
        current.map((item) => (item.id === service.id ? updated : item)),
      );
      toast.success(updated.isActive ? "Service is now active" : "Service paused");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update availability");
    } finally {
      setWorking(null);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setWorking(deleteTarget.id);
    try {
      await api(`/api/vendor/services/${deleteTarget.id}`, { method: "DELETE" });
      setServices((current) => current.filter((item) => item.id !== deleteTarget.id));
      toast.success("Service deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete service");
    } finally {
      setWorking(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Services"
        description="Manage your listings, availability and approval status."
        action={
          <Link href="/dashboard/vendor/add-service">
            <Button><PlusCircle /> Add service</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>Retry</Button>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No services yet"
          description="Create your first listing. It will be reviewed by an admin before it appears on the public browse page."
          action={
            <Link href="/dashboard/vendor/add-service">
              <Button><PlusCircle /> Add your first service</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id} className="border-border/80">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.images?.[0] || "/placeholder-service.svg"}
                    alt={service.serviceName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-bold">{service.serviceName}</h3>
                    <StatusBadge status={service.status} />
                    {!service.isActive && (
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {service.category} · {service.location} · {formatPrice(service.price)}
                  </p>
                  {service.status === "rejected" && service.rejectionReason && (
                    <p className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-[11px] text-rose-700">
                      Admin note: {service.rejectionReason}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link href={`/dashboard/vendor/my-services/${service.id}`}>
                      <Button variant="outline" size="sm"><Pencil /> Edit</Button>
                    </Link>
                    <Link href={`/services/${service.id}`} target="_blank">
                      <Button variant="ghost" size="sm"><Eye /> Preview</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={working === service.id}
                      onClick={() => void toggleAvailability(service)}
                    >
                      {working === service.id ? <Loader2 className="animate-spin" /> : null}
                      {service.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(service)}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.serviceName}” and its booking requests will be permanently
              removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void remove()}
              disabled={working === deleteTarget?.id}
            >
              {working === deleteTarget?.id ? <Loader2 className="animate-spin" /> : null}
              Delete service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
