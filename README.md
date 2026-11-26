# WedPlan Client

The WedPlan web application: a responsive, role-based wedding marketplace built with
**Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**,
**ShadCN/Base UI** and **Framer Motion**.

> API repository: <https://github.com/mdsafat980-byte/WedPlan-Wedding-Planning-Platform-server>
> Live site: <https://wedplan-client-safat1.vercel.app>
> API: <https://wedplan-api-ngt2.onrender.com> (production environment setup is pending).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. The Express API must be running at the URL in
`NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Use the same hostname (`localhost` or `127.0.0.1`) for the client and API. Mixing them makes
the browser treat the auth cookie as cross-site and the session will not persist.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build, including type checking |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Routes

### Public

| Route | Description |
| --- | --- |
| `/` | Animated landing page with featured services and categories |
| `/services` | Searchable, filterable, paginated marketplace |
| `/services/[id]` | Gallery, vendor details, related services and booking form |
| `/auth/login` | Email/password + Google sign-in, demo account shortcuts |
| `/auth/register` | Customer/vendor role selection and account creation |
| `/auth/callback` | OAuth return handler (vendor onboarding for Google users) |

### Customer dashboard (`/dashboard/customer`)

- Overview with booking statistics and upcoming accepted events.
- `/my-bookings` — track and cancel pending requests.

### Vendor dashboard (`/dashboard/vendor`)

- Overview with listing, booking and subscription statistics.
- `/my-services` and `/my-services/[id]` — manage and edit listings.
- `/add-service` — create a listing with up to 8 images.
- `/bookings` — accept or decline pending requests.
- `/subscription` — Free vs Premium plan and Stripe checkout.
- `/payment-success`, `/payment-cancel` — Stripe return pages.

### Admin dashboard (`/dashboard/admin`)

- `/` — platform statistics, review queue and recent transactions.
- `/manage-users` — search, filter, block and unblock accounts.
- `/manage-services` — approve, reject, pause, activate and delete listings.
- `/transactions` — read-only Stripe transaction ledger.

### Shared

- `/dashboard/profile` — name, phone, bio, business name and avatar; customer-to-vendor
  conversion for unused accounts.

## Authentication flow

1. **Better Auth** runs inside the Express API at `/api/auth/*` and stores users, sessions and
   OAuth accounts in MongoDB.
2. The client uses `authClient.useSession()` for session state and route guards.
3. For API calls, `authClient.token()` returns a short-lived JWT signed by Better Auth. The
   wrapper in `src/lib/api.ts` caches the token, attaches `Authorization: Bearer <token>` and
   retries once after a `401`.
4. The API verifies the JWT against the Better Auth JWKS endpoint and loads the live user, so
   roles, blocks and subscriptions are enforced server-side.
5. Dashboard route guards are a UX layer only. Every protected API independently checks the
   role and account state.

Registration passes a one-time `signupRole` value (`customer` or `vendor`). The server maps it
to `role` in a Better Auth database hook; the `role` field itself is not client-writable.
Google sign-ups start as customers and can call `POST /api/profile/become-vendor` once if the
account has no activity.

## Project structure

```text
src/
├─ app/
│  ├─ page.tsx                  Landing page
│  ├─ services/                 Marketplace and service details
│  ├─ auth/                     Login, register, OAuth callback
│  └─ dashboard/                Role-based dashboard pages
├─ components/
│  ├─ ui/                       ShadCN/Base UI primitives
│  ├─ dashboard/                Dashboard shell pieces and service form
│  ├─ auth-provider.tsx         Session context and logout
│  ├─ booking-form.tsx          Customer booking request form
│  ├─ site-header.tsx           Responsive public navigation
│  ├─ site-footer.tsx           Public footer
│  ├─ service-card.tsx          Marketplace card
│  └─ status-badge.tsx          Shared status pill
└─ lib/
   ├─ api.ts                    Authenticated fetch wrapper + upload helper
   ├─ auth-client.ts            Better Auth client configuration
   ├─ constants.ts              Categories, formatting, initials
   └─ types.ts                  Shared API types
```

## UI notes

- Theme tokens live in `src/app/globals.css` (warm ivory, rose and gold wedding palette).
- Fonts: Playfair Display for headings and DM Sans for body text.
- All user feedback uses Sonner toasts; there are no `alert()` or `confirm()` calls.
- Every data page implements loading skeletons, empty states and retryable error states.
- Framer Motion is used on the landing page (`Reveal`, hero and section animations).
- Images are rendered with plain `<img>` because vendor uploads can come from ImgBB or the
  local API host; the remote host is not known at build time.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Express API origin used for auth and data requests |

Never commit `.env.local`. Only `.env.example` is tracked.

## Deployment

1. Import this repository into Vercel.
2. Set `NEXT_PUBLIC_API_URL` to the deployed Render API URL.
3. Deploy, then set the API's `CLIENT_URL` to the Vercel deployment origin and redeploy
   the API if needed.
4. Verify registration, login, booking and role-protected dashboards against the hosted API.

The client has no public live URL until the API is deployed and this environment variable is
configured. Never commit production credentials.
