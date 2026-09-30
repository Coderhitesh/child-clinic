const router = require('express').Router();
const ctrl = require('../controllers/headerNotificationController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.get('/active', ctrl.active);
router.get('/', ctrl.list);

router.use(protect, restrictTo('superadmin'));
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
