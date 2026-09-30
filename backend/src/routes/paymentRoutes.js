const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect);
router.get('/appointment/:appointmentId', ctrl.getByAppointment);
router.patch('/:id/collect', restrictTo('superadmin', 'clinic_admin', 'receptionist'), ctrl.markCollectedAtClinic);

module.exports = router;
