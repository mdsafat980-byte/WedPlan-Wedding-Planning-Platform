"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.97 10.97 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EA4335"
      />
    </svg>
  );
}

const demoAccounts = [
  { label: "Customer", email: "customer@wedplan.com", password: "Customer123" },
  { label: "Vendor", email: "vendor@wedplan.com", password: "Vendor123" },
  { label: "Admin", email: "admin@wedplan.com", password: "Admin123" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirect = searchParams.get("redirect");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });
      if (result.error) {
        throw new Error(result.error.message || "Invalid email or password");
      }
      clearApiToken();
      const session = await authClient.getSession();
      const role = (session.data?.user as { role?: string } | undefined)?.role || "customer";
      toast.success("Welcome back to WedPlan");
      const target =
        redirect && redirect.startsWith("/") ? redirect : `/dashboard/${role}`;
      router.push(target);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/auth/callback`,
        errorCallbackURL: `${window.location.origin}/auth/login`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Google sign-in is not configured on this environment",
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">Sign in to WedPlan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pick up where you left off — your bookings and saved details are waiting.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10 pl-9"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              className="h-10 pl-9 pr-10"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10 w-full"
        onClick={() => void google()}
        disabled={googleLoading}
      >
        {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>
      {searchParams.get("error") === "account_not_linked" && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          Use the same email as your WedPlan account, and make sure Google has verified it.
        </p>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to WedPlan?{" "}
        <Link href="/auth/register" className="font-bold text-primary hover:underline">
          Create an account
        </Link>
      </p>

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-7 rounded-xl border border-border bg-muted/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Demo accounts
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                }}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold transition hover:border-primary hover:text-primary"
              >
                {account.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
            Click a role to fill the form, then press Sign in.
          </p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Loading sign in…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
