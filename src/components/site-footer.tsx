import Link from "next/link";
import { Heart, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L3 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L7.2 3.8H5.4L17.8 20Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-[#2f211f] text-[#f4e9e3]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Heart size={16} fill="currentColor" />
            </span>
            <span className="font-serif text-xl font-bold">WedPlan</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#c9b8b0]">
            Discover trusted wedding professionals, compare services and plan a
            celebration that feels entirely yours.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`WedPlan on ${social.label}`}
                className="grid size-9 place-items-center rounded-full border border-white/15 text-[#e7d8d1] transition hover:border-primary hover:text-white"
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#e7d8d1]">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-[#c9b8b0]">
            <li><Link className="hover:text-white" href="/">Home</Link></li>
            <li><Link className="hover:text-white" href="/services">Browse services</Link></li>
            <li><Link className="hover:text-white" href="/#how-it-works">How it works</Link></li>
            <li><Link className="hover:text-white" href="/auth/register">Become a vendor</Link></li>
            <li><Link className="hover:text-white" href="/auth/login">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#e7d8d1]">
            Categories
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-[#c9b8b0]">
            {CATEGORIES.slice(0, 5).map((category) => (
              <li key={category.name}>
                <Link
                  className="hover:text-white"
                  href={`/services?category=${encodeURIComponent(category.name)}`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#e7d8d1]">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-[#c9b8b0]">
            <li className="flex items-start gap-2.5">
              <Mail size={16} className="mt-0.5 text-primary" />
              hello@wedplan.com
            </li>
            <li className="flex items-start gap-2.5">
              <Phone size={16} className="mt-0.5 text-primary" />
              +1 (415) 555-0134
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 text-primary" />
              214 Rosewood Avenue, San Francisco, CA
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-[#a9968e] sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} WedPlan. All rights reserved.</p>
          <p>Made with care for couples and the people who make their day unforgettable.</p>
        </div>
      </div>
    </footer>
  );
}
