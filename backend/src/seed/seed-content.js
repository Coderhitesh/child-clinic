/**
 * Content seed: reviews (testimonials), FAQs, policy pages, blog posts and footer/site details.
 * Run: npm run seed:content     (or: node src/seed/seed-content.js)
 *
 * Safe to re-run — every record is checked before it is created, nothing is duplicated
 * and nothing you edited in the admin panel is overwritten.
 * Reviews are spread over the clinics that already exist in your database.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');

const Speciality = require('../models/Speciality');
const Clinic = require('../models/Clinic');
const Testimonial = require('../models/Testimonial');
const Faq = require('../models/Faq');
const CmsPage = require('../models/CmsPage');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const WebsiteSetting = require('../models/WebsiteSetting');
const { generateUniqueSlug } = require('../utils/slug');

// ------------------------------------------------------------------ reviews
const REVIEWS = [
  { name: 'Neha Kapoor', designation: 'Mother of a 3 year old', rating: 5, message: 'The doctor took time to listen and explained everything patiently. My daughter was not scared at all. Booking online took under a minute.' },
  { name: 'Amit Verma', designation: 'Father of twins', rating: 5, message: 'Clean clinic, very little waiting time and a doctor who genuinely cares. We now bring both kids here for every checkup and vaccination.' },
  { name: 'Pooja Singh', designation: 'Parent', rating: 4, message: 'Good experience overall. The slot timing was followed properly and the digital prescription was available in my account the same day.' },
  { name: 'Rahul Mehta', designation: 'Father of a newborn', rating: 5, message: 'We were nervous first-time parents. The team guided us on feeding, sleep and the vaccination schedule without making us feel rushed.' },
  { name: 'Sunita Rao', designation: 'Mother of two', rating: 5, message: 'Friendly staff and a child-friendly waiting area. My son actually asks when we are going back to see his doctor.' },
  { name: 'Deepak Chauhan', designation: 'Parent', rating: 4, message: 'Easy to find, easy to book and the fees are clear upfront. Follow-up advice on WhatsApp helped a lot when my son had a fever at night.' },
  { name: 'Anjali Gupta', designation: 'Mother of a 5 year old', rating: 5, message: 'Very hygienic and well organised. The doctor recommended simple home care first and only medicines that were needed. Really appreciated the honesty.' },
  { name: 'Vikram Malhotra', designation: 'Father of a toddler', rating: 5, message: 'Best part is that every prescription and report stays in one place on the website. No more hunting for old papers before a visit.' },
  { name: 'Kavita Joshi', designation: 'Parent', rating: 4, message: 'Doctors are experienced and gentle with children. Would love more evening slots but the care itself is excellent.' },
  { name: 'Sandeep Arora', designation: 'Father of a 7 year old', rating: 5, message: 'Walked in without an appointment and was still seen quickly. Clear diagnosis, no unnecessary tests. Highly recommended for families.' },
];

// ------------------------------------------------------------------ FAQs
const GENERAL_FAQS = [
  ['How do I book an appointment?', 'Choose a doctor or clinic, pick a date and time slot, enter your child\'s details and confirm. You will receive a confirmation right away. You can also call the clinic or walk in.'],
  ['Can I book for more than one child?', 'Yes. Add each child as a family member in your account once, then pick the child you are booking for at the time of booking.'],
  ['What are the clinic timings?', 'Timings differ slightly by clinic and are shown on each clinic page. Most clinics are open Monday to Saturday.'],
  ['How much is the consultation fee?', 'The consultation fee is shown on every doctor\'s profile and again at the time of booking, so there are no surprises at the clinic.'],
  ['Which payment methods are accepted?', 'Accepted methods are listed on each clinic page and usually include cash, UPI and cards. Some clinics also offer online payment while booking.'],
  ['How can I cancel or reschedule my appointment?', 'Sign in, open My Appointments and choose cancel or reschedule. Please do this in advance so the slot can be offered to another family. See our refund policy for details.'],
  ['Where can I find my child\'s prescription?', 'After the consultation the doctor shares a digital prescription. Sign in and open Prescriptions in your dashboard to view or download it any time.'],
  ['Do I need to carry previous reports?', 'It helps. Please bring earlier prescriptions, vaccination records and test reports, or keep them ready in your account so the doctor can review them.'],
  ['Are walk-ins allowed?', 'Most clinics accept walk-ins, but booked appointments are seen first. Booking online saves waiting time.'],
  ['Is my family\'s information safe?', 'Yes. Your details are used only for your care and are never shared or sold. Read our privacy policy for more.'],
];

const SPECIALITY_FAQS = {
  pediatrics: [
    ['At what age should my child first visit a pediatrician?', 'Ideally within the first week after birth, and then for regular checkups and vaccinations as your pediatrician advises.'],
    ['Do you provide vaccination schedule guidance?', 'Yes, our pediatricians prepare a personalised vaccination schedule during your first visit and remind you when the next dose is due.'],
    ['When should I take my child to the doctor for a fever?', 'Please consult a doctor if the fever lasts more than 2 days, is very high, or comes with rash, breathing trouble, vomiting, unusual sleepiness or refusal to feed. For babies under 3 months, see a doctor immediately.'],
    ['Do you offer growth and development checks?', 'Yes. Regular visits include height, weight, milestones and nutrition guidance so any concern is caught early.'],
  ],
  gynecology: [
    ['How often should I get a routine gynecology checkup?', 'Once a year is usually recommended, or sooner if you have any symptoms or concerns. Your doctor will guide you based on your age and history.'],
    ['Do you offer antenatal care?', 'Yes, our gynecologists provide regular antenatal checkups, scans guidance and nutrition advice throughout pregnancy.'],
    ['Will my consultation be private?', 'Absolutely. Consultations are one-to-one and all your information is kept confidential.'],
  ],
};

// ------------------------------------------------------------------ policy pages
const PAGES = [
  {
    slug: 'privacy-policy', type: 'privacy_policy', title: 'Privacy Policy',
    placeholder: /sample privacy policy/i,
    content: `<p>Normal Child Clinic ("we", "us") respects your family's privacy. This policy explains what we collect and how we use it.</p>
<h2>Information we collect</h2>
<ul><li>Account details such as parent name, phone number and email.</li><li>Your child's basic details (name, date of birth, gender) that you add for booking.</li><li>Appointment, prescription and payment records created when you use the website or visit a clinic.</li></ul>
<h2>How we use it</h2>
<p>We use your information to book and manage appointments, share prescriptions and reminders, process payments and improve our services. We do not sell your information.</p>
<h2>Sharing</h2>
<p>Your medical information is visible only to you and the doctors and clinic staff involved in your child's care. We may share limited data with payment and messaging providers strictly to complete a service you asked for, or when required by law.</p>
<h2>Security and retention</h2>
<p>We protect data with encryption and access controls, and keep records only as long as needed for care and legal requirements.</p>
<h2>Your choices</h2>
<p>You can view or update your details from your dashboard, or contact us to correct or delete your account.</p>
<h2>Contact</h2>
<p>Questions about this policy? Reach us from the <a href="/contact">Contact</a> page.</p>`,
  },
  {
    slug: 'terms-conditions', type: 'terms_conditions', title: 'Terms & Conditions',
    content: `<p>By using this website and booking through it, you agree to the following terms.</p>
<h2>Using the service</h2>
<ul><li>You must give accurate details for yourself and your child.</li><li>Online booking is for non-emergency care. In an emergency, call the emergency number of your nearest clinic or go to the nearest hospital.</li><li>You are responsible for keeping your login details safe.</li></ul>
<h2>Appointments</h2>
<p>An appointment is confirmed only after you receive a confirmation. Clinics may reschedule due to doctor unavailability or emergencies, and will inform you where possible.</p>
<h2>Fees and payments</h2>
<p>Consultation fees are displayed before you confirm. Payment methods differ by clinic. Refunds follow our <a href="/p/refund-policy">Refund Policy</a>.</p>
<h2>Medical information</h2>
<p>Content on this website is for general information and is not a substitute for a doctor's advice, diagnosis or treatment.</p>
<h2>Changes</h2>
<p>We may update these terms from time to time. Continued use of the website means you accept the updated terms.</p>`,
  },
  {
    slug: 'refund-policy', type: 'refund_policy', title: 'Refund & Cancellation Policy',
    content: `<p>We want booking to be stress-free. Here is how cancellations and refunds work.</p>
<h2>Cancelling or rescheduling</h2>
<ul><li>You can cancel or reschedule from My Appointments in your dashboard.</li><li>Please do so at least a few hours before the slot so another family can use it.</li></ul>
<h2>Refunds</h2>
<ul><li>If you paid online and cancel in advance, the amount is refunded to the original payment method.</li><li>If the clinic or doctor cancels, you get a full refund or a free reschedule, as you prefer.</li><li>No refund is due once the consultation has taken place.</li></ul>
<h2>Timeline</h2>
<p>Approved refunds usually reach your account within 5 to 7 working days, depending on your bank.</p>
<h2>Need help?</h2>
<p>Write to us from the <a href="/contact">Contact</a> page with your appointment details.</p>`,
  },
];

// ------------------------------------------------------------------ blog posts (footer "Health Tips")
const POSTS = [
  { slug: 'fever-in-children-when-to-worry', title: 'Fever in Children: What Is Normal and When to Worry', excerpt: 'A simple guide for parents on managing fever at home and knowing when to call the doctor.', tags: ['fever', 'child health'],
    content: '<p>Fever is the body\'s way of fighting infection and is usually not harmful by itself.</p><h2>What you can do at home</h2><ul><li>Keep your child comfortable in light clothing.</li><li>Offer plenty of fluids.</li><li>Use only the medicine and dose your doctor has advised.</li></ul><h2>Call the doctor if</h2><ul><li>Your baby is under 3 months old and has a fever.</li><li>Fever lasts more than 2 days.</li><li>There is a rash, breathing trouble, repeated vomiting, or your child is unusually sleepy.</li></ul>' },
  { slug: 'vaccination-schedule-basics', title: 'Vaccination Schedule Basics for Your Child\'s First Years', excerpt: 'Why on-time vaccines matter and how to keep track of every dose.', tags: ['vaccination', 'newborn'],
    content: '<p>Vaccines protect children from serious diseases. Staying on schedule gives the best protection.</p><h2>Keep track</h2><ul><li>Note every dose in your child\'s health card.</li><li>Ask your pediatrician for the next due date at each visit.</li><li>If a dose is missed, do not worry — the doctor can guide a catch-up plan.</li></ul><p>Your pediatrician will prepare a schedule suited to your child.</p>' },
  { slug: 'healthy-eating-for-toddlers', title: 'Healthy Eating Habits for Toddlers', excerpt: 'Easy ways to build good food habits without mealtime battles.', tags: ['nutrition', 'toddler'],
    content: '<p>Toddlers can be fussy eaters, and that is normal.</p><h2>Simple tips</h2><ul><li>Offer small portions of a variety of foods.</li><li>Eat together as a family whenever possible.</li><li>Limit sugary drinks and packaged snacks.</li><li>Keep trying new foods — it can take many tries before a child accepts them.</li></ul><p>If you are worried about growth or appetite, book a checkup.</p>' },
];

const PLACEHOLDER_IMG = /placeholder\.com/i;

async function run() {
  await mongoose.connect(env.MONGO_URI);
  console.log('[Seed:content] Connected to MongoDB');

  // ---- clinics: slug + demo coordinates so "nearest first" works
  const DEMO_COORDS = { 'Sunrise Clinic - Downtown': [77.2167, 28.6315], 'Sunrise Clinic - Uptown': [77.131, 28.698] };
  const clinics = await Clinic.find({ isActive: true });
  for (const c of clinics) {
    const set = {};
    if (!c.slug) set.slug = await generateUniqueSlug(c.name, c._id);
    const hasCoords = Array.isArray(c.location?.coordinates) && c.location.coordinates.length === 2;
    if (!hasCoords && DEMO_COORDS[c.name]) set.location = { type: 'Point', coordinates: DEMO_COORDS[c.name] };
    if (Object.keys(set).length) {
      await Clinic.updateOne({ _id: c._id }, { $set: set });
      console.log(`[Seed:content] Updated clinic ${c.name}: ${Object.keys(set).join(', ')}`);
    }
  }

  // ---- reviews
  let made = 0;
  for (let i = 0; i < REVIEWS.length; i++) {
    const r = REVIEWS[i];
    if (await Testimonial.findOne({ name: r.name, message: r.message })) continue;
    await Testimonial.create({
      ...r,
      clinic: clinics.length ? clinics[i % clinics.length]._id : undefined,
      order: 10 + i,
      isActive: true,
    });
    made++;
  }
  console.log(`[Seed:content] Reviews added: ${made}`);

  // ---- FAQs
  const addFaq = async ([question, answer], extra = {}, order = 0) => {
    if (await Faq.findOne({ question })) return 0;
    await Faq.create({ question, answer, order, isActive: true, ...extra });
    return 1;
  };
  let faqs = 0;
  for (let i = 0; i < GENERAL_FAQS.length; i++) faqs += await addFaq(GENERAL_FAQS[i], {}, 10 + i);
  for (const [slug, list] of Object.entries(SPECIALITY_FAQS)) {
    const spec = await Speciality.findOne({ slug });
    if (!spec) { console.log(`[Seed:content] Speciality "${slug}" not found, skipping its FAQs`); continue; }
    for (let i = 0; i < list.length; i++) faqs += await addFaq(list[i], { speciality: spec._id }, 30 + i);
  }
  console.log(`[Seed:content] FAQs added: ${faqs}`);

  // ---- policy pages (footer links)
  for (const p of PAGES) {
    const existing = await CmsPage.findOne({ slug: p.slug });
    if (!existing) {
      await CmsPage.create({ title: p.title, slug: p.slug, type: p.type, content: p.content, isActive: true });
      console.log(`[Seed:content] Created page /p/${p.slug}`);
    } else if (p.placeholder && p.placeholder.test(existing.content || '')) {
      existing.content = p.content;
      existing.isActive = true;
      await existing.save();
      console.log(`[Seed:content] Replaced dummy text on /p/${p.slug}`);
    }
  }

  // ---- blog posts
  let cat = await Category.findOne({ slug: 'parenting-tips' });
  if (!cat) cat = await Category.create({ name: 'Parenting Tips', slug: 'parenting-tips', type: 'blog' });
  let posts = 0;
  for (let i = 0; i < POSTS.length; i++) {
    if (await Blog.findOne({ slug: POSTS[i].slug })) continue;
    await Blog.create({ ...POSTS[i], category: cat._id, isPublished: true, publishedAt: new Date(Date.now() - i * 86400000 * 3) });
    posts++;
  }
  console.log(`[Seed:content] Blog posts added: ${posts}`);

  // ---- website settings: fill only what is empty, and drop dummy logos so the real logo shows
  let settings = await WebsiteSetting.findOne();
  if (!settings) settings = new WebsiteSetting();
  const fill = (key, value) => { if (!settings.get(key)) settings.set(key, value); };
  fill('siteName', 'Normal Child Clinic');
  if (settings.siteName === 'Clinic System' || settings.siteName === 'Sunrise Clinic') settings.siteName = 'Normal Child Clinic';
  fill('tagline', 'Better Care. Brighter Future.');
  fill('footerText', 'Trusted healthcare partner for healthier families. Care today, a healthier tomorrow.');
  fill('address', 'New Delhi, India');
  fill('contactEmail', 'contact@normalchildclinic.com');
  fill('contactPhone', '+91 99990 00000');
  for (const k of ['logoHeader', 'logoFooter', 'logoMobile', 'logoDark', 'favicon', 'appleTouchIcon']) {
    const v = settings.get(`branding.${k}`);
    if (v && PLACEHOLDER_IMG.test(v)) settings.set(`branding.${k}`, undefined);
  }
  await settings.save();
  console.log('[Seed:content] Website settings checked');

  console.log('[Seed:content] Done.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[Seed:content] Failed:', err);
  process.exit(1);
});
