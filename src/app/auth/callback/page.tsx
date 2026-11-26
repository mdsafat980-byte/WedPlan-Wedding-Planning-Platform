"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const { data } = await authClient.getSession();
      if (cancelled) return;
      if (!data?.user) {
        router.replace("/auth/login");
        return;
      }

      let role = (data.user as { role?: string }).role || "customer";
      const pendingRole = localStorage.getItem("wedplan_signup_role");
      localStorage.removeItem("wedplan_signup_role");

      if (pendingRole === "vendor" && role === "customer") {
        try {
          await api("/api/profile/become-vendor", { method: "POST" });
          role = "vendor";
          toast.success("Vendor account ready. Add your first service from the dashboard.");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Could not upgrade this account to a vendor",
          );
        }
      }

      router.replace(`/dashboard/${role}`);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      <Loader2 className="animate-spin text-primary" size={26} />
      Finishing sign in and preparing your dashboard…
    </div>
  );
}
