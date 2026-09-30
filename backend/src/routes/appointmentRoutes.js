const router = require('express').Router();
const ctrl = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect);
router.post('/', ctrl.book);
router.post('/walk-in', restrictTo('superadmin', 'clinic_admin', 'receptionist', 'doctor'), ctrl.walkIn);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.get('/:id/slip', ctrl.slip);
router.patch('/:id/reschedule', restrictTo('superadmin', 'clinic_admin', 'receptionist', 'patient'), ctrl.reschedule);
router.patch('/:id/cancel', ctrl.cancel);
router.patch('/:id/status', restrictTo('superadmin', 'clinic_admin', 'doctor', 'receptionist'), ctrl.updateStatus);
router.patch('/:id/fee', restrictTo('superadmin', 'clinic_admin'), ctrl.updateFee);
router.patch('/:id/video', restrictTo('superadmin', 'clinic_admin', 'doctor', 'receptionist'), ctrl.updateVideo);

module.exports = router;
