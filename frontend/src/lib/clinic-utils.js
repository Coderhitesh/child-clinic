export const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const getWorkingDays = (days = []) => {
  if (!Array.isArray(days) || !days.length) {
    return "Timing on request";
  }

  const sorted = [...days]
    .map(Number)
    .filter((day) => day >= 0 && day <= 6)
    .sort((a, b) => a - b);

  if (sorted.length === 7) {
    return "Every day";
  }

  if (
    sorted.length === 6 &&
    sorted.every((day, index) => day === index + 1)
  ) {
    return "Mon–Sat";
  }

  if (
    sorted.length === 5 &&
    sorted.every((day, index) => day === index + 1)
  ) {
    return "Mon–Fri";
  }

  return sorted
    .map((day) => WEEK_DAYS[day])
    .filter(Boolean)
    .join(", ");
};

export const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = String(time).split(":");

  if (hours === undefined || minutes === undefined) {
    return time;
  }

  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getSpecialityName = (speciality) => {
  if (!speciality) return "";

  if (typeof speciality === "string") {
    return speciality;
  }

  return speciality.name || speciality.title || "";
};

export const getClinicImage = (clinic) => {
  if (!clinic) {
    return "/images/clinic-placeholder.jpg";
  }

  return (
    clinic.coverImage ||
    clinic.images?.[0] ||
    clinic.logo ||
    "/images/clinic-placeholder.jpg"
  );
};

export const getClinicAddress = (clinic) => {
  const address = clinic?.address || {};

  return [
    address.line1,
    address.line2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");
};

export const getClinicTiming = (clinic) => {
  const timings = clinic?.timings || {};

  const workingDays = getWorkingDays(
    timings.workingDays
  );

  const openingTime = formatTime(
    timings.openTime
  );

  const closingTime = formatTime(
    timings.closeTime
  );

  if (openingTime && closingTime) {
    return `${workingDays} • ${openingTime} – ${closingTime}`;
  }

  return workingDays;
};

export const getClinicHref = (clinic) => {
  if (!clinic) return "/clinics";

  return `/clinics/${clinic._id || clinic.slug}`;
};

export const getClinicSpecialities = (
  clinic,
  limit = 3
) => {
  const specialities = Array.isArray(
    clinic?.specialities
  )
    ? clinic.specialities
  : [];

  return specialities
    .map(getSpecialityName)
    .filter(Boolean)
    .slice(0, limit);
};

export const getRemainingSpecialitiesCount = (
  clinic,
  limit = 3
) => {
  const total = Array.isArray(
    clinic?.specialities
  )
    ? clinic.specialities.length
  : 0;

  return Math.max(total - limit, 0);
};
