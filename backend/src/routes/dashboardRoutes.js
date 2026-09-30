const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect);
router.get('/clinic', restrictTo('superadmin', 'clinic_admin', 'receptionist', 'doctor'), ctrl.clinicDashboard);
router.get('/global', restrictTo('superadmin'), ctrl.globalDashboard);

module.exports = router;
