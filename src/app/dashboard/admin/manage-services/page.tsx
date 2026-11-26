"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { CATEGORY_NAMES, formatDate, formatPrice } from "@/lib/constants";
import type { Service } from "@/lib/types";

const SELECT_CLASS =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export default function ManageServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Service | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (status !== "all") params.set("status", status);
      if (category !== "all") params.set("category", category);
      const query = params.toString();
      const data = await api<{ items: Service[] }>(
        `/api/admin/services${query ? `?${query}` : ""}`,
      );
      setServices(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load services");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, category]);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const pendingCount = useMemo(
    () => services.filter((service) => service.status === "pending").length,
    [services],
  );

  const update = async (
    service: Service,
    body: Record<string, unknown>,
    successMessage: string,
  ) => {
    setWorking(service.id);
    try {
      const updated = await api<Service>(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setServices((current) =>
        current.map((item) => (item.id === service.id ? updated : item)),
      );
      toast.success(successMessage);
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this service");
    } finally {
      setWorking(null);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setWorking(deleteTarget.id);
    try {
      await api(`/api/admin/services/${deleteTarget.id}`, { method: "DELETE" });
      setServices((current) => current.filter((item) => item.id !== deleteTarget.id));
      toast.success("Service deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete this service");
    } finally {
      setWorking(null);
    }
  };

  const submitReject = async () => {
    if (!rejectTarget) return;
    await update(
      rejectTarget,
      { status: "rejected", rejectionReason: rejectReason.trim() },
      `“${rejectTarget.serviceName}” was rejected`,
    );
  };

  return (
    <div>
      <PageHeader
        title="Manage Services"
        description="Approve new listings, pause listings that break the rules and keep the marketplace trustworthy."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search service name or location"
            className="h-10 pl-9"
            aria-label="Search services"
          />
          {loading && services.length > 0 && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={SELECT_CLASS}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={SELECT_CLASS}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {CATEGORY_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {pendingCount > 0 && status !== "pending" && (
        <button
          type="button"
          onClick={() => setStatus("pending")}
          className="mb-4 flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-semibold text-amber-800 hover:bg-amber-100"
        >
          <Sparkles size={14} /> {pendingCount} listing{pendingCount === 1 ? "" : "s"} in this
          view awaiting review — click to filter.
        </button>
      )}

      {loading && services.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No services match these filters"
          description="Try clearing the search or choosing another status. Vendors' new submissions appear here automatically."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {services.map((service) => (
            <Card key={service.id} className="border-border/80 py-0">
              <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center">
                <div className="h-32 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-28">
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
                    {service.vendor?.businessName || service.vendor?.name || "Unknown vendor"} ·{" "}
                    {service.category} · {service.location} · {formatPrice(service.price)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Submitted {formatDate(service.createdAt)}
                    {service.status === "rejected" && service.rejectionReason
                      ? ` · Reason: ${service.rejectionReason}`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {service.status !== "approved" && (
                    <Button
                      size="sm"
                      disabled={working === service.id}
                      onClick={() =>
                        void update(
                          service,
                          { status: "approved" },
                          `“${service.serviceName}” is now live`,
                        )
                      }
                    >
                      {working === service.id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Check />
                      )}
                      Approve
                    </Button>
                  )}

                  {service.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={working === service.id}
                      onClick={() => {
                        setRejectTarget(service);
                        setRejectReason("");
                      }}
                    >
                      <X /> Reject
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={working === service.id}
                    onClick={() =>
                      void update(
                        service,
                        { isActive: !service.isActive },
                        service.isActive ? "Service paused" : "Service activated",
                      )
                    }
                  >
                    {service.isActive ? <EyeOff /> : <Eye />}
                    {service.isActive ? "Pause" : "Activate"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteTarget(service)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this service?</DialogTitle>
            <DialogDescription>
              “{rejectTarget?.serviceName}” will be hidden from customers. The vendor sees your
              reason on their dashboard and can fix the listing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rejection-reason">Reason for rejection (optional)</Label>
            <Textarea
              id="rejection-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="e.g. Photos do not match the service description. Please add real venue photos."
              rows={4}
              maxLength={400}
            />
            <p className="text-[11px] text-muted-foreground">
              {rejectReason.length}/400 characters
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={working === rejectTarget?.id}
              onClick={() => void submitReject()}
            >
              {working === rejectTarget?.id ? <Loader2 className="animate-spin" /> : null}
              Reject service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.serviceName}” and every booking request attached to it will be
              removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={working === deleteTarget?.id}
              onClick={() => void remove()}
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
