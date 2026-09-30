# Clinic Backend — Multi-Clinic, Multi-Speciality System

Node.js + Express + MongoDB/Mongoose + Redis + Bull. RBAC: superadmin, clinic_admin, doctor, receptionist, patient.

## Setup
```
npm install
cp .env.example .env   # fill in real secrets
# needs local/remote MongoDB + Redis running
npm run dev
```

## Booking flow
Speciality → Clinic → Doctor → Date → Slot → Patient details → Confirm (payment is always taken at the clinic).

Slots are claimed atomically on booking; the fee is collected at the clinic and marked collected by staff.

## Structure
```
src/
  config/     mongo, redis, env
  models/     11 mongoose schemas
  middleware/ auth (JWT), rbac, clinic-scoping, audit log, rate limiters, error handler
  controllers/
  routes/
  services/   slot claim logic, prescription PDF, cache-aside helpers
  queues/     Bull queues: notifications, OTP delivery, prescription PDF generation
```

## SEO
Every public-facing content model — `Clinic`, `Doctor`, `Speciality`, `Category`, `CmsPage`, `Blog` —
carries a shared `seo` sub-object (`src/models/seoSchema.js`): `metaTitle`, `metaDescription`,
`metaKeywords`, `canonicalUrl`, `ogTitle`, `ogDescription`, `ogImage`, `robots`. Pass it as a
nested `seo: {...}` object in any create/update call — no extra endpoint needed, it's just a
schema field. `WebsiteSetting.seo` holds the site-wide fallback (used when a specific page has
no SEO set).

## Sitemap & robots.txt
- `GET /sitemap.xml` — dynamically generated from active clinics, doctors, specialities,
  published blogs, active CMS pages, and categories, plus a fixed set of static routes (home,
  about, contact, doctors, clinics, blogs, faqs, book-appointment). Cached in Redis for 1 hour;
  pass `?refresh=true` to force a rebuild. Uses `FRONTEND_BASE_URL` from `.env` to build absolute
  URLs — set this to your actual public site domain.
- `GET /robots.txt` — points crawlers at `${FRONTEND_BASE_URL}/sitemap.xml`.
- Both are served from the app root (not under `/api/v1`), matching standard SEO convention.
  If your frontend and this API live on different domains, reverse-proxy `/sitemap.xml` and
  `/robots.txt` from the frontend domain to this backend.

## Logo & branding management
`WebsiteSetting.branding` holds separate assets since real deployments almost always need
different crops: `logoHeader`, `logoFooter`, `logoMobile`, `logoDark` (for dark backgrounds),
`favicon`, `appleTouchIcon`. `playStoreUrl` / `appStoreUrl` sit alongside for app download links
in the footer/header.

## Website / CMS Management (`/api/v1/...`)
Public GETs need no auth; writes are superadmin/clinic_admin only unless noted.
- `categories` — CRUD, `type` enum: blog/video/service/general
- `banners` — hero + page banners, `GET /banners/active?placement=home_hero&pageSlug=...` for frontend
- `popups` — promotional popups, `GET /popups/active?page=home`
- `testimonials` — CRUD, optional clinic tag
- `coupons` — CRUD (superadmin/clinic_admin) + `POST /coupons/validate` (any logged-in user, preview discount). Coupons apply inside booking via `couponCode` field on `POST /appointments` — discount computed server-side, usage recorded when the booking is made. Fields: `discountType` (percentage/flat), `applicableClinics`/`applicableSpecialities` (empty = all), `usageLimitTotal`, `usageLimitPerUser`.
- `cms-pages` — privacy policy, terms, disclaimer, etc. `GET /cms-pages/slug/:slug` public.
- `blogs` — health/parenting blog posts, `isPublished` gate for public visibility, `GET /blogs/slug/:slug` increments view count.
- `faqs` — CRUD, optional speciality/category tag
- `contact-submissions` — `POST /` public (contact form), admin can list/respond/mark-spam. Auto-emails `ADMIN_NOTIFY_EMAIL`.
- `header-notifications` — top-of-site announcement bar. `GET /header-notifications/active` (public, date-window aware).
- `partners` — trusted-partner / brand logos, `type` enum distinguishes the two.
- `website-settings` — singleton doc: social links, contact info, SEO defaults, footer text, app store links. `GET /` public, `PUT /` superadmin only.

## Seed data
```
npm run seed
```
Creates: 1 superadmin, 2 specialities (Pediatrics, Gynecology), 2 clinics, 1 clinic_admin,
1 receptionist, 2 doctors (with user accounts + 3 days of generated slots), 1 sample
parent/patient account with a child profile, plus sample website content — a hero banner,
a testimonial, default website settings, a privacy-policy CMS page, an FAQ, a `WELCOME10`
coupon (10% off, capped ₹100), a header notification, and
a trusted-partner logo. Safe to re-run — skips records that already exist.

All seeded accounts use password: `Passw0rd!123`
- superadmin@example.com
- admin.downtown@example.com (clinic_admin)
- reception.downtown@example.com (receptionist)
- jane.doe@example.com / aisha.khan@example.com (doctor)
- rita.sharma@example.com (patient)

## Email + SMS
- **Email**: nodemailer, SMTP config via `EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASS` in `.env`. For Gmail use an App Password, port 587, `EMAIL_SECURE=false`.
- **SMS**: Fast2SMS via `FAST2SMS_API_KEY` in `.env`. OTP delivery tries Fast2SMS's dedicated `otp` route first, falls back to the quick-SMS `q` route with a plain-text message if that fails. Numbers are normalized to 10-digit Indian format (strips leading `+91`/`91`).
- If neither is configured, sends are skipped with a console warning — nothing crashes, jobs still complete.

## Reports (`/api/v1/reports`, superadmin + clinic_admin, clinic-scoped)
- `GET /appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv` — totals, by-status, by-clinic breakdown
- `GET /revenue?from=&to=&format=csv` — total revenue, by payment method, by clinic, by day
- `GET /doctor-performance?from=&to=&format=csv` — per-doctor totals/completed/cancelled/no-show/revenue
- `GET /patients?from=&to=` — new patient registrations by day (superadmin only)
Add `&format=csv` to any report to download instead of JSON (except patients report).

## Postman
Import `postman_collection.json` + `postman_environment.json`. Run `npm run seed` first, then
login as superadmin (`superadmin@example.com` / `Passw0rd!123`) — collection auto-saves
`accessToken` via test script on login/register.

## Not wired yet (stubs, by design for phase 1)
- WhatsApp provider (Email + SMS now wired; WhatsApp Cloud API/Twilio slot is marked in `notificationQueue.js`)
- Field-level encryption applied selectively (`utils/encryption.js` ready, call from controllers per-field as needed)
- Joi validation schemas (package installed, not yet wired into routes)

## Added for the frontend console

These routes were added on top of the original API so the admin console and patient dashboard can
work without local workarounds.

| Method | Path | Who | What it does |
| --- | --- | --- | --- |
| `GET` | `/slots` | superadmin, clinic_admin, receptionist, doctor | Full day (or range) of slots for a clinic + doctor, every status. Query: `clinicId`, `doctorId`, `date` or `from`/`to`, optional `status` (comma separated). `/slots/availability` is unchanged and still returns only free slots for public booking. |
| `GET` | `/auth/users` | superadmin, clinic_admin | Lists accounts. A clinic_admin only sees doctor and receptionist accounts within its own clinics. Query: `role`, `search`, `limit`. |
| `PATCH` | `/auth/users/:id` | superadmin, clinic_admin | Updates a staff account — name, email, phone, clinics, `isActive`, and `role` (superadmin only). Sending `password` resets it and bumps `refreshTokenVersion` so existing sessions die. |
| `PATCH` | `/auth/me` | any signed-in user | Self-service profile edit. Sending `newPassword` requires `currentPassword` and also bumps `refreshTokenVersion`. |
| `GET` | `/prescriptions` | superadmin, clinic_admin, doctor, receptionist | Lists prescriptions newest first with patient, doctor and clinic populated. Query: `clinic`, `doctor`, `patient`, `from`, `to`, `limit`. Clinic-scoped roles are restricted to their own clinics regardless of the query. |

`GET /prescriptions/patient/:patientId` now also populates doctor and clinic.

Three list endpoints also gained query support the console needs:

- `GET /clinics?includeInactive=true` and `GET /doctors?includeInactive=true` — so deactivated
  records stay editable in the admin instead of disappearing (the CRUD-factory resources already
  supported this flag).
- `GET /videos?patient=<id>` or `?patients=<id1,id2>` — returns only videos assigned to those
  patients, which is what the patient dashboard uses. `?includeInactive=true` works here too, and
  the speciality is now populated.

## Tests

```bash
npm test
```

Jest, no Mongo or Redis required: slot generation edge cases, coupon discount maths and every guard
that can reject a coupon, JWT round-trips, and the role middleware. Models are stubbed where a test
would otherwise need a database.

## Walk-in bookings

`POST /api/v1/appointments/walk-in` — superadmin, clinic_admin, receptionist, doctor.

```jsonc
{
  "clinicId": "…", "doctorId": "…",
  "date": "2026-09-14",          // optional, defaults to today
  "startTime": "16:20",          // optional, defaults to now
  "slotId": "…",                 // optional — pick an exact free slot instead
  "patient": { "_id": "…" },     // or a full patient object to register on the spot
  "symptoms": "Fever for 3 days",
  "couponCode": "FIRSTVISIT",    // optional, validated server-side
  "paymentMethod": "pay_at_clinic",
  "collectNow": true             // marks the payment collected at the desk
}
```

How the slot is chosen, in order: the `slotId` if one was sent, then the next free slot at or after
`startTime` on that date, and failing both an ad-hoc slot is created at `startTime` (length taken
from the doctor's shift at that clinic) and flagged `isWalkIn`. Either way the slot ends up `booked`,
so the day grid, reschedule and cancel flows behave exactly as they do for an online booking.

The appointment is created `confirmed` with `source: 'walk_in'`, fees and coupons go through the same
server-side rules as the public flow, and `GET /appointments?source=walk_in` filters for them.
Clinic-scoped staff can only book at a clinic they belong to.
