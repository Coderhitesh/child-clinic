const Clinic = require("../models/Clinic");

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const generateClinicCode = async () => {
  const lastClinic = await Clinic.findOne({
    code: { $regex: /^CLN\d+$/ },
  })
    .sort({ code: -1 })
    .select("code")
    .lean();

  let nextNumber = 1;

  if (lastClinic?.code) {
    const currentNumber = parseInt(
      lastClinic.code.replace("CLN", ""),
      10
    );

    nextNumber = currentNumber + 1;
  }

  return `CLN${String(nextNumber).padStart(3, "0")}`;
};



const generateUniqueSlug = async (name, excludeId = null) => {
  const baseSlug = slugify(name);

  let slug = baseSlug;
  let count = 1;

  while (
    await Clinic.exists({
      slug,
      ...(excludeId && {
        _id: { $ne: excludeId },
      }),
    })
  ) {
    slug = `${baseSlug}-${count}`;
    count += 1;
  }

  return slug;
};

module.exports = {
  slugify,
  generateClinicCode,
  generateUniqueSlug,
};