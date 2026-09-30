const router = require('express').Router();
const ctrl = require('../controllers/clinicController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const { enforceClinicScope } = require('../middleware/clinicScope');

router.get('/', optionalAuth, ctrl.list);
router.get('/:id', ctrl.getOne);

router.use(protect);
router.post('/', restrictTo('superadmin'), ctrl.create);
router.patch('/:id', restrictTo('superadmin', 'clinic_admin'), enforceClinicScope, ctrl.update);
router.delete('/:id', restrictTo('superadmin'), ctrl.remove);
router.patch('/:id/specialities', restrictTo('superadmin'), ctrl.assignSpecialities);

module.exports = router;
