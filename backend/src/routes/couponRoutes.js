const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect);
router.post('/validate', ctrl.validate); // any logged-in user previewing a discount

router.use(restrictTo('superadmin', 'clinic_admin'));
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
