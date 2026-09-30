import * as Location from 'expo-location';

/**
 * Location is only ever used to sort clinics and doctors by distance, so it is
 * requested when it can actually help and the app keeps working when refused.
 */
export const requestLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return { granted: false, coords: null };

  // last known first — instant, and accurate enough for "which clinic is nearest"
  const last = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000 }).catch(() => null);
  const position =
    last || (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => null));

  return {
    granted: true,
    coords: position ? { lat: position.coords.latitude, lng: position.coords.longitude } : null,
  };
};

export const getPermissionStatus = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status; // granted | denied | undetermined
};

// straight-line distance in km, which is all a "nearest clinic" sort needs
export const distanceKm = (a, b) => {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10;
};

export const clinicCoords = (clinic) => {
  const lat = clinic?.location?.lat ?? clinic?.latitude;
  const lng = clinic?.location?.lng ?? clinic?.longitude;
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null;
};
