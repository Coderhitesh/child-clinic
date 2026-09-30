const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Prescription = require('../models/Prescription');

const OUT_DIR = path.join(__dirname, '..', '..', 'generated', 'prescriptions');
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const pdfPath = (id) => path.join(OUT_DIR, `${id}.pdf`);
const PDF_VERSION = 4; // bump => old PDFs regenerate with new design

const BRAND = '#263DA5';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';
const SLOTS = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['night', 'Night']];
const FOOD = { before: 'Before food', after: 'After food', with: 'With food' };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

// logo: local /uploads path, or http(s) url. Returns Buffer or null.
async function loadLogo(logo) {
  if (!logo) return null;
  try {
    const at = logo.indexOf('/uploads/');
    if (at !== -1) {
      const f = path.join(UPLOAD_DIR, logo.slice(at + 9).split('?')[0]);
      if (path.resolve(f).startsWith(path.resolve(UPLOAD_DIR)) && fs.existsSync(f)) return fs.readFileSync(f);
    }
    if (/^https?:\/\//i.test(logo)) {
      const r = await fetch(logo);
      if (!r.ok) return null;
      return Buffer.from(await r.arrayBuffer());
    }
    const rel = logo.replace(/^\/?uploads\//, '');
    const f = path.join(UPLOAD_DIR, rel);
    return fs.existsSync(f) ? fs.readFileSync(f) : null;
  } catch { return null; }
}

const addressLine = (a = {}) => [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ');

async function generatePrescriptionPdf(prescriptionId) {
  const rx = await Prescription.findById(prescriptionId).populate('patient doctor clinic');
  if (!rx) throw new Error('Prescription not found');

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const filePath = pdfPath(prescriptionId);
  const clinic = rx.clinic || {};
  const logo = await loadLogo(clinic.logo);
  const rxImages = (await Promise.all((rx.images || []).map(loadLogo))).filter(Boolean);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W = doc.page.width;
    const H = doc.page.height;
    const M = 40;
    const CW = W - M * 2;
    const HEADER_H = 96;
    const FOOTER_H = 70;
    const BODY_BOTTOM = H - FOOTER_H - 10;

    const header = () => {
      doc.rect(0, 0, W, HEADER_H).fill(BRAND);
      let tx = M;
      if (logo) {
        try {
          doc.roundedRect(M, 18, 60, 60, 8).fill('#ffffff');
          doc.image(logo, M + 4, 22, { fit: [52, 52], align: 'center', valign: 'center' });
          tx = M + 76;
        } catch { /* bad image, skip */ }
      }
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20).text(clinic.name || 'Clinic', tx, 30, { width: W - tx - M });
      const sub = addressLine(clinic.address) || clinic.shortDescription;
      if (sub) doc.font('Helvetica').fontSize(9).fillColor('#E0E7FF').text(sub, tx, doc.y + 2, { width: W - tx - M });
    };

    const footer = () => {
      const y = H - FOOTER_H;
      doc.rect(0, y, W, FOOTER_H).fill('#EEF2FF');
      doc.rect(0, y, W, 2).fill(BRAND);
      const items = [
        clinic.phone && `Phone: ${clinic.phone}`,
        clinic.alternatePhone && `Alt: ${clinic.alternatePhone}`,
        clinic.whatsappNumber && `WhatsApp: ${clinic.whatsappNumber}`,
        clinic.email && `Email: ${clinic.email}`,
      ].filter(Boolean);
      if (clinic.name) doc.fillColor(INK).font('Helvetica-Bold').fontSize(9).text(clinic.name, M, y + 12, { width: CW, align: 'center' });
      doc.font('Helvetica').fontSize(8.5).fillColor(MUTED);
      if (items.length) doc.text(items.join('   |   '), M, y + 26, { width: CW, align: 'center' });
      const addr = addressLine(clinic.address);
      if (addr) doc.text(addr, M, y + 39, { width: CW, align: 'center' });
      doc.fontSize(7.5).fillColor('#9ca3af').text('This is a computer generated prescription.', M, y + 54, { width: CW, align: 'center' });
    };

    header();

    const has = (v) => v !== undefined && v !== null && String(v).trim() !== '' && !(typeof v === 'number' && v <= 0);
    const drName = rx.doctor?.name ? `Dr. ${String(rx.doctor.name).replace(/^dr\.?\s*/i, '')}` : '';

    // patient / doctor box: only fields that actually have a value
    const p = rx.patient || {};
    const ageText = (() => {
      if (p.dob) {
        const days = Math.floor((Date.now() - new Date(p.dob)) / 86400000);
        if (Number.isNaN(days) || days < 0) return '';
        if (days >= 365) return `${Math.floor(days / 365.25)} yrs`;
        if (days >= 30) return `${Math.floor(days / 30.4)} months`;
        return days > 0 ? `${days} days` : '';
      }
      return has(p.age) ? `${p.age} yrs` : '';
    })();
    const gender = p.gender ? p.gender[0].toUpperCase() + p.gender.slice(1) : '';
    const info = [
      ['PATIENT', p.name],
      ['PATIENT ID', p.patientId],
      ['AGE / GENDER', [ageText, gender].filter(Boolean).join(' / ')],
      ['DATE', fmtDate(rx.createdAt)],
      ['DOCTOR', drName],
      ['FOLLOW-UP', rx.followUpDate ? fmtDate(rx.followUpDate) : ''],
    ].filter(([, v]) => has(v));

    let y = HEADER_H + 18;
    const cell = (label, value, x, yy, w) => {
      doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label, x, yy, { width: w, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(value, x, yy + 11, { width: w, lineBreak: false, ellipsis: true });
    };
    if (info.length) {
      const perRow = 3;
      const rowsN = Math.ceil(info.length / perRow);
      const boxH = 16 + rowsN * 26;
      const colW = (CW - 24) / perRow;
      doc.roundedRect(M, y, CW, boxH, 6).lineWidth(0.8).strokeColor(LINE).stroke();
      info.forEach(([l, v], i) => cell(l, v, M + 12 + (i % perRow) * colW, y + 10 + Math.floor(i / perRow) * 26, colW - 8));
      y += boxH + 18;
    }

    if (has(rx.diagnosis)) {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND).text('DIAGNOSIS', M, y);
      doc.font('Helvetica').fontSize(11).fillColor(INK).text(rx.diagnosis, M, y + 13, { width: CW });
      y = doc.y + 14;
    }

    // medicines: skip empty entries, and only draw the columns that at least one medicine uses
    const meds = (rx.medicines || []).filter((m) => has(m.name) || has(m.dosage) || (m.timings || []).length || has(m.frequency) || has(m.food));
    const anyDose = meds.some((m) => has(m.dosage));
    const anyTimings = meds.some((m) => (m.timings || []).length);
    const anyFreq = meds.some((m) => !(m.timings || []).length && has(m.frequency));
    const anyFood = meds.some((m) => FOOD[m.food]);
    const anyDays = meds.some((m) => has(m.durationDays));

    if (meds.length) {
      doc.font('Helvetica-Bold').fontSize(26).fillColor(BRAND).text('Rx', M, y - 4);
      y += 30;

      const slotW = 32;
      const cols = [];
      if (anyDose) cols.push({ k: 'dose', w: 72, label: 'DOSE' });
      if (anyTimings || anyFreq) cols.push({ k: 'when', w: anyTimings ? slotW * 4 + 4 : 110, label: anyTimings ? null : 'WHEN' });
      if (anyFood) cols.push({ k: 'food', w: 68, label: 'FOOD' });
      if (anyDays) cols.push({ k: 'days', w: 54, label: 'DAYS' });
      const numW = 24;
      const nameW = CW - numW - cols.reduce((t, c) => t + c.w, 0) - 6;
      let cx = M + numW + nameW + 6;
      cols.forEach((c) => { c.x = cx; cx += c.w; });
      const col = (k) => cols.find((c) => c.k === k);

      const head = () => {
        doc.rect(M, y, CW, 22).fill(BRAND);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
        doc.text('#', M + 6, y + 7, { lineBreak: false });
        doc.text('MEDICINE', M + numW, y + 7, { lineBreak: false });
        cols.forEach((c) => {
          if (c.k === 'when' && anyTimings) {
            SLOTS.forEach(([, label], i) => doc.text(label.slice(0, 3).toUpperCase().replace('NIG', 'NGT'), c.x + i * slotW - 2, y + 7, { width: slotW, align: 'center', lineBreak: false }));
          } else doc.text(c.label, c.x, y + 7, { lineBreak: false });
        });
        y += 22;
      };
      head();

      meds.forEach((m, i) => {
        const noteH = has(m.instructions) ? 12 : 0;
        const rowH = 26 + noteH;
        if (y + rowH > BODY_BOTTOM) {
          footer(); doc.addPage(); header();
          y = HEADER_H + 20;
          head();
        }
        if (i % 2 === 1) doc.rect(M, y, CW, rowH).fill('#f9fafb');
        doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(String(i + 1), M + 6, y + 8, { lineBreak: false });
        if (has(m.name)) doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(m.name, M + numW, y + 8, { width: nameW, lineBreak: false, ellipsis: true });

        const dose = col('dose');
        if (dose && has(m.dosage)) doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(m.dosage, dose.x, y + 8, { width: dose.w - 6, lineBreak: false, ellipsis: true });

        const when = col('when');
        if (when) {
          if ((m.timings || []).length) {
            SLOTS.forEach(([key], idx) => {
              const bx = when.x + idx * slotW + slotW / 2 - 2;
              const on = m.timings.includes(key);
              doc.roundedRect(bx - 6, y + 7, 12, 12, 2).lineWidth(0.8).strokeColor(on ? BRAND : '#d1d5db').stroke();
              if (on) doc.moveTo(bx - 3, y + 13).lineTo(bx - 0.5, y + 16.5).lineTo(bx + 4, y + 9.5).lineWidth(1.6).strokeColor(BRAND).stroke();
            });
          } else if (has(m.frequency)) {
            doc.font('Helvetica').fontSize(9).fillColor(INK).text(m.frequency, when.x, y + 8, { width: when.w - 6, lineBreak: false, ellipsis: true });
          }
        }

        const food = col('food');
        if (food && FOOD[m.food]) doc.font('Helvetica').fontSize(9).fillColor(INK).text(FOOD[m.food], food.x, y + 8, { width: food.w - 4, lineBreak: false });
        const days = col('days');
        if (days && has(m.durationDays)) doc.font('Helvetica').fontSize(9).fillColor(INK).text(`${m.durationDays} days`, days.x, y + 8, { width: days.w, lineBreak: false });

        if (noteH) doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(MUTED).text(`Note: ${m.instructions}`, M + numW, y + 25, { width: CW - numW - 6, lineBreak: false, ellipsis: true });
        doc.moveTo(M, y + rowH).lineTo(M + CW, y + rowH).lineWidth(0.5).strokeColor(LINE).stroke();
        y += rowH;
      });
    }

    if (has(rx.generalInstructions)) {
      y += 16;
      const h = doc.heightOfString(rx.generalInstructions, { width: CW - 24 }) + 34;
      if (y + h > BODY_BOTTOM) { footer(); doc.addPage(); header(); y = HEADER_H + 20; }
      doc.roundedRect(M, y, CW, h, 6).fill('#fffbeb');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#b45309').text('ADVICE / INSTRUCTIONS', M + 12, y + 10);
      doc.font('Helvetica').fontSize(10).fillColor(INK).text(rx.generalInstructions, M + 12, y + 24, { width: CW - 24 });
      y += h;
    }

    // doctor sign (only when the doctor's name is known)
    if (drName && (meds.length || has(rx.diagnosis) || has(rx.generalInstructions))) {
      const signY = Math.min(y + 30, BODY_BOTTOM - 30);
      doc.moveTo(W - M - 140, signY + 20).lineTo(W - M, signY + 20).lineWidth(0.8).strokeColor(MUTED).stroke();
      doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(drName, W - M - 140, signY + 24, { width: 140, align: 'center' });
    }

    // uploaded prescription photos, one per page inside the same header/footer
    rxImages.forEach((buf) => {
      footer();
      doc.addPage();
      header();
      try {
        doc.image(buf, M, HEADER_H + 20, { fit: [CW, BODY_BOTTOM - HEADER_H - 30], align: 'center', valign: 'top' });
      } catch { /* unsupported format (e.g. webp), skip */ }
    });

    footer();
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  rx.pdfUrl = `/files/prescriptions/${prescriptionId}.pdf`;
  rx.pdfStatus = 'generated';
  rx.pdfVersion = PDF_VERSION;
  await rx.save();
  return rx;
}

// Makes sure the file exists on disk and is on the latest design.
async function ensurePrescriptionPdf(prescription) {
  const ok = prescription.pdfStatus === 'generated' && prescription.pdfVersion === PDF_VERSION && fs.existsSync(pdfPath(prescription._id));
  if (ok) return prescription;
  try {
    await generatePrescriptionPdf(prescription._id);
    const fresh = await Prescription.findById(prescription._id);
    prescription.pdfUrl = fresh.pdfUrl;
    prescription.pdfStatus = fresh.pdfStatus;
    prescription.pdfVersion = fresh.pdfVersion;
  } catch (err) {
    console.error('[pdf] on-demand generation failed', err.message);
  }
  return prescription;
}

module.exports = { generatePrescriptionPdf, ensurePrescriptionPdf, pdfPath, loadLogo, addressLine };
