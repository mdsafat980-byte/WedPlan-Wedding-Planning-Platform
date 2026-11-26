export type Role = "customer" | "vendor" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  isBlocked?: boolean;
  businessName?: string;
  phone?: string;
  bio?: string;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpiresAt?: string | null;
  createdAt?: string;
};

export type ServiceVendor = {
  id: string;
  name: string;
  businessName: string;
  image: string;
  isPremium: boolean;
};

export type Service = {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  rejectionReason?: string;
  vendor: ServiceVendor | null;
  createdAt: string;
  updatedAt?: string;
  related?: Service[];
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type BookingStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  serviceId: string;
  vendorId: string;
  customerId: string;
  eventDate: string;
  eventLocation: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
  service: {
    id: string;
    serviceName: string;
    category: string;
    price: number;
    location: string;
    images: string[];
  } | null;
  customer: {
    id: string;
    name: string;
    email: string;
    image: string;
  } | null;
  vendor: {
    id: string;
    name: string;
    businessName: string;
    image: string;
    isPremium: boolean;
  } | null;
};

export type VendorStats = {
  totalServices: number;
  activeServices: number;
  pendingBookings: number;
  acceptedBookings: number;
  pendingServices: number;
  plan: "free" | "premium";
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  freeLimit: number;
  canPublishMore: boolean;
  businessName: string;
};

export type CustomerStats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
};

export type AdminStats = {
  users: number;
  vendors: number;
  customers: number;
  totalServices: number;
  pendingServices: number;
  transactions: number;
  paidTransactions: number;
  revenue: number;
};

export type Transaction = {
  id: string;
  vendor: {
    id: string;
    name: string;
    email: string;
    businessName: string;
  } | null;
  plan: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired" | "refunded";
  stripeSessionId: string;
  stripeSubscriptionId: string;
  createdAt: string;
  paidAt: string | null;
};

export type SubscriptionInfo = {
  plan: "free" | "premium";
  subscriptionPlan: "free" | "premium";
  subscriptionExpiresAt: string | null;
  activeServices: number;
  freeLimit: number;
  premium: {
    price: number;
    currency: string;
    interval: string;
    features: string[];
  };
  stripeReady: boolean;
};
