export const CATEGORIES = [
  {
    name: "Photography & Videography",
    slug: "photography-videography",
    description: "Story-driven photographers and cinematic wedding films.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Wedding Venues",
    slug: "wedding-venues",
    description: "Garden estates, ballrooms and intimate ceremony spaces.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Decoration & Florist",
    slug: "decoration-florist",
    description: "Floral design, styling and installations for every moment.",
    image:
      "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Catering Services",
    slug: "catering-services",
    description: "Seasonal menus, grazing tables and full-service catering.",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Makeup & Styling",
    slug: "makeup-styling",
    description: "Bridal beauty, hair styling and on-the-day touch-ups.",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Wedding Fashion",
    slug: "wedding-fashion",
    description: "Gowns, tailoring and occasion wear for the whole party.",
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
  },
] as const;

export const CATEGORY_NAMES = CATEGORIES.map((category) => category.name);

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-stone-100 text-stone-600 border-stone-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  expired: "bg-stone-100 text-stone-600 border-stone-200",
  refunded: "bg-sky-50 text-sky-700 border-sky-200",
};

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function initials(name?: string) {
  if (!name) return "W";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
