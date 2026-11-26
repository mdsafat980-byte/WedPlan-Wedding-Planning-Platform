"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import type { AuthUser, Role } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  role: Role | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  return {
    id: String(value.id ?? ""),
    name: String(value.name ?? ""),
    email: String(value.email ?? ""),
    image: (value.image as string) || "",
    role: (value.role as Role) || "customer",
    isBlocked: Boolean(value.isBlocked),
    businessName: (value.businessName as string) || "",
    phone: (value.phone as string) || "",
    bio: (value.bio as string) || "",
    subscriptionPlan: (value.subscriptionPlan as "free" | "premium") || "free",
    subscriptionExpiresAt: (value.subscriptionExpiresAt as string) || null,
    createdAt: (value.createdAt as string) || undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isPending, refetch } = authClient.useSession();
  const user = useMemo(() => normalizeUser(data?.user), [data?.user]);

  useEffect(() => {
    if (!isPending && !user) clearApiToken();
  }, [isPending, user]);

  const logout = async () => {
    await authClient.signOut();
    clearApiToken();
    toast.success("You have been signed out");
    router.push("/");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isPending,
        role: user?.role ?? null,
        refresh: async () => {
          await refetch();
        },
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
