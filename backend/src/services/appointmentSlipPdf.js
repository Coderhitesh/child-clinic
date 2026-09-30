const PDFDocument = require('pdfkit');
const { loadLogo, addressLine } = require('./prescriptionPdf');

// Same look as the prescription PDF: brand header on top, contact footer at the bottom.
const BRAND = '#263DA5';
const INK = '#1f2937';
const MUTED = '#6b7280';
const LINE = '#e5e7eb';

const fmtDate = (key) => {
  const d = new Date(`${key}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? String(key || '-')
    : d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};
const to12h = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const drName = (n) => (n ? `Dr. ${String(n).replace(/^dr\.?\s*/i, '')}` : '-');
const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;
const PAY_LABEL = { pending: 'Pay at clinic', collected_at_clinic: 'Paid at clinic', paid: 'Paid', refunded: 'Refunded' };

// appointment must be populated: speciality clinic doctor patient payment
async function buildAppointmentSlip(appt, res) {
  const clinic = appt.clinic || {};
  const p = appt.patient || {};
  const logo = await loadLogo(clinic.logo);
  const bookingId = String(appt._id).slice(-8).toUpperCase();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    doc.on('error', reject);
    res.on('finish', resolve);
    res.on('error', reject);
    doc.pipe(res);

    const W = doc.page.width;
    const H = doc.page.height;
    const M = 40;
    const CW = W - M * 2;
    const HEADER_H = 96;
    const FOOTER_H = 70;

    // ---------- header (same as prescription)
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
    doc.font('Helvetica').fontSize(9).fillColor('#E0E7FF')
      .text(addressLine(clinic.address) || clinic.shortDescription || '', tx, doc.y + 2, { width: W - tx - M });

    // ---------- footer (same as prescription)
    const fy = H - FOOTER_H;
    doc.rect(0, fy, W, FOOTER_H).fill('#EEF2FF');
    doc.rect(0, fy, W, 2).fill(BRAND);
    const items = [
      clinic.phone && `Phone: ${clinic.phone}`,
      clinic.alternatePhone && `Alt: ${clinic.alternatePhone}`,
      clinic.whatsappNumber && `WhatsApp: ${clinic.whatsappNumber}`,
      clinic.email && `Email: ${clinic.email}`,
    ].filter(Boolean);
    if (clinic.name) doc.fillColor(INK).font('Helvetica-Bold').fontSize(9).text(clinic.name, M, fy + 12, { width: CW, align: 'center' });
    doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
      .text(items.join('   |   ') || ' ', M, fy + 26, { width: CW, align: 'center' });
    const addr = addressLine(clinic.address);
    if (addr) doc.text(addr, M, fy + 39, { width: CW, align: 'center' });
    doc.fontSize(7.5).fillColor('#9ca3af').text('This is a computer generated appointment slip.', M, fy + 54, { width: CW, align: 'center' });

    // ---------- title row
    let y = HEADER_H + 26;
    doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND).text('Appointment Slip', M, y, { width: CW, lineBreak: false });
    const badgeW = 96;
    if (appt.status) {
      doc.roundedRect(W - M - badgeW, y + 2, badgeW, 24, 12).fill(appt.status === 'confirmed' || appt.status === 'completed' ? '#059669' : '#d97706');
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff')
        .text(String(appt.status).replace('_', ' ').toUpperCase(), W - M - badgeW, y + 9, { width: badgeW, align: 'center', lineBreak: false });
    }
    y += 40;

    // ---------- booking id / date-time highlight box (missing values are left out and the rest reflow)
    const hasVal = (v) => v !== undefined && v !== null && String(v).trim() !== '' && v !== '-';
    const dateText = appt.date && !Number.isNaN(new Date(`${appt.date}T00:00:00`).getTime()) ? fmtDate(appt.date) : '';
    const timeText = [to12h(appt.startTime), to12h(appt.endTime)].filter(Boolean).join(' - ');
    const highlights = [
      ['BOOKING ID', bookingId ? `#${bookingId}` : ''],
      ['DATE', dateText],
      ['TIME', timeText],
    ].filter(([, v]) => hasVal(v));
    doc.roundedRect(M, y, CW, 70, 8).fill('#EEF2FF');
    const big = (label, value, x, w) => {
      doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label, x, y + 14, { width: w, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(15).fillColor(BRAND).text(value, x, y + 28, { width: w, lineBreak: false });
    };
    if (highlights.length === 3) {
      const xs = [M + 16, M + 150, M + 350];
      const ws = [130, 190, 160];
      highlights.forEach(([l, v], i) => big(l, v, xs[i], ws[i]));
    } else {
      const colW = (CW - 32) / highlights.length;
      highlights.forEach(([l, v], i) => big(l, v, M + 16 + i * colW, colW - 8));
    }
    y += 90;

    // ---------- detail grid: empty / zero values are left out, remaining cells reflow
    const ok = (v) => v !== undefined && v !== null && String(v).trim() !== '' && v !== '-';
    const cell = (label, value, x, yy, w) => {
      doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label, x, yy, { width: w, lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(INK).text(String(value), x, yy + 12, { width: w, height: 28, ellipsis: true });
    };
    const col2 = M + CW / 2;
    const w2 = CW / 2 - 12;
    // cells: [label, value, full?]
    const block = (title, cells) => {
      const list = cells.filter(([, v]) => ok(v));
      if (!list.length) return;
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND).text(title, M, y, { lineBreak: false });
      doc.moveTo(M, y + 14).lineTo(M + CW, y + 14).lineWidth(0.6).strokeColor(LINE).stroke();
      y += 22;
      let slot = 0; // 0 = left, 1 = right
      list.forEach(([l, v, full]) => {
        if (full) {
          if (slot === 1) { y += 42; slot = 0; }
          cell(l, v, M, y, CW);
          y += 44;
        } else {
          cell(l, v, slot ? col2 : M, y, w2);
          if (slot) y += 42;
          slot = slot ? 0 : 1;
        }
      });
      if (slot === 1) y += 42;
      y += 10;
    };

    const age = (() => {
      if (Number(p.age) > 0) return `${p.age} yrs`;
      if (p.dob) {
        const days = Math.floor((Date.now() - new Date(p.dob)) / 86400000);
        if (Number.isNaN(days) || days < 0) return '';
        if (days >= 365) return `${Math.floor(days / 365.25)} yrs`;
        if (days >= 30) return `${Math.floor(days / 30.4)} months`;
        return days > 0 ? `${days} days` : '';
      }
      return '';
    })();
    const gender = p.gender ? p.gender[0].toUpperCase() + p.gender.slice(1) : '';
    const guardian = p.guardianDetails?.name
      ? [p.guardianDetails.name, p.guardianDetails.relation && `(${p.guardianDetails.relation})`].filter(Boolean).join(' ')
      : (p.guardianDetails?.relation || '');

    block('PATIENT', [
      ['NAME', p.name],
      ['PATIENT ID', p.patientId],
      ['AGE / GENDER', [age, gender].filter(Boolean).join(' / ')],
      ['CONTACT', p.contact?.phone || p.guardianDetails?.phone],
      ['GUARDIAN', guardian],
    ]);
    block('CONSULTATION', [
      ['DOCTOR', appt.doctor?.name ? drName(appt.doctor.name) : ''],
      ['SPECIALITY', appt.speciality?.name],
      ['CLINIC', clinic.name],
      ['CLINIC PHONE', clinic.phone],
      ['CLINIC ADDRESS', addressLine(clinic.address), true],
      ['REASON FOR VISIT', appt.symptoms, true],
    ]);

    // payment: zero fee / no discount are not shown
    const fee = Number(appt.consultationFee) || 0;
    const payable = Number(appt.payableAmount ?? appt.consultationFee) || 0;
    const disc = Number(appt.discountAmount) || 0;
    block('PAYMENT', [
      ['CONSULTATION FEE', fee > 0 ? money(fee) : ''],
      ['DISCOUNT', disc > 0 ? `- ${money(disc)}${appt.couponCode ? ` (${appt.couponCode})` : ''}` : ''],
      ['AMOUNT PAYABLE', payable > 0 ? money(payable) : ''],
      ['STATUS', fee > 0 || payable > 0 || appt.payment?.status ? (PAY_LABEL[appt.payment?.status] || 'Pay at clinic') : ''],
    ]);

    // ---------- instructions
    const notes = [
      'Please reach the clinic 10 minutes before your appointment time.',
      'Show this slip (printed or on your phone) at the reception desk.',
      'Carry previous prescriptions and reports, if any.',
      'To reschedule or cancel, please do so from your account or call the clinic.',
    ];
    const boxH = 30 + notes.length * 15;
    if (y + boxH < fy - 10) {
      doc.roundedRect(M, y, CW, boxH, 6).fill('#fffbeb');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#b45309').text('IMPORTANT', M + 12, y + 10, { lineBreak: false });
      notes.forEach((n, i) => doc.font('Helvetica').fontSize(9.5).fillColor(INK).text(`\u2022  ${n}`, M + 12, y + 26 + i * 15, { width: CW - 24, lineBreak: false }));
    }

    doc.end();
  });
}

module.exports = { buildAppointmentSlip };
