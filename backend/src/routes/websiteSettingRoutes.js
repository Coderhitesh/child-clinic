const router = require('express').Router();
const ctrl = require('../controllers/websiteSettingController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.get('/', ctrl.get); // public

router.use(protect, restrictTo('superadmin'));
router.put('/', ctrl.update);

module.exports = router;
