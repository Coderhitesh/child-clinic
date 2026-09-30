const router = require('express').Router();
const ctrl = require('../controllers/paymentModeSettingController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const { enforceClinicScope } = require('../middleware/clinicScope');

router.get('/', ctrl.get); // public: ?clinic=<id> for per-clinic, else global

router.use(protect);
router.put('/global', restrictTo('superadmin'), ctrl.setGlobal);
router.put('/clinic/:clinicId', restrictTo('superadmin', 'clinic_admin'), enforceClinicScope, ctrl.setForClinic);

module.exports = router;
