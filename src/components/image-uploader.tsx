"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function ImageUploader({
  value,
  onChange,
  label = "Profile image",
  shape = "circle",
  className,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  shape?: "circle" | "wide";
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      toast.error("Please choose a JPG, PNG, WEBP or GIF image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div
        className={`relative overflow-hidden border border-dashed border-border bg-muted ${
          shape === "circle" ? "size-20 rounded-full" : "h-32 w-full rounded-xl"
        }`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {shape === "circle" ? "Photo" : "No image"}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
            disabled={uploading}
          />
          <span className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-xs font-semibold hover:bg-muted">
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </span>
        </label>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => onChange("")}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
