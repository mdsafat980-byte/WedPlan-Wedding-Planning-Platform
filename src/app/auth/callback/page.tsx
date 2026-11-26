"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      let role: string | null = null;

      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          let timeout: ReturnType<typeof setTimeout> | undefined;
          const result = await Promise.race([
            authClient.getSession(),
            new Promise<never>((_, reject) => {
              timeout = setTimeout(
                () => reject(new Error("Session check timed out")),
                8000,
              );
            }),
          ]).finally(() => {
            if (timeout) clearTimeout(timeout);
          });

          if (result.data?.user) {
            role =
              "role" in result.data.user && typeof result.data.user.role === "string"
                ? result.data.user.role
                : "customer";
            break;
          }
        } catch (caught) {
          if (caught instanceof Error && caught.message === "Session check timed out") {
            break;
          }
        }

        if (cancelled) return;
        if (attempt < 5) {
          await new Promise((resolve) => setTimeout(resolve, 750));
        }
      }

      if (cancelled) return;
      if (!role) {
        setError(
          "Google sign-in finished, but WedPlan could not find your session. Please return to sign in and try again.",
        );
        return;
      }

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

      window.location.replace(`/dashboard/${role}`);
    };
    void run().catch((caught: unknown) => {
      if (cancelled) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not finish Google sign-in. Please try again.",
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
      {error ? (
        <>
          <p role="alert" className="max-w-md text-center text-destructive">
            {error}
          </p>
          <Link className="text-primary underline underline-offset-4" href="/auth/login">
            Return to sign in
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="animate-spin text-primary" size={26} />
          Finishing sign in and preparing your dashboard…
        </>
      )}
    </div>
  );
}
