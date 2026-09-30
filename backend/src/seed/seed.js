/**
 * Complete seed script.
 * Run: node src/seed/seed.js
 * Creates: 1 superadmin, 2 specialities, 2 clinics, 2 clinic_admins,
 * 2 doctors (+ user accounts), 1 receptionist, 1 sample patient + guardian login,
 * generates 3 days of slots for each doctor.
 *
 * Safe to re-run: uses upsert-style findOneAndUpdate on unique fields where possible,
 * skips creation if a record with the same unique key already exists.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');

const User = require('../models/User');
const Speciality = require('../models/Speciality');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Slot = require('../models/Slot');
const { generateDaySlots } = require('../utils/slotGenerator');

// website/CMS models
const Category = require('../models/Category');
const Banner = require('../models/Banner');
const Testimonial = require('../models/Testimonial');
const WebsiteSetting = require('../models/WebsiteSetting');
const CmsPage = require('../models/CmsPage');
const Faq = require('../models/Faq');
const Coupon = require('../models/Coupon');
const HeaderNotification = require('../models/HeaderNotification');
const Partner = require('../models/Partner');
const OnboardingSlide = require('../models/OnboardingSlide');
const AppSetting = require('../models/AppSetting');

const DEFAULT_PASSWORD = 'Passw0rd!123';

async function upsertUser(fields) {
  let user = await User.findOne({ email: fields.email });
  if (user) {
    console.log(`[Seed] User exists, skipping: ${fields.email}`);
    return user;
  }
  user = await User.create(fields);
  console.log(`[Seed] Created user: ${fields.email} (${fields.role})`);
  return user;
}

async function upsertSpeciality(fields) {
  let spec = await Speciality.findOne({ slug: fields.slug });
  if (spec) {
    console.log(`[Seed] Speciality exists, skipping: ${fields.slug}`);
    return spec;
  }
  spec = await Speciality.create(fields);
  console.log(`[Seed] Created speciality: ${fields.name}`);
  return spec;
}

async function upsertClinic(fields) {
  let clinic = await Clinic.findOne({ name: fields.name });
  if (clinic) {
    console.log(`[Seed] Clinic exists, skipping: ${fields.name}`);
    return clinic;
  }
  clinic = await Clinic.create(fields);
  console.log(`[Seed] Created clinic: ${fields.name}`);
  return clinic;
}

async function upsertDoctor(fields) {
  let doctor = await Doctor.findOne({ user: fields.user });
  if (doctor) {
    console.log(`[Seed] Doctor profile exists, skipping for user: ${fields.user}`);
    return doctor;
  }
  doctor = await Doctor.create(fields);
  console.log(`[Seed] Created doctor: ${fields.name}`);
  return doctor;
}

async function generateSlotsForDoctor(doctor, clinicId, days = 3) {
  const timing = doctor.clinicTimings.find((t) => t.clinic.toString() === clinicId.toString());
  if (!timing) return 0;

  let created = 0;
  const cur = new Date();
  for (let i = 0; i < days; i++) {
    const dayOfWeek = cur.getDay();
    if (timing.workingDays.includes(dayOfWeek)) {
      const dateStr = cur.toISOString().slice(0, 10);
      const daySlots = generateDaySlots(timing.startTime, timing.endTime, timing.slotDurationMinutes);
      for (const s of daySlots) {
        try {
          await Slot.create({
            clinic: clinicId,
            doctor: doctor._id,
            date: dateStr,
            startTime: s.startTime,
            endTime: s.endTime,
          });
          created++;
        } catch (err) {
          if (err.code !== 11000) throw err; // ignore duplicate
        }
      }
    }
    cur.setDate(cur.getDate() + 1);
  }
  return created;
}

async function run() {
  await mongoose.connect(env.MONGO_URI);
  console.log('[Seed] Connected to MongoDB');

  // 1. Superadmin
  const superadmin = await upsertUser({
    name: 'Super Admin',
    email: 'superadmin@example.com',
    phone: '9999999999',
    password: DEFAULT_PASSWORD,
    role: 'superadmin',
  });

  // 2. Specialities
  const pediatrics = await upsertSpeciality({
    name: 'Pediatrics',
    slug: 'pediatrics',
    description: 'Child healthcare and development',
  });
  const gynecology = await upsertSpeciality({
    name: 'Gynecology',
    slug: 'gynecology',
    description: 'Women\'s reproductive health',
  });

  // 3. Clinics
  const clinicA = await upsertClinic({
    name: 'Sunrise Clinic - Downtown',
    address: { line1: '12 MG Road', city: 'Delhi', state: 'Delhi', pincode: '110001' },
    phone: '9999000001',
    email: 'downtown@sunrise.clinic',
    specialities: [pediatrics._id, gynecology._id],
  });
  const clinicB = await upsertClinic({
    name: 'Sunrise Clinic - Uptown',
    address: { line1: '45 Ring Road', city: 'Delhi', state: 'Delhi', pincode: '110034' },
    phone: '9999000002',
    email: 'uptown@sunrise.clinic',
    specialities: [pediatrics._id],
  });

  // 4. Clinic admins (scoped)
  const clinicAdminA = await upsertUser({
    name: 'Clinic Admin - Downtown',
    email: 'admin.downtown@example.com',
    phone: '9999000010',
    password: DEFAULT_PASSWORD,
    role: 'clinic_admin',
    clinics: [clinicA._id],
  });

  // 5. Receptionist
  await upsertUser({
    name: 'Reception - Downtown',
    email: 'reception.downtown@example.com',
    phone: '9999000011',
    password: DEFAULT_PASSWORD,
    role: 'receptionist',
    clinics: [clinicA._id],
  });

  // 6. Doctors (user account + doctor profile)
  const drUser1 = await upsertUser({
    name: 'Dr. Jane Doe',
    email: 'jane.doe@example.com',
    phone: '9999000020',
    password: DEFAULT_PASSWORD,
    role: 'doctor',
    clinics: [clinicA._id],
  });
  const doctor1 = await upsertDoctor({
    user: drUser1._id,
    name: 'Dr. Jane Doe',
    speciality: pediatrics._id,
    clinics: [clinicA._id, clinicB._id],
    qualification: 'MBBS, MD Pediatrics',
    experienceYears: 8,
    consultationFee: 500,
    clinicTimings: [
      { clinic: clinicA._id, startTime: '09:00', endTime: '17:00', slotDurationMinutes: 15, workingDays: [1, 2, 3, 4, 5, 6] },
      { clinic: clinicB._id, startTime: '10:00', endTime: '14:00', slotDurationMinutes: 20, workingDays: [1, 3, 5] },
    ],
  });
  drUser1.doctorProfile = doctor1._id;
  await drUser1.save({ validateBeforeSave: false });

  const drUser2 = await upsertUser({
    name: 'Dr. Aisha Khan',
    email: 'aisha.khan@example.com',
    phone: '9999000021',
    password: DEFAULT_PASSWORD,
    role: 'doctor',
    clinics: [clinicA._id],
  });
  const doctor2 = await upsertDoctor({
    user: drUser2._id,
    name: 'Dr. Aisha Khan',
    speciality: gynecology._id,
    clinics: [clinicA._id],
    qualification: 'MBBS, MS Gynecology',
    experienceYears: 12,
    consultationFee: 700,
    clinicTimings: [
      { clinic: clinicA._id, startTime: '11:00', endTime: '16:00', slotDurationMinutes: 20, workingDays: [1, 2, 3, 4, 5] },
    ],
  });
  drUser2.doctorProfile = doctor2._id;
  await drUser2.save({ validateBeforeSave: false });

  // 7. Sample parent/patient login + patient profile
  const parentUser = await upsertUser({
    name: 'Rita Sharma',
    email: 'rita.sharma@example.com',
    phone: '9999000030',
    password: DEFAULT_PASSWORD,
    role: 'patient',
  });
  const existingPatient = await Patient.findOne({ guardianUser: parentUser._id });
  if (!existingPatient) {
    await Patient.create({
      guardianUser: parentUser._id,
      name: 'Baby Aarav',
      dob: new Date('2023-04-10'),
      gender: 'male',
      contact: { phone: '9999000030', email: 'rita.sharma@example.com' },
      guardianDetails: { name: 'Rita Sharma', relation: 'mother', phone: '9999000030' },
      extraDetails: { birthWeightKg: 3.2 },
    });
    console.log('[Seed] Created sample patient: Baby Aarav');
  } else {
    console.log('[Seed] Sample patient exists, skipping');
  }

  // 8. Generate slots (next 3 days) for both doctors at their clinics
  const s1 = await generateSlotsForDoctor(doctor1, clinicA._id, 3);
  const s2 = await generateSlotsForDoctor(doctor1, clinicB._id, 3);
  const s3 = await generateSlotsForDoctor(doctor2, clinicA._id, 3);
  console.log(`[Seed] Slots generated: doctor1@clinicA=${s1}, doctor1@clinicB=${s2}, doctor2@clinicA=${s3}`);

  // 9. Website / CMS sample content
  const blogCategory = await (async () => {
    let c = await Category.findOne({ slug: 'parenting-tips' });
    if (c) return c;
    return Category.create({ name: 'Parenting Tips', slug: 'parenting-tips', type: 'blog' });
  })();

  if (!(await Banner.findOne({ placement: 'home_hero' }))) {
    await Banner.create({
      title: 'Book your child\'s checkup today',
      image: 'https://via.placeholder.com/1600x600',
      link: '/book-appointment',
      buttonText: 'Book Now',
      placement: 'home_hero',
      order: 1,
    });
    console.log('[Seed] Created sample hero banner');
  }

  if (!(await Testimonial.findOne({ name: 'Rita Sharma' }))) {
    await Testimonial.create({
      name: 'Rita Sharma',
      designation: 'Parent',
      rating: 5,
      message: 'Excellent care for my son, the doctors are very attentive and the booking process is seamless.',
      clinic: clinicA._id,
      order: 1,
    });
    console.log('[Seed] Created sample testimonial');
  }

  if (!(await WebsiteSetting.findOne())) {
    await WebsiteSetting.create({
      siteName: 'Sunrise Clinic',
      tagline: 'Caring for every stage of life',
      contactEmail: 'contact@sunrise.clinic',
      contactPhone: '9999000000',
      branding: {
        logoHeader: 'https://via.placeholder.com/200x60?text=Logo',
        favicon: 'https://via.placeholder.com/32x32?text=F',
      },
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sunriseclinic',
      appStoreUrl: 'https://apps.apple.com/app/sunrise-clinic/id123456789',
      socialLinks: {
        facebook: 'https://facebook.com/sunriseclinic',
        instagram: 'https://instagram.com/sunriseclinic',
      },
      seo: {
        metaTitle: 'Sunrise Clinic | Multi-Speciality Healthcare',
        metaDescription: 'Book appointments across pediatrics, gynecology and more at Sunrise Clinic.',
        metaKeywords: 'clinic, pediatrics, gynecology, appointment booking',
      },
    });
    console.log('[Seed] Created default website settings');
  }

  if (!(await CmsPage.findOne({ slug: 'privacy-policy' }))) {
    await CmsPage.create({
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      type: 'privacy_policy',
      content: '<p>Sample privacy policy content — replace with real legal text.</p>',
    });
    console.log('[Seed] Created sample CMS page: Privacy Policy');
  }

  if (!(await Faq.findOne({ question: /vaccination schedule/i }))) {
    await Faq.create({
      question: 'Do you provide vaccination schedule guidance?',
      answer: 'Yes, our pediatricians provide a personalized vaccination schedule during your first visit.',
      speciality: pediatrics._id,
      order: 1,
    });
    console.log('[Seed] Created sample FAQ');
  }

  if (!(await Coupon.findOne({ code: 'WELCOME10' }))) {
    await Coupon.create({
      code: 'WELCOME10',
      description: '10% off your first consultation',
      discountType: 'percentage',
      discountValue: 10,
      maxDiscountAmount: 100,
      usageLimitPerUser: 1,
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    console.log('[Seed] Created sample coupon: WELCOME10');
  }


  if (!(await HeaderNotification.findOne())) {
    await HeaderNotification.create({
      message: 'New patients get 10% off with code WELCOME10',
      isActive: true,
      bgColor: '#0f766e',
      textColor: '#ffffff',
    });
    console.log('[Seed] Created sample header notification');
  }

  if (!(await Partner.findOne({ name: 'HealthTrust Labs' }))) {
    await Partner.create({
      name: 'HealthTrust Labs',
      logo: 'https://via.placeholder.com/200x80',
      type: 'trusted_partner',
      order: 1,
    });
    console.log('[Seed] Created sample trusted partner');
  }

  // ---- mobile app: onboarding carousel + launch config
  if ((await OnboardingSlide.countDocuments()) === 0) {
    await OnboardingSlide.insertMany([
      {
        title: 'Find the right doctor',
        body: 'Browse by speciality, clinic, fee or experience — and see exactly who is free today.',
        icon: 'search-outline',
        accentFrom: '#ecfbf9',
        accentTo: '#d2f4ef',
        order: 1,
      },
      {
        title: 'Book in under a minute',
        body: 'Pick a slot, tell us who the visit is for, and pay at the clinic. No sign-up form first.',
        icon: 'calendar-outline',
        accentFrom: '#fff1ec',
        accentTo: '#ffe3d9',
        order: 2,
      },
      {
        title: 'One account, whole family',
        body: 'Add your children or parents once, then book for them in two taps.',
        icon: 'people-outline',
        accentFrom: '#e8f2fc',
        accentTo: '#d8e9fb',
        order: 3,
      },
      {
        title: 'Prescriptions that stay put',
        body: 'Every prescription, report and care video your doctor shares lives in the app.',
        icon: 'document-text-outline',
        accentFrom: '#ecfbf9',
        accentTo: '#d2f4ef',
        ctaText: 'Get started',
        order: 4,
      },
    ]);
    console.log('[Seed] Created 4 onboarding slides for the app');
  }

  if (!(await AppSetting.findOne({ key: 'app' }))) {
    await AppSetting.create({
      key: 'app',
      maintenance: { enabled: false },
      android: { latestVersion: '1.0.0', minSupportedVersion: '1.0.0', storeUrl: '' },
      ios: { latestVersion: '1.0.0', minSupportedVersion: '1.0.0', storeUrl: '' },
    });
    console.log('[Seed] Created mobile app settings record');
  }

  console.log(`[Seed] Website/CMS seed complete (blog category ready: ${blogCategory.name})`);

  console.log('\n[Seed] Done. Login credentials (password for all: ' + DEFAULT_PASSWORD + '):');
  console.log('  superadmin:      superadmin@example.com');
  console.log('  clinic_admin:    admin.downtown@example.com');
  console.log('  receptionist:    reception.downtown@example.com');
  console.log('  doctor:          jane.doe@example.com / aisha.khan@example.com');
  console.log('  patient:         rita.sharma@example.com');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
