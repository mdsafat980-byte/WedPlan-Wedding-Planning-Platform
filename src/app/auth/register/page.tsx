"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Heart,
  Loader2,
  LockKeyhole,
  Mail,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearApiToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "@/components/image-uploader";
import type { Role } from "@/lib/types";

const passwordRules = [
  { label: "At least 6 characters", test: (value: string) => value.length >= 6 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
      <path d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.97 10.97 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordRules.every((rule) => rule.test(password))) {
      toast.error("Password must be 6+ characters with uppercase and lowercase letters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        ...(image ? { image } : {}),
        signupRole: role,
      } as Parameters<typeof authClient.signUp.email>[0];

      const result = await authClient.signUp.email(payload);
      if (result.error) {
        throw new Error(result.error.message || "Registration failed");
      }

      clearApiToken();
      toast.success(
        role === "vendor"
          ? "Vendor account created. Add your first service from the dashboard."
          : "Account created. Start exploring wedding services.",
      );
      router.push(`/dashboard/${role}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    setGoogleLoading(true);
    try {
      localStorage.setItem("wedplan_signup_role", role);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/auth/callback`,
        errorCallbackURL: `${window.location.origin}/auth/register`,
      });
    } catch (error) {
      localStorage.removeItem("wedplan_signup_role");
      toast.error(error instanceof Error ? error.message : "Google sign-up is unavailable");
      setGoogleLoading(false);
    }
  };

  return (
    <div>
      <p className="eyebrow">Join WedPlan</p>
      <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Free to join. Choose how you will use WedPlan.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {([
          { value: "customer" as Role, label: "I'm planning", text: "Book wedding services", Icon: Heart },
          { value: "vendor" as Role, label: "I'm a vendor", text: "Offer wedding services", Icon: Store },
        ]).map(({ value, label, text, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={role === value}
            onClick={() => setRole(value)}
            className={`rounded-xl border p-3 text-left transition ${
              role === value
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <Icon size={18} className={role === value ? "text-primary" : "text-muted-foreground"} />
            <p className="mt-2 text-sm font-bold">{label}</p>
            <p className="text-[11px] text-muted-foreground">{text}</p>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="flex items-center gap-4">
          <ImageUploader value={image} onChange={setImage} label="Profile photo" />
          <p className="text-xs text-muted-foreground">Optional profile photo. JPG, PNG, WEBP or GIF, up to 5 MB.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-name">Full name</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="register-name" className="h-10 pl-9" autoComplete="name" minLength={2} maxLength={80} placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="register-email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="register-email" type="email" autoComplete="email" className="h-10 pl-9" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="register-password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="register-password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="h-10 pl-9 pr-9" value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="register-confirm">Confirm password</Label>
            <Input id="register-confirm" type="password" autoComplete="new-password" className="h-10" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </div>
        </div>

        <ul className="grid gap-1 text-[11px] text-muted-foreground sm:grid-cols-3">
          {passwordRules.map((rule) => (
            <li key={rule.label} className={rule.test(password) ? "text-emerald-700" : ""}>{rule.label}</li>
          ))}
        </ul>

        <Button type="submit" className="h-10 w-full" disabled={loading || googleLoading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <Separator className="flex-1" />
      </div>

      <Button type="button" variant="outline" className="h-10 w-full" onClick={() => void signUpWithGoogle()} disabled={loading || googleLoading}>
        {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
