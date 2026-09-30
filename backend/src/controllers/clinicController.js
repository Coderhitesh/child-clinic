const Clinic = require("../models/Clinic");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const {
  cacheGet,
  cacheSet,
  cacheDelByPrefix,
} = require("../services/cacheService");
const { generateUniqueSlug, generateClinicCode } = require("../utils/slug");
const { isClinicScoped, ownClinicIds } = require("../utils/clinicAccess");
const toBoolean = (value) => value === true || value === "true";

exports.create = catchAsync(async (req, res) => {
  const body = req.body;
  const slugGenrate = await generateUniqueSlug(body.name);
  const code = await generateClinicCode();
  const payload = {
    name: body.name?.trim(),
    slug: slugGenrate || body.slug?.trim()?.toLowerCase() || undefined,
    code,

    shortDescription: body.shortDescription?.trim() || "",
    description: body.description || "",

    phone: body.phone?.trim() || "",
    alternatePhone: body.alternatePhone?.trim() || "",
    whatsappNumber: body.whatsappNumber?.trim() || "",
    emergencyNumber: body.emergencyNumber?.trim() || "",
    email: body.email?.trim()?.toLowerCase() || "",

    logo: body.logo || "",
    coverImage: body.coverImage || "",

    images: Array.isArray(body.images) ? body.images.filter(Boolean) : [],

    order: body.order === "" || body.order == null ? 0 : Number(body.order),

    isFeatured: body.isFeatured === true || body.isFeatured === "true",

    isActive:
      body.isActive === undefined
        ? true
        : body.isActive === true || body.isActive === "true",

    isTemporarilyClosed:
      body.isTemporarilyClosed === true || body.isTemporarilyClosed === "true",

    temporaryClosureReason: body.temporaryClosureReason?.trim() || "",

    mapLink: body.mapLink?.trim() || "",

    timezone: body.timezone || "Asia/Kolkata",

    address: {
      line1: body.address?.line1?.trim() || "",
      line2: body.address?.line2?.trim() || "",
      landmark: body.address?.landmark?.trim() || "",
      city: body.address?.city?.trim() || "",
      state: body.address?.state?.trim() || "",
      pincode: body.address?.pincode?.trim() || "",
      country: body.address?.country?.trim() || "IN",
    },

    specialities: Array.isArray(body.specialities)
      ? body.specialities.filter(Boolean)
      : [],

    facilities: Array.isArray(body.facilities)
      ? body.facilities.map((item) => String(item).trim()).filter(Boolean)
      : [],

    paymentMethods: Array.isArray(body.paymentMethods)
      ? body.paymentMethods.filter(Boolean)
      : ["cash"],

    timings: {
      openTime: body.timings?.openTime || "09:00",

      closeTime: body.timings?.closeTime || "18:00",

      workingDays: Array.isArray(body.timings?.workingDays)
        ? body.timings.workingDays.map(Number)
        : [1, 2, 3, 4, 5, 6],
    },

    appointmentSettings: {
      enabled:
        body.appointmentSettings?.enabled === undefined
          ? true
          : body.appointmentSettings.enabled === true ||
            body.appointmentSettings.enabled === "true",

      slotDuration:
        body.appointmentSettings?.slotDuration === "" ||
        body.appointmentSettings?.slotDuration == null
          ? 15
          : Number(body.appointmentSettings.slotDuration),

      bufferTime:
        body.appointmentSettings?.bufferTime === "" ||
        body.appointmentSettings?.bufferTime == null
          ? 0
          : Number(body.appointmentSettings.bufferTime),

      advanceBookingDays:
        body.appointmentSettings?.advanceBookingDays === "" ||
        body.appointmentSettings?.advanceBookingDays == null
          ? 30
          : Number(body.appointmentSettings.advanceBookingDays),

      sameDayBooking:
        body.appointmentSettings?.sameDayBooking === undefined
          ? true
          : body.appointmentSettings.sameDayBooking === true ||
            body.appointmentSettings.sameDayBooking === "true",

      allowOnlineBooking:
        body.appointmentSettings?.allowOnlineBooking === undefined
          ? true
          : body.appointmentSettings.allowOnlineBooking === true ||
            body.appointmentSettings.allowOnlineBooking === "true",

      allowWalkIn:
        body.appointmentSettings?.allowWalkIn === undefined
          ? true
          : body.appointmentSettings.allowWalkIn === true ||
            body.appointmentSettings.allowWalkIn === "true",
    },

    seo: {
      metaTitle: body.seo?.metaTitle?.trim() || "",

      metaDescription: body.seo?.metaDescription?.trim() || "",

      ogImage: body.seo?.ogImage || "",
    },
  };

  const coordinates = body.location?.coordinates;

  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates[0] !== "" &&
    coordinates[1] !== ""
  ) {
    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (!Number.isNaN(longitude) && !Number.isNaN(latitude)) {
      payload.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }
  }

  if (Array.isArray(body.feeOverrides)) {
    payload.feeOverrides = body.feeOverrides
      .filter((item) => item?.speciality)
      .map((item) => ({
        speciality: item.speciality,

        consultationFee:
          item.consultationFee === "" || item.consultationFee == null
            ? undefined
            : Number(item.consultationFee),

        followUpFee:
          item.followUpFee === "" || item.followUpFee == null
            ? undefined
            : Number(item.followUpFee),

        followUpDays:
          item.followUpDays === "" || item.followUpDays == null
            ? undefined
            : Number(item.followUpDays),
      }));
  }

  const clinic = await Clinic.create(payload);

  await cacheDelByPrefix("clinics:");

  res.status(201).json({
    success: true,
    data: clinic,
  });
});

exports.list = catchAsync(async (req, res) => {
  const { speciality } = req.query;
  const scoped = isClinicScoped(req.user);
  const cacheKey = `clinics:list:${speciality || "all"}`;
  if (!scoped) {
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });
  }

  const filter = req.query.includeInactive === "true" ? {} : { isActive: true };
  if (speciality) filter.specialities = speciality;
  // signed-in clinic staff only see their own clinic(s)
  if (scoped) filter._id = { $in: ownClinicIds(req.user) };
  const clinics = await Clinic.find(filter).populate(
    "specialities",
    "name slug",
  );
  if (!scoped) await cacheSet(cacheKey, clinics, 120);
  res.json({ success: true, data: clinics });
});

exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;
  // the website links clinics by slug; the admin panel uses the ObjectId
  const query = require("mongoose").isValidObjectId(id)
    ? { _id: id }
    : { slug: String(id).toLowerCase() };
  const clinic = await Clinic.findOne(query).populate(
    "specialities",
    "name slug",
  );
  if (!clinic) throw new ApiError(404, "Clinic not found");
  res.json({ success: true, data: clinic });
});

exports.update = catchAsync(async (req, res) => {
  const body = req.body;

  const existingClinic = await Clinic.findById(req.params.id);

  if (!existingClinic) {
    throw new ApiError(404, "Clinic not found");
  }

  const update = {};

  /*
   * BASIC INFO
   */
  if (body.name !== undefined) {
    const name = body.name?.trim();

    if (!name) {
      throw new ApiError(400, "Clinic name is required");
    }

    update.name = name;

    // Generate new slug only when name changes
    if (name !== existingClinic.name) {
      update.slug = await generateUniqueSlug(name, existingClinic._id);
    }
  }

  if (!existingClinic.code) {
    update.code = await generateClinicCode();
  }

  if (body.code !== undefined) {
    update.code = body.code?.trim()?.toUpperCase() || undefined;
  }

  if (body.shortDescription !== undefined) {
    update.shortDescription = body.shortDescription?.trim() || "";
  }

  if (body.description !== undefined) {
    update.description = body.description || "";
  }

  /*
   * CONTACT
   */
  if (body.phone !== undefined) {
    update.phone = body.phone?.trim() || "";
  }

  if (body.alternatePhone !== undefined) {
    update.alternatePhone = body.alternatePhone?.trim() || "";
  }

  if (body.whatsappNumber !== undefined) {
    update.whatsappNumber = body.whatsappNumber?.trim() || "";
  }

  if (body.emergencyNumber !== undefined) {
    update.emergencyNumber = body.emergencyNumber?.trim() || "";
  }

  if (body.email !== undefined) {
    update.email = body.email?.trim()?.toLowerCase() || "";
  }

  /*
   * IMAGES
   *
   * Only update when frontend actually sends the field.
   */
  if (body.logo !== undefined) {
    update.logo = body.logo || "";
  }

  if (body.coverImage !== undefined) {
    update.coverImage = body.coverImage || "";
  }

  if (body.images !== undefined) {
    update.images = Array.isArray(body.images)
      ? body.images.filter(Boolean)
      : [];
  }

  /*
   * DISPLAY SETTINGS
   */
  if (body.order !== undefined) {
    update.order =
      body.order === "" || body.order == null ? 0 : Number(body.order);
  }

  if (body.isFeatured !== undefined) {
    update.isFeatured = toBoolean(body.isFeatured);
  }

  if (body.isActive !== undefined) {
    update.isActive = toBoolean(body.isActive);
  }

  if (body.isTemporarilyClosed !== undefined) {
    update.isTemporarilyClosed = toBoolean(body.isTemporarilyClosed);
  }

  if (body.temporaryClosureReason !== undefined) {
    update.temporaryClosureReason = body.temporaryClosureReason?.trim() || "";
  }

  /*
   * MAP
   */
  if (body.mapLink !== undefined) {
    update.mapLink = body.mapLink?.trim() || "";
  }

  if (body.timezone !== undefined) {
    update.timezone = body.timezone?.trim() || "Asia/Kolkata";
  }

  /*
   * ADDRESS
   *
   * Dot notation ensures other address fields are not removed.
   */
  if (body.address) {
    if (body.address.line1 !== undefined) {
      update["address.line1"] = body.address.line1?.trim() || "";
    }

    if (body.address.line2 !== undefined) {
      update["address.line2"] = body.address.line2?.trim() || "";
    }

    if (body.address.landmark !== undefined) {
      update["address.landmark"] = body.address.landmark?.trim() || "";
    }

    if (body.address.city !== undefined) {
      update["address.city"] = body.address.city?.trim() || "";
    }

    if (body.address.state !== undefined) {
      update["address.state"] = body.address.state?.trim() || "";
    }

    if (body.address.pincode !== undefined) {
      update["address.pincode"] = body.address.pincode?.trim() || "";
    }

    if (body.address.country !== undefined) {
      update["address.country"] = body.address.country?.trim() || "IN";
    }
  }

  /*
   * SPECIALITIES
   */
  if (body.specialities !== undefined) {
    update.specialities = Array.isArray(body.specialities)
      ? body.specialities.filter(Boolean)
      : [];
  }

  /*
   * FACILITIES
   */
  if (body.facilities !== undefined) {
    update.facilities = Array.isArray(body.facilities)
      ? body.facilities.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }

  /*
   * PAYMENT METHODS
   */
  if (body.paymentMethods !== undefined) {
    update.paymentMethods = Array.isArray(body.paymentMethods)
      ? body.paymentMethods.filter(Boolean)
      : [];
  }

  /*
   * TIMINGS
   */
  if (body.timings) {
    if (body.timings.openTime !== undefined) {
      update["timings.openTime"] = body.timings.openTime || "09:00";
    }

    if (body.timings.closeTime !== undefined) {
      update["timings.closeTime"] = body.timings.closeTime || "18:00";
    }

    if (body.timings.workingDays !== undefined) {
      update["timings.workingDays"] = Array.isArray(body.timings.workingDays)
        ? body.timings.workingDays.map(Number)
        : [];
    }
  }

  /*
   * APPOINTMENT SETTINGS
   */
  if (body.appointmentSettings) {
    const settings = body.appointmentSettings;

    if (settings.enabled !== undefined) {
      update["appointmentSettings.enabled"] = toBoolean(settings.enabled);
    }

    if (settings.slotDuration !== undefined) {
      update["appointmentSettings.slotDuration"] =
        settings.slotDuration === "" ? 15 : Number(settings.slotDuration);
    }

    if (settings.bufferTime !== undefined) {
      update["appointmentSettings.bufferTime"] =
        settings.bufferTime === "" ? 0 : Number(settings.bufferTime);
    }

    if (settings.advanceBookingDays !== undefined) {
      update["appointmentSettings.advanceBookingDays"] =
        settings.advanceBookingDays === ""
          ? 30
          : Number(settings.advanceBookingDays);
    }

    if (settings.sameDayBooking !== undefined) {
      update["appointmentSettings.sameDayBooking"] = toBoolean(
        settings.sameDayBooking,
      );
    }

    if (settings.allowOnlineBooking !== undefined) {
      update["appointmentSettings.allowOnlineBooking"] = toBoolean(
        settings.allowOnlineBooking,
      );
    }

    if (settings.allowWalkIn !== undefined) {
      update["appointmentSettings.allowWalkIn"] = toBoolean(
        settings.allowWalkIn,
      );
    }
  }

  /*
   * LOCATION
   */
  if (body.location?.coordinates !== undefined) {
    const coordinates = body.location.coordinates;

    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2 &&
      coordinates[0] !== "" &&
      coordinates[1] !== ""
    ) {
      const longitude = Number(coordinates[0]);
      const latitude = Number(coordinates[1]);

      if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
        throw new ApiError(400, "Invalid clinic coordinates");
      }

      if (
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        throw new ApiError(400, "Invalid clinic coordinates");
      }

      update.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }
  }

  /*
   * FEE OVERRIDES
   */
  if (body.feeOverrides !== undefined) {
    update.feeOverrides = Array.isArray(body.feeOverrides)
      ? body.feeOverrides
          .filter((item) => item?.speciality)
          .map((item) => ({
            speciality: item.speciality,

            consultationFee:
              item.consultationFee === "" || item.consultationFee == null
                ? undefined
                : Number(item.consultationFee),

            followUpFee:
              item.followUpFee === "" || item.followUpFee == null
                ? undefined
                : Number(item.followUpFee),

            followUpDays:
              item.followUpDays === "" || item.followUpDays == null
                ? undefined
                : Number(item.followUpDays),
          }))
      : [];
  }

  /*
   * SEO
   */
  if (body.seo) {
    if (body.seo.metaTitle !== undefined) {
      update["seo.metaTitle"] = body.seo.metaTitle?.trim() || "";
    }

    if (body.seo.metaDescription !== undefined) {
      update["seo.metaDescription"] = body.seo.metaDescription?.trim() || "";
    }

    if (body.seo.ogImage !== undefined) {
      update["seo.ogImage"] = body.seo.ogImage || "";
    }
  }

  const clinic = await Clinic.findByIdAndUpdate(
    req.params.id,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  await cacheDelByPrefix("clinics:");

  res.json({
    success: true,
    data: clinic,
  });
});

exports.remove = catchAsync(async (req, res) => {
  const clinic = await Clinic.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!clinic) throw new ApiError(404, "Clinic not found");
  await cacheDelByPrefix("clinics:");
  res.json({ success: true, message: "Clinic deactivated" });
});

exports.assignSpecialities = catchAsync(async (req, res) => {
  const { specialities } = req.body; // array of speciality ids
  const clinic = await Clinic.findByIdAndUpdate(
    req.params.id,
    { specialities },
    { new: true },
  ).populate("specialities", "name slug");
  if (!clinic) throw new ApiError(404, "Clinic not found");
  await cacheDelByPrefix("clinics:");
  res.json({ success: true, data: clinic });
});
