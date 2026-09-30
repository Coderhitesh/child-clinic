const env = require('../config/env');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Speciality = require('../models/Speciality');
const Blog = require('../models/Blog');
const CmsPage = require('../models/CmsPage');
const Category = require('../models/Category');
const { cacheGet, cacheSet } = require('./cacheService');

const escapeXml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const urlEntry = (loc, lastmod, changefreq = 'weekly', priority = '0.7') => `
  <url>
    <loc>${escapeXml(loc)}</loc>
    ${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/doctors', changefreq: 'weekly', priority: '0.8' },
  { path: '/clinics', changefreq: 'weekly', priority: '0.8' },
  { path: '/blogs', changefreq: 'daily', priority: '0.8' },
  { path: '/faqs', changefreq: 'monthly', priority: '0.5' },
  { path: '/book-appointment', changefreq: 'weekly', priority: '0.9' },
];

const buildSitemapXml = async () => {
  const base = env.FRONTEND_BASE_URL.replace(/\/$/, '');

  const [clinics, doctors, specialities, blogs, cmsPages, categories] = await Promise.all([
    Clinic.find({ isActive: true }).select('_id name updatedAt').lean(),
    Doctor.find({ isActive: true }).select('_id name updatedAt').lean(),
    Speciality.find({ isActive: true }).select('_id slug updatedAt').lean(),
    Blog.find({ isPublished: true }).select('slug updatedAt').lean(),
    CmsPage.find({ isActive: true }).select('slug updatedAt').lean(),
    Category.find({ isActive: true }).select('slug updatedAt').lean(),
  ]);

  const entries = [];

  STATIC_ROUTES.forEach((r) => entries.push(urlEntry(`${base}${r.path}`, null, r.changefreq, r.priority)));

  specialities.forEach((s) => entries.push(urlEntry(`${base}/speciality/${s.slug}`, s.updatedAt, 'weekly', '0.8')));
  clinics.forEach((c) => entries.push(urlEntry(`${base}/clinics/${c._id}`, c.updatedAt, 'weekly', '0.7')));
  doctors.forEach((d) => entries.push(urlEntry(`${base}/doctors/${d._id}`, d.updatedAt, 'weekly', '0.7')));
  blogs.forEach((b) => entries.push(urlEntry(`${base}/blogs/${b.slug}`, b.updatedAt, 'weekly', '0.6')));
  cmsPages.forEach((p) => entries.push(urlEntry(`${base}/${p.slug}`, p.updatedAt, 'monthly', '0.4')));
  categories.forEach((c) => entries.push(urlEntry(`${base}/category/${c.slug}`, c.updatedAt, 'weekly', '0.5')));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join('')}
</urlset>`;
};

const SITEMAP_CACHE_KEY = 'sitemap:xml';
const SITEMAP_CACHE_TTL = 3600; // 1 hour — sitemap doesn't need to be real-time

const getSitemapXml = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh) {
    const cached = await cacheGet(SITEMAP_CACHE_KEY);
    if (cached) return cached;
  }
  const xml = await buildSitemapXml();
  await cacheSet(SITEMAP_CACHE_KEY, xml, SITEMAP_CACHE_TTL);
  return xml;
};

module.exports = { getSitemapXml };
