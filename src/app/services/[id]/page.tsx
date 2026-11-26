import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Crown,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceGallery } from "@/components/service-gallery";
import { BookingForm } from "@/components/booking-form";
import { ServiceCard } from "@/components/service-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/constants";
import { fetchPublic } from "@/lib/server-api";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const service = await fetchPublic<Service>(`/api/services/${id}`);
  if (!service) return { title: "Service not found" };
  return {
    title: service.serviceName,
    description: service.description.slice(0, 160),
  };
}

export default async function ServiceDetailsPage({ params }: { params: Params }) {
  const { id } = await params;
  const service = await fetchPublic<Service>(`/api/services/${id}`);

  if (!service) {
    return (
      <main className="flex min-h-screen flex-col">
        <SiteHeader />
        <section className="page-container flex flex-1 flex-col items-center justify-center py-24 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={28} />
          </span>
          <h1 className="mt-5 font-serif text-4xl font-bold">Service not available</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            This service may have been removed, paused by the vendor, or is still waiting
            for admin approval. Only approved and active services can be viewed or booked.
          </p>
          <Link href="/services" className="mt-6">
            <Button>
              <ArrowLeft /> Back to all services
            </Button>
          </Link>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const vendorName = service.vendor?.businessName || service.vendor?.name || "WedPlan vendor";

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="border-b border-border/70 bg-[#fbf5f0]">
        <div className="page-container py-6">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary">Services</Link>
            <span>/</span>
            <Link
              href={`/services?category=${encodeURIComponent(service.category)}`}
              className="hover:text-primary"
            >
              {service.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{service.serviceName}</span>
          </nav>
        </div>
      </section>

      <section className="page-container py-10">
        <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <ServiceGallery images={service.images} name={service.serviceName} />

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                  {service.category}
                </Badge>
                {service.vendor?.isPremium && (
                  <Badge className="border-0 bg-[#c9a227] text-white">
                    <Crown size={11} /> Premium vendor
                  </Badge>
                )}
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <ShieldCheck size={11} /> Admin approved
                </Badge>
              </div>

              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                {service.serviceName}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} /> {service.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={15} /> Listed {new Date(service.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1 text-[#c9a227]">
                  <Star size={14} fill="currentColor" /> New on WedPlan
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-card p-6">
                <h2 className="font-serif text-2xl font-bold">About this service</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                <h2 className="font-serif text-2xl font-bold">Meet the vendor</h2>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  {service.vendor?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.vendor.image}
                      alt={vendorName}
                      className="size-16 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="grid size-16 place-items-center rounded-full bg-primary/10 font-serif text-xl font-bold text-primary">
                      {vendorName.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="flex-1">
                    <p className="font-serif text-xl font-bold">{vendorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.vendor?.name || "Wedding professional"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">Verified profile</Badge>
                      {service.vendor?.isPremium && (
                        <Badge variant="outline" className="border-[#c9a227]/40 bg-[#c9a227]/10 text-[#8a6d0b]">
                          Premium member
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link href={`/services?search=${encodeURIComponent(vendorName)}`}>
                    <Button variant="outline" size="sm">More from this vendor</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_18px_45px_rgba(76,54,49,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Starting from
              </p>
              <p className="mt-1 font-serif text-4xl font-bold text-primary">
                {formatPrice(service.price)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Final pricing is confirmed with the vendor based on your event.
              </p>

              <dl className="mt-5 space-y-3 border-y border-border py-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-right font-semibold">{service.category}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="text-right font-semibold">{service.location}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Vendor</dt>
                  <dd className="text-right font-semibold">{vendorName}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Booking</dt>
                  <dd className="text-right font-semibold">Request based</dd>
                </div>
              </dl>

              <a href="#book" className="mt-5 block">
                <Button className="w-full">Request this booking</Button>
              </a>
              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
                <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                You will not be charged through WedPlan. The vendor confirms availability
                after reviewing your request.
              </p>
            </div>

            <div className="mt-5">
              <BookingForm
                serviceId={service.id}
                serviceName={service.serviceName}
                vendorName={vendorName}
              />
            </div>
          </aside>
        </div>
      </section>

      {service.related && service.related.length > 0 && (
        <section className="bg-[#f7f1eb] py-16">
          <div className="page-container">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">You may also like</p>
                <h2 className="mt-2 font-serif text-3xl font-bold">
                  More in {service.category}
                </h2>
              </div>
              <Link
                href={`/services?category=${encodeURIComponent(service.category)}`}
                className="text-sm font-bold text-primary hover:underline"
              >
                View category
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.related.map((related) => (
                <ServiceCard key={related.id} service={related} />
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
