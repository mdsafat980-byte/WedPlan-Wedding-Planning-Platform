"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ServiceGallery({ images, name }: { images: string[]; name: string }) {
  const gallery = images.length ? images : ["/placeholder-service.svg"];
  const [active, setActive] = useState(0);
  const current = gallery[Math.min(active, gallery.length - 1)];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={`${name} — photo ${active + 1}`}
          className="h-[320px] w-full object-cover sm:h-[440px]"
        />
      </div>
      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "overflow-hidden rounded-xl border-2 transition",
                active === index ? "border-primary" : "border-transparent opacity-80 hover:opacity-100",
              )}
              aria-label={`Show photo ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-20 w-full object-cover sm:h-24" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
