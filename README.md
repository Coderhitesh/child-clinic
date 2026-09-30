# Clinic System

Two apps, one bundle.

```
backend/    Express + MongoDB + Redis + Bull API      (see backend/README.md)
frontend/   Next.js 14 website, patient dashboard,    (see frontend/README.md)
            admin console — JavaScript, no TypeScript
```

## Start

```bash
# terminal 1
cd backend
npm install
cp .env.example .env          # Mongo URI, Redis URL, JWT secrets, Razorpay keys
npm run seed                  # optional sample data
npm run dev

# terminal 2
cd frontend
npm install
cp .env.example .env.local    # point NEXT_PUBLIC_API_URL at the backend, e.g. http://localhost:5000/api/v1
npm run dev                   # http://localhost:3000
```

## Roles

| Role | Lands on | Can do |
| --- | --- | --- |
| `superadmin` | `/admin` | Everything, across every clinic |
| `clinic_admin` | `/admin` | Own clinics: appointments, slots, patients, doctors, staff, coupons, reports |
| `receptionist` | `/admin` | Appointments, slots, patients, payments, enquiries |
| `doctor` | `/admin` | Own appointments, patients, prescriptions, slots |
| `patient` | `/dashboard` | Own and family appointments, prescriptions, videos, profile |

Route access is enforced twice: `frontend/src/middleware.js` gates on the role cookie before the page
loads, and the backend enforces it again with `protect` + `restrictTo` on every route.

## Recently added

- **Walk-in booking** — `/admin/appointments/new` for the front desk: clinic and doctor, a free slot
  or simply "now", an existing patient found by name/phone or a new one registered inline, coupon,
  and cash marked collected on the spot. The visit is confirmed immediately and tagged **Walk-in** in
  the appointments list. Backed by `POST /appointments/walk-in`, which creates a slot when the grid
  has none free.

- **File uploads** — `POST /api/v1/uploads` (multer, 8 MB, images + PDF) storing to `backend/uploads/YYYY-MM/`
  and served at `/uploads`. Every `image` field in the admin, and both patient-document dialogs, now upload
  a file and keep a "paste a link" fallback. Swap the multer storage engine for S3/Cloudinary and nothing
  else changes.
- **Forgot password** — `POST /auth/forgot-password` emails a 30-minute one-time link (hashed in the DB,
  and the endpoint always answers 200 so it can't be used to probe for accounts); `POST /auth/reset-password`
  consumes it, bumps `refreshTokenVersion` to kill other sessions and signs the user straight in.
  Pages at `/forgot-password` and `/reset-password`.
- **Family members can be removed** — `DELETE /patients/:id`. A record with visit history is archived so
  prescriptions keep resolving; one with none is deleted outright; upcoming appointments block both.
- **Appointment reminders** — a Bull repeatable job sweeps every 15 minutes and notifies anyone whose visit
  starts within `REMINDER_HOURS_BEFORE` (default 24). `reminderSentAt` on the appointment makes it idempotent.
  Starts with the server, or run a one-off sweep with `npm run reminders`. Cancellations now send a proper
  cancellation notice instead of reusing the confirmation template.
- **Patients report CSV** — `/reports/patients?format=csv`, with the export button in the reports screen.
- **Doctor day list** — `/admin/my-day`: the consulting list in time order with seen / no-show actions,
  visible to doctors and receptionists.
- **Tests** — `npm test` in both apps. Backend: 20 Jest tests over slot generation, coupon maths and guards,
  JWT round-trips and role gating (no Mongo or Redis needed). Frontend: 19 tests over the formatting helpers
  and the booking wizard store.

## Still not built

- Multi-language and dark mode — both are real projects rather than additions, and neither was specced.
- Razorpay is the only gateway wired into checkout, though the webhook route is gateway-agnostic.
- WhatsApp delivery: the notification worker has the hook, no provider is plugged in.
- No Docker setup (skipped deliberately).
