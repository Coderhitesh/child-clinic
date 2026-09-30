const router = require('express').Router();
const ctrl = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.get('/', optionalAuth, ctrl.list);

router.use(protect, restrictTo('superadmin', 'clinic_admin', 'doctor'));
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.post('/:id/assign', ctrl.assignToPatient);
router.delete('/:id/assign/:patientId', ctrl.unassignFromPatient);

module.exports = router;
