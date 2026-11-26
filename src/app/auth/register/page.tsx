"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
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

const rules = [
  { label: "At least 6 characters", test: (value: string) => value.length >= 6 },
  { label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your full name and email");
      return;
    }
    if (!rules.every((rule) => rule.test(password))) {
      toast.error("Password must be 6+ characters with uppercase and lowercase letters");
      return;
    }
    if (password !== confirm) {
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
      } as unknown as Parameters<typeof authClient.signUp.email>[0];

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

  const google = async () => {
    setGoogleLoading(true);
    try {
      localStorage.setItem("wedplan_signup_role", role);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/auth/callback`,
        errorCallbackURL: `${window.location.origin}/auth/register`,
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
      <p className="eyebrow">Join WedPlan</p>
      <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Free to join. Choose how you will use WedPlan — you can update your profile later.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          { value: "customer" as Role, label: "I'm planning", icon: Heart, text: "Book wedding services" },
          { value: "vendor" as Role, label: "I'm a vendor", icon: Store, text: "Offer wedding services" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={`rounded-xl border p-3 text-left transition ${
              role === option.value
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <option.icon
              size={18}
              className={role === option.value ? "text-primary" : "text-muted-foreground"}
            />
            <p className="mt-2 text-sm font-bold">{option.label}</p>
            <p className="text-[11px] text-muted-foreground">{option.text}</p>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="flex items-center gap-4">
          <ImageUploader value={image} onChange={setImage} label="Profile photo" />
          <div>
            <p className="text-sm font-semibold">Profile photo</p>
            <p className="text-xs text-muted-foreground">Optional. JPG, PNG or WEBP up to 5MB.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              className="h-10 pl-9"
              placeholder="Sofia Bennett"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10 pl-9"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="h-10 pl-9 pr-9"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="h-10"
              placeholder="Repeat password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </div>
        </div>

        <ul className="grid gap-1.5 text-xs sm:grid-cols-3">
          {rules.map((rule) => {
            const passed = rule.test(password);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-1.5 ${passed ? "text-emerald-700" : "text-muted-foreground"}`}
              >
                <span
                  className={`grid size-4 place-items-center rounded-full border ${
                    passed ? "border-emerald-600 bg-emerald-600 text-white" : "border-border"
                  }`}
                >
                  {passed && <Check size={10} />}
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>

        <Button type="submit" className="h-10 w-full" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Creating account…" : `Create ${role} account`}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or sign up with</span>
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

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
