"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { PageHeader } from "@/components/dashboard/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, uploadImage } from "@/lib/api";
import { formatDate, initials } from "@/lib/constants";
import type { AuthUser } from "@/lib/types";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [image, setImage] = useState(user?.image || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [upgrading, setUpgrading] = useState(false);


  if (!user) return null;

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImage(url);
      toast.success("Image uploaded — save to apply it");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload that image");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        image,
      };
      if (user.role === "vendor") body.businessName = businessName.trim();

      const updated = await api<AuthUser>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      await refresh();
      setName(updated.name);
      setPhone(updated.phone || "");
      setBusinessName(updated.businessName || "");
      setBio(updated.bio || "");
      setImage(updated.image || "");
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  const becomeVendor = async () => {
    setUpgrading(true);
    try {
      await api<AuthUser>("/api/profile/become-vendor", { method: "POST" });
      await refresh();
      toast.success("Your account is now a vendor account");
      router.push("/dashboard/vendor");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not switch to a vendor account");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Profile Settings"
        description="Keep your contact details and public business information up to date."
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Your details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="size-20 border border-border">
                  <AvatarImage src={image || undefined} alt={name || user.name} />
                  <AvatarFallback className="bg-primary/10 font-serif text-2xl text-primary">
                    {initials(name || user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => fileInput.current?.click()}
                    >
                      {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
                      {uploading ? "Uploading…" : "Change photo"}
                    </Button>
                    {image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setImage("")}
                      >
                        <Trash2 /> Remove
                      </Button>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    JPG, PNG, WEBP or GIF up to 5 MB. Save changes after uploading.
                  </p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => void pickImage(event.target.files?.[0])}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      readOnly
                      className="h-10 bg-muted/50 pl-9 text-muted-foreground"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Email changes are handled by the sign-in provider.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+1 555 010 2030"
                    maxLength={30}
                  />
                </div>
                {user.role === "vendor" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(event) => setBusinessName(event.target.value)}
                      placeholder="Blooms & Co."
                      maxLength={120}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio">
                  {user.role === "vendor" ? "About your business" : "About you"}
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  maxLength={600}
                  placeholder={
                    user.role === "vendor"
                      ? "Tell couples what makes your service special…"
                      : "A short note about your wedding plans…"
                  }
                />
                <p className="text-[11px] text-muted-foreground">{bio.length}/600 characters</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button type="submit" disabled={saving || uploading}>
                  {saving ? <Loader2 className="animate-spin" /> : <Save />}
                  {saving ? "Saving…" : "Save changes"}
                </Button>
                <p className="text-[11px] text-muted-foreground">
                  Role and subscription can never be changed from this form.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Account summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <span className="inline-flex items-center gap-1.5 font-semibold capitalize">
                  <UserRound size={14} className="text-primary" /> {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-semibold">{formatDate(user.createdAt)}</span>
              </div>
              {user.role === "vendor" && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold capitalize">
                    {user.subscriptionPlan === "premium" ? (
                      <BadgeCheck size={14} className="text-[#c9a227]" />
                    ) : (
                      <ShieldCheck size={14} className="text-muted-foreground" />
                    )}
                    {user.subscriptionPlan || "free"}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    user.isBlocked
                      ? "bg-rose-50 text-rose-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {user.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </CardContent>
          </Card>

          {user.role === "customer" && (
            <Card className="border-primary/25 bg-gradient-to-br from-accent/80 to-card">
              <CardContent className="p-5">
                <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Store size={18} />
                </span>
                <h3 className="mt-3 font-serif text-xl font-bold">Are you a wedding pro?</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  Switch this account to a vendor profile to publish services and receive
                  booking requests. This is only possible before your first booking.
                </p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  disabled={upgrading}
                  onClick={() => void becomeVendor()}
                >
                  {upgrading ? <Loader2 className="animate-spin" /> : <Briefcase />}
                  {upgrading ? "Switching…" : "Become a vendor"}
                  {!upgrading && <ArrowRight />}
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Privacy note
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
              Your email is only shared with a vendor after you send them a booking request.
              Vendor phone numbers are never shown publicly unless the vendor adds them to their
              own listing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
