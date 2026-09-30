const router = require('express').Router();
const ctrl = require('../controllers/specialityController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

router.use(protect, restrictTo('superadmin'));
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
