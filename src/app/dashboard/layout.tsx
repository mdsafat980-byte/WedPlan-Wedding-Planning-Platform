"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Crown,
  ExternalLink,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/lib/constants";
import type { Role } from "@/lib/types";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const NAV: Record<Role, NavItem[]> = {
  vendor: [
    { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/vendor/my-services", label: "My Services", icon: Sparkles },
    { href: "/dashboard/vendor/add-service", label: "Add Service", icon: PlusCircle },
    { href: "/dashboard/vendor/bookings", label: "Booking Requests", icon: CalendarCheck },
    { href: "/dashboard/vendor/subscription", label: "Subscription", icon: Crown },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  customer: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/customer/my-bookings", label: "My Bookings", icon: CalendarCheck },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/admin/manage-users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/manage-services", label: "Manage Services", icon: ShieldCheck },
    { href: "/dashboard/admin/transactions", label: "Transactions", icon: Wallet },
    { href: "/dashboard/profile", label: "Profile Settings", icon: Settings },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (pathname === "/dashboard") {
      router.replace(`/dashboard/${user.role}`);
      return;
    }
    const allowed =
      pathname === "/dashboard/profile" ||
      pathname === `/dashboard/${user.role}` ||
      pathname.startsWith(`/dashboard/${user.role}/`);
    if (!allowed) router.replace(`/dashboard/${user.role}`);
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 border-r border-border bg-card p-6 lg:block">
          <Skeleton className="h-10 w-36" />
          <div className="mt-10 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6 lg:p-10">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="mt-3 h-4 w-80" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-8 h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Never mount a dashboard page that belongs to another role. The effect
  // above redirects, but rendering it even briefly would fire its API calls
  // and flash another role's UI.
  const authorized =
    pathname === "/dashboard" ||
    pathname === "/dashboard/profile" ||
    pathname === `/dashboard/${user.role}` ||
    pathname.startsWith(`/dashboard/${user.role}/`);

  if (!authorized) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Redirecting to your dashboard…
        </div>
      </div>
    );
  }

  const items = NAV[user.role];
  const current =
    items.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href))) ||
    items[0];

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Heart size={16} fill="currentColor" />
        </span>
        <span className="font-serif text-xl font-bold">WedPlan</span>
      </Link>

      <div className="mt-7 rounded-xl border border-border bg-muted/60 p-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-xs text-primary">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-[11px] capitalize text-muted-foreground">
              {user.role}
              {user.role === "vendor" && user.subscriptionPlan === "premium" ? " · premium" : ""}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-border pt-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink size={17} /> View website
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f4]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card p-5 lg:block">
        {sidebar}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="outline" size="icon" className="lg:hidden" aria-label="Open dashboard menu" />}
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-[82vw] max-w-xs p-5">
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {user.role} dashboard
            </p>
            <p className="truncate font-serif text-lg font-bold">{current.label}</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/services" className="hidden sm:block">
              <Button variant="outline" size="sm">Browse services</Button>
            </Link>
            <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
              <Avatar className="size-7">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-xs font-semibold sm:block">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
