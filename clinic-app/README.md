# HealthBridge — patient app (Expo / React Native)

The patient-facing half of the clinic system as a native app: browse, book, and keep your
family's records. Same layout, palette and features as the website — the admin console is
deliberately not here, staff keep using the web console.

## Run it — this is a development build, not Expo Go

Firebase messaging, Razorpay and notifee all ship native code, so Expo Go cannot run this app.
Build a dev client once, then iterate with fast refresh as usual.

```bash
npm install
cp .env.example .env                 # API URL + Razorpay key id

# drop your Firebase files in the project root first:
#   google-services.json             (Android, from the Firebase console)
#   GoogleService-Info.plist         (iOS)

npx expo prebuild --clean            # generates android/ and ios/
npx expo run:android                 # or: npx expo run:ios
# afterwards, day to day:
npm start                            # expo start --dev-client
```

Cloud builds instead of local ones:

```bash
npx eas build --profile development --platform android   # installable dev client
npx eas build --profile production --platform android    # store bundle
```

`eas.json` carries three profiles (development / preview / production), each with its own
`EXPO_PUBLIC_API_URL`. Fill `extra.eas.projectId` in `app.json` after `eas init`.

If SDK versions drift from your installed Expo CLI, run `npx expo install --fix` once.

**The API URL matters.** On a physical device `localhost` means the phone, so use the LAN IP of
the machine running the backend (`http://192.168.x.x:5000/api/v1`), or a tunnel. The value is read
from `EXPO_PUBLIC_API_URL` first, then `expo.extra.apiUrl` in `app.json`.

## What is in it

**Onboarding** — swipeable steps with skip and a "just browse" exit, shown once (the flag lives in
AsyncStorage). The slides come from `GET /onboarding-slides` and are edited in the console at
**Admin → Website → App onboarding**, so the pitch can change without a new build; the four bundled
slides are the offline fallback.

**Browse without an account** — home with banners, specialities, doctors, clinics, testimonials and
articles; doctor search with speciality chips plus clinic, fee and experience filters; doctor profiles
with a 7-day strip and live slots; clinics, specialities, blogs, FAQs, CMS pages, about and contact.

**Booking** — the same five-step wizard as the website: doctor → time → patient → payment → review,
with coupon validation, clinic payment modes, and a running total in the bottom bar. Step 3 is where
a visitor verifies a mobile number with an OTP; if that number has no account the API creates one, so
nobody is sent to a sign-up form first.

**Your care** — visits (upcoming and history) with reschedule, cancel and pay-now; family members with
add, edit and remove; prescriptions per patient with the PDF; care videos assigned by the doctor;
profile with inline editing and sign out.

## How it is wired

- **One axios instance** (`src/lib/api.js`) with a request interceptor for the bearer token and a
  response interceptor that refreshes once on 401 and replays the queued calls. A failed refresh
  clears the session and drops the user back to guest browsing.
- **Tokens in the keychain** via `expo-secure-store` (AsyncStorage on web, where SecureStore has no
  implementation). Only the onboarding flag uses plain storage.
- **zustand** for state: `authStore` (session, OTP, profile), `bookingStore` (the wizard, fee and
  payable maths), `uiStore` (onboarding flag, website settings).
- **expo-router** for file-based navigation: a four-tab shell (Home, Doctors, Visits, Profile) with
  stack screens pushed over it.
- **No admin surface.** The app never calls a staff-only endpoint, and nothing routes to `/admin`.

## Layout

```
app/
  _layout.js            providers, session hydrate, first-run redirect
  onboarding.js         the four steps
  (tabs)/               home, doctors, appointments, profile
  doctor/[id].js        profile + slot picker
  clinic/[id].js        clinic + its doctors
  speciality/[slug].js  speciality + doctors + FAQs
  book.js               five-step booking wizard
  appointment/[id].js   visit detail, reschedule, cancel, pay, prescription
  maintenance.js        server-controlled downtime wall
  family.js prescriptions.js videos.js
  blogs.js blog/[slug].js faqs.js page/[slug].js about.js contact.js
  login.js otp.js register.js forgot-password.js
src/
  lib/        api, theme, utils, constants, storage,
              push, push-background, notification-channels, location, version, razorpay
  services/   one wrapper per backend route group
  store/      auth, booking, ui
  components/ ui primitives + app-level cards, AuthGate, GuestVerify
```

## Push notifications (FCM)

`@react-native-firebase/messaging` for the transport, `notifee` for channels and for drawing
notifications while the app is in the foreground.

- **Channels** (Android) are created at startup from `src/lib/notification-channels.js`:
  appointments, reminders, payments, prescriptions, promotions and general. The server tags every
  push with a `type` and maps it to the same channel id, so importance and sound follow the category —
  a visit reminder buzzes, an offer does not.
- **Permission** is requested on first launch and again from Profile → Notifications. Whether it was
  granted is reported with every token registration, so **Admin → App notifications** shows blocked
  installs rather than silently missing them.
- **The token is saved server-side** via `POST /devices` with platform, device name and app version,
  and re-registered on every token refresh and every sign-in. Signing out calls `/devices/unregister`,
  which detaches the account but keeps the install row.
- **Background and killed state**: `src/lib/push-background.js` registers the handler before React
  mounts (that is why `index.js` is the entry point rather than `expo-router/entry`).
- **Taps route into the app** — a push carrying `appointmentId` opens that visit, a prescription push
  opens the prescriptions screen, handled for foreground, background and cold start.
- Server side: set `FIREBASE_SERVICE_ACCOUNT` in the backend `.env`. Without it push is skipped and
  email/SMS still go out. Superadmins can fire a test from **Admin → Mobile app**.

## Location

`expo-location`, foreground only, asked for when it can actually help. Allowing it sorts clinics
nearest-first and shows the distance on each card; refusing changes nothing else. The coordinate
lives in memory (`uiStore`) and is never sent to the server.

## Maintenance mode and version control

Both come from `GET /app-config?platform=&version=`, read on every launch:

- `maintenance.enabled` → the app replaces everything with `app/maintenance.js`, which has a retry
  that re-reads the config plus call/email support buttons. `allowBrowsing` softens it to a banner.
- version rules → `UpdateGate` compares the installed `nativeApplicationVersion` against
  `latestVersion` (dismissible "new version" prompt) and `minSupportedVersion` (blocking prompt with
  no way past it). Release notes and the store URL come from the same record.

Everything there is edited in the console at **Admin → Mobile app** (superadmin only), so taking the
app down for a deploy or forcing an update needs no new build.

## Payments

`react-native-razorpay`, opened natively from the booking wizard and from an unpaid visit. The order
is always created by the API; the app only opens the sheet and reports back, and the gateway webhook
is what confirms the appointment. Set `EXPO_PUBLIC_RAZORPAY_KEY_ID` (public key only).

## Article and policy content

CMS content is HTML, rendered by `HtmlContent` in a `react-native-webview` with the app's typography
injected and auto-height so it sits inside the normal scroll view. Links open in the system browser.

## Notes

- Screens that need a session render `AuthGate` instead of redirecting, so browsing never gets
  interrupted by a login wall.
- `google-services.json` and `GoogleService-Info.plist` are gitignored — each environment brings its
  own. The app will build without them, but push stays silent.
- The web target (`expo start --web`) still runs: the native modules are required lazily, so push is
  simply inert there.
