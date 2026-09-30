const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect, restrictTo('superadmin', 'clinic_admin'));
router.get('/appointments', ctrl.appointmentsReport);
router.get('/revenue', ctrl.revenueReport);
router.get('/doctor-performance', ctrl.doctorPerformanceReport);
router.get('/patients', restrictTo('superadmin'), ctrl.patientsReport);

module.exports = router;
