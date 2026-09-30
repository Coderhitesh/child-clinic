# Clinic Frontend — Next.js 14 (JavaScript)

Public website + patient dashboard + full admin console for the Express/MongoDB clinic backend.
No TypeScript anywhere. Tailwind CSS, hand-rolled shadcn-style primitives on Radix, zustand for
state, a single axios instance, and Next.js middleware for route protection.

## Run it

```bash
npm install
cp .env.example .env.local     # then edit the values
npm run dev                    # http://localhost:3000
```

Backend must be running and reachable at `NEXT_PUBLIC_API_URL`.

### Environment

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base API URL including the version prefix, e.g. `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, used for SEO metadata |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key for the online-payment checkout |

## How it is wired

**Auth.** `src/lib/api.js` is the only axios instance. A request interceptor attaches the access
token; a response interceptor catches `401`, calls `/auth/refresh` once, queues the failed requests
and replays them. Tokens live in cookies (`cl_access`, `cl_refresh`, `cl_role`, `cl_user`) with a
sessionStorage mirror — cookies so that `src/middleware.js` can gate routes on the edge before any
JS loads.

**Middleware.** `/admin/*`, `/dashboard/*` and `/book` require a session. `/admin/*` additionally
checks the role against a per-section map (for example specialities, pages, announcements and
settings are superadmin-only). Staff who open `/dashboard` are pushed to `/admin`, and a signed-in
user who opens `/login` is pushed to their home.

**State.** `authStore` (session + a `can()` permission map), `bookingStore` (the five-step wizard),
`uiStore` (sidebar, city, dismissed banners).

**Services.** `src/services/index.js` wraps every backend route group — auth, specialities, clinics,
doctors, slots, appointments, payments, payment modes, coupons, patients, prescriptions, videos,
dashboard, reports, audit logs, categories, banners, popups, testimonials, CMS pages, blogs, FAQs,
contact submissions, header notifications, partners and website settings.

## What is in the app

**Website** — home, doctors browser with filters, doctor profile with a live slot picker, clinics,
specialities, blogs, FAQs, CMS pages at `/p/[slug]`, about, contact, and the five-step booking
wizard (doctor → date & time → patient → payment & coupon → review) with Razorpay handoff.

**Patient dashboard** (`/dashboard`) — overview, appointments with reschedule / cancel / pay-now,
family members with document attachments, prescriptions, care videos, profile.

**Admin console** (`/admin`) — overview, appointments and appointment detail (confirm, no-show,
cancel, reschedule, write prescription, collect or refund payment), slots with generate/block/
unblock, patients and patient detail, prescriptions, payments, videos, clinics, doctors,
specialities, staff accounts, coupons, enquiries, reports with CSV export, the whole CMS
(banners, popups, testimonials, categories, blogs, FAQs, partners, announcements, pages),
payment modes, website settings and audit logs.

## Backend behaviour worth knowing

The backend in this bundle includes the extra routes the console needs (`GET /slots`,
`GET /auth/users`, `PATCH /auth/users/:id`, `PATCH /auth/me`, `GET /prescriptions`) — see the
backend README for the full table. Against an older build of the API those five screens degrade:
the slot grid, the staff list, the prescriptions list and the profile editor will return 404.

- **`/slots/availability` still returns only free slots** and is what the public booking flow uses.
  The admin slot grid uses `GET /slots`, which returns every slot with its status, so open, held,
  booked and blocked are all visible on one screen.
- **Online payments are confirmed by the gateway webhook**, not by the browser. After checkout the
  UI refetches the appointment rather than assuming success.
- **Adding a doctor creates the login account and the profile in one step**, since `Doctor.user` is
  required. Clinic admins and receptionists are created from the staff screen.
- **Changing a password anywhere bumps `refreshTokenVersion`**, so other sessions are signed out.
- `paymentModeApi.get(clinicId)` returns the clinic override when one exists, otherwise the global
  default record.

## Layout

```
src/
  app/
    (site)/        public website + booking wizard
    (auth)/        login, register, OTP login
    dashboard/     patient area
    admin/         staff console
  components/
    ui/            button, input, dialog, table, tabs, select, …
    site/          header, footer, hero search, cards, testimonial rail
    admin/         app shell, data table, dynamic form, resource manager
  config/nav.js    sidebar groups per role
  lib/             api, server-api, token, utils, constants, razorpay
  services/        one wrapper per backend route group
  store/           auth, booking, ui
  middleware.js    cookie-based route + role gate
```

`ResourceManager` + `DynamicForm` drive every simple CRUD screen from a field schema, which is why
the CMS pages are a few dozen lines each.

## Tests

```bash
npm test
```

Jest with the Next transform — the formatting helpers in `src/lib/utils.js` and the booking wizard
store. Nothing hits the network, so it runs with the API down.
