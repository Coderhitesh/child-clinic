const router = require('express').Router();
const ctrl = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect, restrictTo('superadmin', 'clinic_admin'));
router.get('/', ctrl.list);

module.exports = router;
