const router = require('express').Router();
const OnboardingSlide = require('../models/OnboardingSlide');
const crudFactory = require('../utils/crudFactory');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

const ctrl = crudFactory(OnboardingSlide, {
  defaultSort: 'order createdAt',
  softDeleteField: 'isActive',
});

router.get('/', ctrl.list); // public: the app reads this on first run
router.get('/:id', ctrl.getOne);

router.use(protect, restrictTo('superadmin'));
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
