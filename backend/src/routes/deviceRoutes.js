const router = require('express').Router();
const ctrl = require('../controllers/deviceController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect);
router.post('/', ctrl.register);
router.post('/unregister', ctrl.unregister);
router.get('/me', ctrl.myDevices);
router.post('/test', ctrl.test);

// console views
router.get('/', restrictTo('superadmin', 'clinic_admin'), ctrl.adminList);
router.get('/stats', restrictTo('superadmin', 'clinic_admin'), ctrl.stats);
router.post('/broadcast', restrictTo('superadmin'), ctrl.broadcast);

module.exports = router;
