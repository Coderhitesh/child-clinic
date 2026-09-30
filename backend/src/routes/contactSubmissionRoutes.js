const router = require('express').Router();
const ctrl = require('../controllers/contactSubmissionController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.post('/', ctrl.submit); // public contact form

router.use(protect, restrictTo('superadmin', 'clinic_admin'));
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.patch('/:id/respond', ctrl.respond);
router.patch('/:id/spam', ctrl.markSpam);

module.exports = router;
