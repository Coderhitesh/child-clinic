const router = require('express').Router();
const ctrl = require('../controllers/appSettingController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.get('/', ctrl.publicConfig); // called by the app on every launch

router.use(protect, restrictTo('superadmin'));
router.get('/admin', ctrl.adminGet);
router.put('/', ctrl.update);

module.exports = router;
