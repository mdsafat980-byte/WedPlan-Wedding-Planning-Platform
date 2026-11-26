import Link from "next/link";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-14">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Heart size={18} fill="currentColor" />
          </span>
          <span className="font-serif text-2xl font-bold">WedPlan</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} /> Secure authentication by Better Auth
          </span>
          <Link href="/services" className="font-semibold text-primary hover:underline">
            Browse services
          </Link>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1400&q=85"
          alt="Wedding ceremony aisle"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2f211f]/90 via-[#2f211f]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles size={13} /> Plan with heart
          </span>
          <h2 className="mt-4 max-w-md font-serif text-4xl font-bold leading-tight">
            Every detail, every vendor, one calm place.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
            Join couples and wedding professionals who plan, book and manage their
            celebrations with WedPlan.
          </p>
        </div>
      </div>
    </div>
  );
}
