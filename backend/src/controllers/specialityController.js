const Speciality = require("../models/Speciality");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");

// --------------------------------------------------
// Helper: Generate slug
// --------------------------------------------------
const generateSlug = (text = "") => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// --------------------------------------------------
// Helper: Normalize SEO
// --------------------------------------------------
const normalizeSeo = (seo = {}) => {
  return {
    metaTitle: seo.metaTitle?.trim() || "",
    metaDescription: seo.metaDescription?.trim() || "",
    metaKeywords: seo.metaKeywords?.trim() || "",
    canonicalUrl: seo.canonicalUrl?.trim() || "",
    ogTitle: seo.ogTitle?.trim() || "",
    ogDescription: seo.ogDescription?.trim() || "",
    ogImage: seo.ogImage?.trim() || "",
    robots: seo.robots || "index,follow",
  };
};

// --------------------------------------------------
// CREATE
// --------------------------------------------------
exports.create = catchAsync(async (req, res) => {
  let {
    name,
    slug,
    description,
    image,
    isActive,
    seo,
  } = req.body;
  console.log(req.body)
  // Name required
  if (!name?.trim()) {
    throw new ApiError(400, "Speciality name is required");
  }

  name = name.trim();

  // Generate slug if not provided
  slug = slug?.trim()
    ? generateSlug(slug)
    : generateSlug(name);

  if (!slug) {
    throw new ApiError(400, "Valid slug is required");
  }

  // Check duplicate name
  const existingName = await Speciality.findOne({
    name: {
      $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      $options: "i",
    },
  });

  if (existingName) {
    throw new ApiError(409, "Speciality with this name already exists");
  }

  // Check duplicate slug
  const existingSlug = await Speciality.findOne({ slug });

  if (existingSlug) {
    throw new ApiError(409, "Speciality with this slug already exists");
  }

  const spec = await Speciality.create({
    name,
    slug,
    description: description?.trim() || "",
    image: image?.trim() || "",
    isActive:
      typeof isActive === "boolean"
        ? isActive
        : true,
    seo: normalizeSeo(seo),
  });

  res.status(201).json({
    success: true,
    message: "Speciality created successfully",
    data: spec,
  });
});

// --------------------------------------------------
// LIST
// --------------------------------------------------
exports.list = catchAsync(async (req, res) => {
  const {
    includeInactive,
    search,
  } = req.query;

  const filter = {};

  // Active / inactive filter
  if (includeInactive !== "true") {
    filter.isActive = true;
  }

  // Search
  if (search?.trim()) {
    const searchValue = search.trim();

    filter.$or = [
      {
        name: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        slug: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        description: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  const specs = await Speciality
    .find(filter)
    .sort({ name: 1 });

  res.json({
    success: true,
    count: specs.length,
    data: specs,
  });
});

// --------------------------------------------------
// GET ONE
// --------------------------------------------------
exports.getOne = catchAsync(async (req, res) => {
  const spec = await Speciality.findById(req.params.id);

  if (!spec) {
    throw new ApiError(
      404,
      "Speciality not found"
    );
  }

  res.json({
    success: true,
    data: spec,
  });
});

// --------------------------------------------------
// GET ONE BY SLUG
// --------------------------------------------------
exports.getBySlug = catchAsync(async (req, res) => {
  const spec = await Speciality.findOne({
    slug: req.params.slug.toLowerCase(),
    isActive: true,
  });

  if (!spec) {
    throw new ApiError(
      404,
      "Speciality not found"
    );
  }

  res.json({
    success: true,
    data: spec,
  });
});

// --------------------------------------------------
// UPDATE
// --------------------------------------------------
exports.update = catchAsync(async (req, res) => {
  const spec = await Speciality.findById(
    req.params.id
  );

  if (!spec) {
    throw new ApiError(
      404,
      "Speciality not found"
    );
  }

  const {
    name,
    slug,
    description,
    image,
    isActive,
    seo,
  } = req.body;

  // -----------------------------
  // Name
  // -----------------------------
  if (name !== undefined) {
    if (!name?.trim()) {
      throw new ApiError(
        400,
        "Speciality name cannot be empty"
      );
    }

    const cleanName = name.trim();

    const duplicateName =
      await Speciality.findOne({
        _id: { $ne: spec._id },
        name: {
          $regex: `^${cleanName.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}$`,
          $options: "i",
        },
      });

    if (duplicateName) {
      throw new ApiError(
        409,
        "Speciality with this name already exists"
      );
    }

    spec.name = cleanName;
  }

  // -----------------------------
  // Slug
  // -----------------------------
  if (slug !== undefined) {
    if (!slug?.trim()) {
      throw new ApiError(
        400,
        "Slug cannot be empty"
      );
    }

    const cleanSlug = generateSlug(slug);

    const duplicateSlug =
      await Speciality.findOne({
        _id: { $ne: spec._id },
        slug: cleanSlug,
      });

    if (duplicateSlug) {
      throw new ApiError(
        409,
        "Speciality with this slug already exists"
      );
    }

    spec.slug = cleanSlug;
  } else if (
    name !== undefined &&
    !req.body.slug
  ) {
    // If name changed and slug was not supplied,
    // regenerate slug from new name.
    const newSlug = generateSlug(spec.name);

    const duplicateSlug =
      await Speciality.findOne({
        _id: { $ne: spec._id },
        slug: newSlug,
      });

    if (duplicateSlug) {
      throw new ApiError(
        409,
        "Generated slug already exists"
      );
    }

    spec.slug = newSlug;
  }

  // -----------------------------
  // Description
  // -----------------------------
  if (description !== undefined) {
    spec.description =
      description?.trim() || "";
  }

  // -----------------------------
  // Image
  // -----------------------------
  if (image !== undefined) {
    spec.image =
      image?.trim() || "";
  }

  // -----------------------------
  // Active status
  // -----------------------------
  if (isActive !== undefined) {
    spec.isActive =
      isActive === true ||
      isActive === "true";
  }

  // -----------------------------
  // SEO
  // -----------------------------
  if (seo !== undefined) {
    spec.seo = {
      ...spec.seo?.toObject?.(),
      ...normalizeSeo(seo),
    };
  }

  await spec.save();

  res.json({
    success: true,
    message: "Speciality updated successfully",
    data: spec,
  });
});

// --------------------------------------------------
// UPDATE SEO ONLY
// --------------------------------------------------
exports.updateSeo = catchAsync(async (req, res) => {
  const spec = await Speciality.findById(
    req.params.id
  );

  if (!spec) {
    throw new ApiError(
      404,
      "Speciality not found"
    );
  }

  spec.seo = {
    ...spec.seo?.toObject?.(),
    ...normalizeSeo(req.body),
  };

  await spec.save();

  res.json({
    success: true,
    message: "Speciality SEO updated successfully",
    data: spec,
  });
});

// --------------------------------------------------
// ACTIVATE
// --------------------------------------------------
exports.activate = catchAsync(async (req, res) => {
  const spec = await Speciality.findByIdAndUpdate(
    req.params.id,
    {
      isActive: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!spec) {
    throw new ApiError(
      404,
      "Speciality not found"
    );
  }

  res.json({
    success: true,
    message: "Speciality activated successfully",
    data: spec,
  });
});

// --------------------------------------------------
// DEACTIVATE
// --------------------------------------------------
exports.remove = catchAsync(async (req, res) => {
  const spec = await Speciality.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!spec) {
    throw new ApiError(
      404,
      "Speciality not found"
    );
  }

  res.json({
    success: true,
    message: "Speciality deactivated",
    data: spec,
  });
});

