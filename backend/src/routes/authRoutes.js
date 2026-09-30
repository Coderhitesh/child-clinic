const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/refresh', authLimiter, ctrl.refresh);
router.post('/otp/request', authLimiter, ctrl.requestOtp);
router.post('/otp/verify', authLimiter, ctrl.verifyOtpLogin);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password', authLimiter, ctrl.resetPassword);

router.use(protect);
router.post('/logout', ctrl.logout);
router.get('/me', ctrl.me);
router.patch('/me', ctrl.updateMe);
router.post('/staff', restrictTo('superadmin', 'clinic_admin'), ctrl.createStaff);
router.get('/users', restrictTo('superadmin', 'clinic_admin'), ctrl.listUsers);
router.patch('/users/:id', restrictTo('superadmin', 'clinic_admin'), ctrl.updateUser);

module.exports = router;
