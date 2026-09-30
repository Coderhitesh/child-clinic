const router = require('express').Router();
const ctrl = require('../controllers/doctorController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const { enforceClinicScope } = require('../middleware/clinicScope');

router.get('/', optionalAuth, ctrl.list);
router.get('/:id', ctrl.getOne);

router.use(protect);
router.post('/', restrictTo('superadmin', 'clinic_admin'), ctrl.create);
router.patch('/:id', restrictTo('superadmin', 'clinic_admin'), ctrl.update);
router.delete('/:id', restrictTo('superadmin', 'clinic_admin'), ctrl.remove);

module.exports = router;
