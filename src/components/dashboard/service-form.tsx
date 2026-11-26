"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImagePlus, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, uploadImage } from "@/lib/api";
import { CATEGORY_NAMES } from "@/lib/constants";
import type { Service } from "@/lib/types";

type Props = {
  initial?: Service;
  onSaved?: (service: Service) => void;
};

export function ServiceForm({ initial, onSaved }: Props) {
  const router = useRouter();
  const [serviceName, setServiceName] = useState(initial?.serviceName || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [location, setLocation] = useState(initial?.location || "");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = 8 - images.length;
    if (remaining <= 0) {
      toast.error("A service can have up to 8 images");
      return;
    }
    setUploading(true);
    try {
      const chosen = Array.from(files).slice(0, remaining);
      const uploaded: string[] = [];
      for (const file of chosen) {
        if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
          toast.error(`${file.name} is not a supported image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`);
          continue;
        }
        uploaded.push(await uploadImage(file));
      }
      if (uploaded.length) {
        setImages((current) => [...current, ...uploaded]);
        toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Please upload at least one service image");
      return;
    }
    if (!category) {
      setError("Please choose a service category");
      return;
    }
    if (description.trim().length < 30) {
      setError("Description must be at least 30 characters");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        serviceName: serviceName.trim(),
        category,
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
        images,
      };
      const saved = initial
        ? await api<Service>(`/api/vendor/services/${initial.id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await api<Service>("/api/vendor/services", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      toast.success(
        initial
          ? "Service updated and sent for review"
          : "Service submitted for admin review",
      );
      onSaved?.(saved);
      router.push("/dashboard/vendor/my-services");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save the service";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-serif text-xl font-bold">Service details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="serviceName">Service name *</Label>
            <Input
              id="serviceName"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="The Glass Garden Estate"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(value) => setCategory(String(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price">Starting price (USD) *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="2500"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Sonoma, California"
              required
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the experience, what is included, capacity and anything that makes this service special…"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              {description.trim().length}/30 characters minimum
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold">Service images *</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload 1–8 images. The first image is used as the cover.
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading || images.length >= 8}
              onChange={(event) => {
                void handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-semibold hover:bg-muted">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              {uploading ? "Uploading…" : "Add images"}
            </span>
          </label>
        </div>

        {images.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No images uploaded yet
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="group relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`Service ${index + 1}`} className="h-28 w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving || uploading}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {saving ? "Saving…" : initial ? "Save changes" : "Submit for review"}
        </Button>
        <Link href="/dashboard/vendor/my-services">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <p className="text-xs text-muted-foreground">
          {initial
            ? "Editing a listing sends it back for admin review."
            : "New listings are reviewed by an admin before going live."}
        </p>
      </div>
    </form>
  );
}
