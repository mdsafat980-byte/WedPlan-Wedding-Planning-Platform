"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { EmptyState, PageHeader } from "@/components/dashboard/shared";
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate, initials } from "@/lib/constants";
import type { AuthUser } from "@/lib/types";

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-stone-800 text-white",
  vendor: "bg-primary/10 text-primary",
  customer: "bg-emerald-50 text-emerald-700",
};

export default function ManageUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<AuthUser | null>(null);

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
      if (role !== "all") params.set("role", role);
      const query = params.toString();
      const data = await api<{ items: AuthUser[] }>(
        `/api/admin/users${query ? `?${query}` : ""}`,
      );
      setUsers(data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, role]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const base = { all: users.length, customer: 0, vendor: 0, admin: 0 };
    for (const user of users) {
      if (user.role in base) base[user.role as keyof typeof base] += 1;
    }
    return base;
  }, [users]);

  const toggleBlock = async () => {
    if (!blockTarget) return;
    setWorking(blockTarget.id);
    try {
      const updated = await api<AuthUser>(`/api/admin/users/${blockTarget.id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ isBlocked: !blockTarget.isBlocked }),
      });
      setUsers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        updated.isBlocked
          ? `${updated.name} has been blocked`
          : `${updated.name} can sign in again`,
      );
      setBlockTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this account");
    } finally {
      setWorking(null);
    }
  };

  const isProtected = (user: AuthUser) =>
    user.role === "admin" || user.id === currentUser?.id;

  return (
    <div>
      <PageHeader
        title="Manage Users"
        description="Search every account, review roles and block abusive sign-ins."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or business"
            className="h-10 pl-9"
            aria-label="Search users"
          />
          {loading && users.length > 0 && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "customer", label: "Customers" },
            { value: "vendor", label: "Vendors" },
            { value: "admin", label: "Admins" },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRole(item.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                role === item.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {item.label}
              {role === "all" && (
                <span className="ml-1.5 text-muted-foreground/70">{counts.all}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-semibold text-destructive">{error}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching accounts"
          description="Try a different search term or role filter. New sign-ups appear here automatically."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setRole("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden border-border/80 py-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="pl-4">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Business</TableHead>
                <TableHead className="hidden lg:table-cell">Plan</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const protectedAccount = isProtected(user);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-9">
                          <AvatarImage src={user.image || undefined} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                                (you)
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          ROLE_STYLES[user.role] || ROLE_STYLES.customer
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden max-w-40 truncate text-xs text-muted-foreground md:table-cell">
                      {user.businessName || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs capitalize text-muted-foreground">
                        {user.subscriptionPlan === "premium" && (
                          <ShieldCheck size={13} className="text-[#c9a227]" />
                        )}
                        {user.subscriptionPlan || "free"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          <Ban size={11} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className={user.isBlocked ? "" : "text-destructive hover:bg-destructive/10"}
                        disabled={protectedAccount || working === user.id}
                        title={
                          protectedAccount
                            ? "Admin accounts cannot be blocked"
                            : undefined
                        }
                        onClick={() => setBlockTarget(user)}
                      >
                        {working === user.id ? (
                          <Loader2 className="animate-spin" />
                        ) : user.isBlocked ? (
                          <CheckCircle2 />
                        ) : (
                          <Ban />
                        )}
                        {user.isBlocked ? "Unblock" : "Block"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
        <UserRound className="mt-0.5 size-3.5 shrink-0" />
        Blocking prevents sign-in but keeps the account&apos;s history. Admin accounts can never
        be blocked from this dashboard.
      </p>

      <AlertDialog
        open={Boolean(blockTarget)}
        onOpenChange={(open) => !open && setBlockTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockTarget?.isBlocked ? "Unblock this account?" : "Block this account?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget?.isBlocked
                ? `${blockTarget?.name} will be able to sign in and use WedPlan again.`
                : `${blockTarget?.name} will be signed out and prevented from signing in. Their listings and booking history stay intact.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                blockTarget?.isBlocked
                  ? ""
                  : "bg-destructive text-white hover:bg-destructive/90"
              }
              disabled={working === blockTarget?.id}
              onClick={() => void toggleBlock()}
            >
              {working === blockTarget?.id ? <Loader2 className="animate-spin" /> : null}
              {blockTarget?.isBlocked ? "Unblock account" : "Block account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
