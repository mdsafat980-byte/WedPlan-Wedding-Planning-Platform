import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Camera,
  Church,
  Flower2,
  Heart,
  Palette,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ServiceCard } from "@/components/service-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/constants";
import { fetchPublic } from "@/lib/server-api";
import type { Paginated, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

const categoryIcons = [Camera, Church, Flower2, Utensils, Palette, Shirt];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified professionals",
    text: "Every published service is reviewed by our team before it reaches couples.",
  },
  {
    icon: Search,
    title: "Thoughtful discovery",
    text: "Search by category, location and price to find the right team without the noise.",
  },
  {
    icon: CalendarCheck,
    title: "Simple booking requests",
    text: "Send your date and details in one form, then track every response in your dashboard.",
  },
  {
    icon: Sparkles,
    title: "Built for real weddings",
    text: "From intimate elopements to 200-guest celebrations, plan at your own pace.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your free account",
    text: "Tell us whether you are planning a wedding or offering wedding services.",
  },
  {
    number: "02",
    title: "Discover and compare",
    text: "Browse approved vendors, filter by your date and location, and save your favourites.",
  },
  {
    number: "03",
    title: "Request and confirm",
    text: "Send a booking request, chat through the details and track the status in your dashboard.",
  },
];

const testimonials = [
  {
    name: "Sofia & James",
    location: "Sonoma, California",
    quote:
      "We found our venue, florist and photographer in one evening. Having every request in one dashboard made the whole process feel calm.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Priya & Arjun",
    location: "Austin, Texas",
    quote:
      "The filters actually work. We compared three florists by price and location, sent requests, and heard back the same day.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Daniel & Chris",
    location: "Portland, Oregon",
    quote:
      "As a vendor, the dashboard is refreshingly simple. I can see every request, accept the right dates and keep my listings current.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

export default async function HomePage() {
  const data = await fetchPublic<Paginated<Service>>("/api/services?limit=6&sort=newest");
  const featured = data?.items ?? [];

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />

      <section className="wedding-gradient relative overflow-hidden">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="page-container grid min-h-[620px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <Reveal className="relative z-10 max-w-xl">
            <p className="eyebrow">Plan with heart</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.03] tracking-tight text-foreground sm:text-6xl lg:text-[4.4rem]">
              Your beautiful day,
              <br />
              <span className="italic text-primary">beautifully planned.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              Discover trusted wedding professionals, compare real services and
              request bookings — all in one calm, considered place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services">
                <Button size="lg" className="h-11 rounded-full px-6 text-sm">
                  Explore wedding services <ArrowRight />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="h-11 rounded-full px-6 text-sm">
                  How WedPlan works
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="flex -space-x-2">
                  {testimonials.map((person) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={person.name}
                      src={person.image}
                      alt=""
                      className="size-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </span>
                Loved by 2,400+ couples
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Star size={15} fill="#c9a227" className="text-[#c9a227]" /> 4.9 average rating
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="relative mx-auto max-w-[520px]">
              <div className="absolute -left-4 -top-4 size-24 rounded-full border border-primary/20" />
              <div className="overflow-hidden rounded-[2rem] border-8 border-white/70 shadow-[0_30px_80px_rgba(61,42,39,0.18)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85"
                  alt="Newly married couple celebrating outdoors"
                  className="h-[430px] w-full object-cover sm:h-[520px]"
                />
              </div>
              <div className="absolute -bottom-6 -left-2 rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur sm:-left-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Next celebration
                </p>
                <p className="mt-1 font-serif text-lg font-bold">Glass Garden Estate</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarCheck size={13} /> Booking request accepted
                </p>
              </div>
              <div className="absolute -right-2 top-8 hidden rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur sm:block">
                <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Heart size={13} fill="currentColor" /> 180 guests
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-container py-20">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Find your perfect team</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
              Explore by category
            </h2>
          </div>
          <Link
            href="/services"
            className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            View all services <ArrowRight size={16} />
          </Link>
        </Reveal>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => {
            const Icon = categoryIcons[index];
            return (
              <Reveal key={category.name} delay={index * 0.05}>
                <Link
                  href={`/services?category=${encodeURIComponent(category.name)}`}
                  className="group relative block h-64 overflow-hidden rounded-2xl"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <span className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 font-serif text-xl font-bold">{category.name}</h3>
                    <p className="mt-1 text-xs leading-5 text-white/75">{category.description}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-[#f7f1eb] py-20">
        <div className="page-container">
          <Reveal className="text-center">
            <p className="eyebrow">Curated for you</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
              Featured wedding services
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              A selection of approved, active listings from vendors ready to make
              your celebration unforgettable.
            </p>
          </Reveal>

          {featured.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((service, index) => (
                <Reveal key={service.id} delay={index * 0.05}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <Sparkles className="mx-auto text-primary" />
              <h3 className="mt-3 font-serif text-xl font-bold">
                New services are being reviewed
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our team approves every listing before it goes live. Please check back
                shortly or browse all available services.
              </p>
              <Link href="/services" className="mt-5 inline-block">
                <Button>Browse services</Button>
              </Link>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/services">
              <Button variant="outline" className="rounded-full px-6">
                See all wedding services <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="page-container py-20">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#2f211f] text-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 sm:p-12">
            <Reveal>
              <p className="eyebrow text-[#e7a99f]">Why choose WedPlan</p>
              <h2 className="mt-4 font-serif text-4xl font-bold leading-tight">
                Everything you need for a celebration to remember.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#c9b8b0]">
                We bring discovery, booking and vendor management together so you can
                spend less time chasing details and more time enjoying the moment.
              </p>
            </Reveal>
            <div className="mt-9 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <Reveal key={benefit.title} delay={index * 0.07}>
                  <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#e7a99f]">
                    <benefit.icon size={19} />
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-bold">{benefit.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#c9b8b0]">{benefit.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div className="min-h-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85"
              alt="Elegant wedding reception table"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f7f1eb] py-20">
        <div className="page-container">
          <Reveal className="text-center">
            <p className="eyebrow">How WedPlan works</p>
            <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
              Three calm steps to your big day
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-sm">
                  <span className="font-serif text-4xl font-bold text-primary/30">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-container py-20">
        <Reveal className="text-center">
          <p className="eyebrow">Real stories</p>
          <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight">
            Couples who planned with WedPlan
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.07}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-1 text-[#c9a227]">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} size={14} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-bold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="page-container pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
            <div className="absolute -left-10 -top-10 size-40 rounded-full border border-white/15" />
            <div className="absolute -bottom-16 -right-10 size-56 rounded-full border border-white/15" />
            <p className="eyebrow text-white/70">Start planning today</p>
            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight">
              The right people, in one beautiful place.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80">
              Create a free account to send booking requests, save your favourite
              vendors and keep every detail in one dashboard.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/auth/register">
                <Button size="lg" className="h-11 rounded-full bg-white px-6 text-primary hover:bg-white/90">
                  Create free account
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  Browse services
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
