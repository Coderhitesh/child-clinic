const Queue = require('bull');
const conn = require('./connection');
const { generatePrescriptionPdf } = require('../services/prescriptionPdf');
const { enqueueNotification } = require('./notificationQueue');
const { absoluteUrl } = require('../utils/fileUrl');

const pdfQueue = new Queue('prescription-pdf', conn.redis);

const enqueuePrescriptionPdf = (prescriptionId) =>
  pdfQueue.add({ prescriptionId }, { attempts: 3, removeOnComplete: true });

pdfQueue.process(async (job) => {
  const { prescriptionId } = job.data;
  const prescription = await generatePrescriptionPdf(prescriptionId);
  await prescription.populate('patient');

  await enqueueNotification('prescription_ready', {
    prescriptionId: prescription._id,
    patientId: prescription.patient?._id,
    userId: prescription.patient?.guardianUser,
    pdfUrl: absoluteUrl(prescription.pdfUrl),
    email: prescription.patient?.contact?.email,
    phone: prescription.patient?.contact?.phone || prescription.patient?.guardianDetails?.phone,
  });

  return { pdfUrl: prescription.pdfUrl };
});

module.exports = { pdfQueue, enqueuePrescriptionPdf };
