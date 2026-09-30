const router = require('express').Router();
const ctrl = require('../controllers/slotController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.get('/availability', ctrl.availability);

router.use(protect, restrictTo('superadmin', 'clinic_admin', 'receptionist', 'doctor'));
router.get('/', ctrl.list);
router.post('/generate', ctrl.generate);
router.patch('/:id/block', ctrl.block);
router.patch('/:id/unblock', ctrl.unblock);

module.exports = router;
