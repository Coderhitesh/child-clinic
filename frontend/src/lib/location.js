// Shared location helpers (safe to import from server and client components).

// v2: older cached entries had no city, which is why the header stayed on "Select city"
export const LOCATION_CACHE_KEY = 'ncc:user-location:v2';

// clinic -> { lat, lng } from location.coordinates ([lng, lat]) or a Google Maps link
export const getClinicLatLng = (clinic) => {
  const coords = clinic?.location?.coordinates;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords.map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) return { lat, lng };
  }

  let link = clinic?.mapLink || '';
  try { link = decodeURIComponent(link); } catch { /* keep raw */ }
  const m =
    link.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) ||
    link.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/) ||
    link.match(/[?&](?:q|query|ll|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (m) {
    const lat = Number(m[1]);
    const lng = Number(m[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  return null;
};

// great-circle distance in km
export const distanceKm = (a, b) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m away` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km away`;

const norm = (c = '') => String(c).toLowerCase().replace(/\b(new|city|district)\b/g, '').replace(/[^a-z]/g, '');
export const sameCity = (a, b) => {
  const x = norm(a);
  const y = norm(b);
  return Boolean(x && y && (x === y || x.includes(y) || y.includes(x)));
};

// Nearest clinics first, then everything else.
// - userPos known: clinics with a known location by distance; the rest follow (same city first)
// - a city picked by hand in the header: that city's clinics come first, nearest among them first
export function sortClinicsByProximity(clinics = [], { userPos, city, cityManual } = {}) {
  const rows = clinics.map((clinic, index) => {
    const point = getClinicLatLng(clinic);
    return {
      clinic,
      index,
      km: userPos && point ? distanceKm(userPos, point) : null,
      inCity: city ? sameCity(clinic?.address?.city, city) : false,
    };
  });

  return rows.sort((a, b) => {
    if (cityManual && a.inCity !== b.inCity) return a.inCity ? -1 : 1;
    if (a.km != null && b.km != null) return a.km - b.km;
    if (a.km != null) return -1;
    if (b.km != null) return 1;
    if (a.inCity !== b.inCity) return a.inCity ? -1 : 1;
    return a.index - b.index;
  });
}

export function nearestClinicCity(clinics = [], userPos) {
  if (!userPos) return '';
  let best = null;
  for (const c of clinics) {
    const p = getClinicLatLng(c);
    if (!p || !c?.address?.city) continue;
    const km = distanceKm(userPos, p);
    if (!best || km < best.km) best = { km, city: c.address.city };
  }
  return best?.city || '';
}

const fetchJson = async (url, ms = 6000) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
};

// city name for coordinates — tries two free services (no API key), returns '' if both fail
export async function reverseGeocodeCity({ lat, lng }) {
  const osm = await fetchJson(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&addressdetails=1&lat=${lat}&lon=${lng}`
  );
  const a = osm?.address || {};
  const fromOsm = a.city || a.town || a.village || a.municipality || a.state_district || a.county || '';
  if (fromOsm) return fromOsm;

  const bdc = await fetchJson(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
  );
  return bdc?.city || bdc?.locality || bdc?.principalSubdivision || '';
}

// approximate location from the IP address — used when the browser location is blocked or unavailable
export async function ipLocation() {
  const d = await fetchJson('https://ipwho.is/');
  if (d?.success && d.latitude != null && d.longitude != null) {
    return { lat: Number(d.latitude), lng: Number(d.longitude), city: d.city || '' };
  }
  const d2 = await fetchJson('https://ipapi.co/json/');
  if (d2?.latitude != null && d2?.longitude != null) {
    return { lat: Number(d2.latitude), lng: Number(d2.longitude), city: d2.city || '' };
  }
  return null;
}
