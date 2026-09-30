const Blog = require('../models/Blog');
const catchAsync = require('../utils/catchAsync');
const base = require('../utils/crudFactory')(Blog, {
  populate: 'category speciality author',
  defaultSort: '-publishedAt',
  softDeleteField: 'isPublished',
});

// override list: public should only ever see published; admins can pass includeInactive=true
base.list = catchAsync(async (req, res) => {
  const { includeInactive, category, speciality, ...rest } = req.query;
  const filter = includeInactive === 'true' ? {} : { isPublished: true };
  if (category) filter.category = category;
  if (speciality) filter.speciality = speciality;
  const blogs = await Blog.find(filter).populate('category speciality author', 'name').sort('-publishedAt');
  res.json({ success: true, data: blogs });
});

base.getBySlug = catchAsync(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category speciality author', 'name');
  if (!blog) {
    const ApiError = require('../utils/apiError');
    throw new ApiError(404, 'Blog not found');
  }
  res.json({ success: true, data: blog });
});

const originalCreate = base.create; // eslint-disable-line no-unused-vars
base.create = catchAsync(async (req, res) => {
  const payload = { ...req.body, author: req.body.author || req.user._id };
  if (payload.isPublished && !payload.publishedAt) payload.publishedAt = new Date();
  const blog = await Blog.create(payload);
  res.status(201).json({ success: true, data: blog });
});

module.exports = base;
