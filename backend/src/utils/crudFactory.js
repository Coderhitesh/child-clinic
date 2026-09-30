const ApiError = require('./apiError');
const catchAsync = require('./catchAsync');

// Generic CRUD controller factory for simple content models (Category, Banner, Popup,
// Testimonial, CmsPage, Blog, Faq, HeaderNotification, Partner).
// Keeps each real controller file small; model-specific logic (coupon apply, contact
// status, settings singleton, payment-mode resolution) still gets its own controller.
const makeCrud = (Model, { populate = '', defaultSort = '-createdAt', softDeleteField = 'isActive' } = {}) => ({
  create: catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  }),

  list: catchAsync(async (req, res) => {
    const { includeInactive, ...filters } = req.query;
    const query = includeInactive === 'true' ? {} : { [softDeleteField]: true };
    Object.assign(query, filters);
    let q = Model.find(query).sort(defaultSort);
    if (populate) q = q.populate(populate);
    const docs = await q;
    res.json({ success: true, data: docs });
  }),

  getOne: catchAsync(async (req, res) => {
    let q = Model.findById(req.params.id);
    if (populate) q = q.populate(populate);
    const doc = await q;
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  }),

  getBySlug: catchAsync(async (req, res) => {
    let q = Model.findOne({ slug: req.params.slug, [softDeleteField]: true });
    if (populate) q = q.populate(populate);
    const doc = await q;
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  }),

  update: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  }),

  remove: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, { [softDeleteField]: false }, { new: true });
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, message: `${Model.modelName} deactivated` });
  }),

  hardDelete: catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, message: `${Model.modelName} permanently deleted` });
  }),
});

module.exports = makeCrud;
