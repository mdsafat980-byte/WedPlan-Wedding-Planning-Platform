import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/constants";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  const image = service.images?.[0] || "/placeholder-service.svg";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_30px_rgba(76,54,49,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(76,54,49,0.12)]">
      <div className="relative h-56 overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={service.serviceName}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <Badge className="border-0 bg-background/95 text-foreground shadow-sm">
            {service.category}
          </Badge>
          {service.vendor?.isPremium && (
            <Badge className="border-0 bg-[#c9a227] text-white shadow-sm">
              <Star size={11} fill="currentColor" /> Premium
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl font-bold leading-tight text-foreground">
            {service.serviceName}
          </h3>
          <p className="shrink-0 text-right text-lg font-bold text-primary">
            {formatPrice(service.price)}
          </p>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} /> {service.location}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground/80">
          by {service.vendor?.businessName || service.vendor?.name || "WedPlan vendor"}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/80 pt-4">
          <span className="text-xs font-medium text-muted-foreground">
            {service.vendor?.isPremium ? "Premium vendor" : "Verified vendor"}
          </span>
          <Link
            href={`/services/${service.id}`}
            className="rounded-full border border-primary/30 px-3.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
