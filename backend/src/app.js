const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

const env = require('./config/env');
const ApiError = require('./utils/apiError');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiters');

const authRoutes = require('./routes/authRoutes');
const specialityRoutes = require('./routes/specialityRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const slotRoutes = require('./routes/slotRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const videoRoutes = require('./routes/videoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const appSettingRoutes = require('./routes/appSettingRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');

// Website / CMS management
const categoryRoutes = require('./routes/categoryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const popupRoutes = require('./routes/popupRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const couponRoutes = require('./routes/couponRoutes');
const cmsPageRoutes = require('./routes/cmsPageRoutes');
const blogRoutes = require('./routes/blogRoutes');
const faqRoutes = require('./routes/faqRoutes');
const contactSubmissionRoutes = require('./routes/contactSubmissionRoutes');
const headerNotificationRoutes = require('./routes/headerNotificationRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const websiteSettingRoutes = require('./routes/websiteSettingRoutes');
const { getSitemapXml } = require('./services/sitemapService');

const app = express();

app.set('trust proxy', 1);

// capture raw body for webhook signature verification
app.use(
  express.json({
    limit: '2mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);
app.use(
  cors({
    origin: env.CORS_WHITELIST.length ? env.CORS_WHITELIST : '*',
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/files', express.static(path.join(__dirname, '..', 'generated')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date() }));

// SEO: dynamic sitemap (cached 1hr in Redis) + robots.txt pointing at it
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const xml = await getSitemapXml({ forceRefresh: req.query.refresh === 'true' });
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    `User-agent: *\nAllow: /\nSitemap: ${env.FRONTEND_BASE_URL.replace(/\/$/, '')}/sitemap.xml\n`
  );
});
app.use(generalLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/specialities', specialityRoutes);
app.use('/api/v1/clinics', clinicRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/slots', slotRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/app-config', appSettingRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/onboarding-slides', onboardingRoutes);

// Website / CMS management
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/popups', popupRoutes);
app.use('/api/v1/testimonials', testimonialRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/cms-pages', cmsPageRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/faqs', faqRoutes);
app.use('/api/v1/contact-submissions', contactSubmissionRoutes);
app.use('/api/v1/header-notifications', headerNotificationRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/website-settings', websiteSettingRoutes);

app.all('*', (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

app.use(errorHandler);

module.exports = app;
