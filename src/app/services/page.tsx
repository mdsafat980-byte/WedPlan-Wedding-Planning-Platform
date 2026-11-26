import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, SearchX, ServerCrash } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceCard } from "@/components/service-card";
import { ServiceFilters } from "@/components/service-filters";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { fetchPublic } from "@/lib/server-api";
import type { Paginated, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Wedding Services",
  description:
    "Browse approved wedding venues, photographers, florists, caterers, makeup artists and fashion vendors.",
};

type SearchParams = Promise<{
  search?: string;
  category?: string;
  location?: string;
  sort?: string;
  page?: string;
}>;

export default async function ServicesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.location) query.set("location", params.location);
  if (params.sort) query.set("sort", params.sort);
  if (params.page) query.set("page", params.page);
  query.set("limit", "9");

  const data = await fetchPublic<Paginated<Service>>(`/api/services?${query.toString()}`);
  const services = data?.items ?? [];
  const isError = data === null;

  const pageLink = (page: number) => {
    const next = new URLSearchParams(query);
    next.set("page", String(page));
    return `/services?${next.toString()}`;
  };

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="wedding-gradient border-b border-border/70">
        <div className="page-container py-12 sm:py-16">
          <Reveal>
            <p className="eyebrow">Browse with confidence</p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Wedding services for every celebration
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Every listing below has been reviewed and approved by WedPlan. Search by
              name, narrow by category or location, and sort by price to find the right
              fit.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="page-container py-8">
        <ServiceFilters
          initialSearch={params.search}
          initialCategory={params.category}
          initialLocation={params.location}
          initialSort={params.sort}
        />

        <div className="mt-7 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {isError ? (
              "We could not load services right now."
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{services.length}</span> of{" "}
                <span className="font-semibold text-foreground">{data?.total ?? 0}</span> approved
                services
              </>
            )}
          </p>
          {params.category && (
            <p className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary sm:block">
              {params.category}
            </p>
          )}
        </div>

        {isError ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <ServerCrash className="text-primary" size={34} />
            <h2 className="mt-3 font-serif text-2xl font-bold">Services are unavailable</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              The API could not be reached. Please refresh the page or try again in a
              moment.
            </p>
            <Link href="/services" className="mt-5">
              <Button>Try again</Button>
            </Link>
          </div>
        ) : services.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <SearchX className="text-primary" size={34} />
            <h2 className="mt-3 font-serif text-2xl font-bold">No services found</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try a different search term, category or location. New vendors are added
              every week.
            </p>
            <Link href="/services" className="mt-5">
              <Button variant="outline">Clear all filters</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Reveal key={service.id} delay={index * 0.04}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>

            {(data?.pages ?? 1) > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                {data && data.page > 1 && (
                  <Link href={pageLink(data.page - 1)}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft /> Previous
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {data?.page ?? 1} of {data?.pages ?? 1}
                </span>
                {data && data.page < data.pages && (
                  <Link href={pageLink(data.page + 1)}>
                    <Button variant="outline" size="sm">
                      Next <ArrowRight />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
