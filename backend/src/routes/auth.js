const express = require('express');
const router = express.Router();
const {
  login, register, verifyOtp, resendOtp, getMe, getPendingDirectors, approveDirector,
} = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');
const createRateLimit = require('../middleware/rateLimit');

const loginLimit = createRateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });
const registrationLimit = createRateLimit({ limit: 5, windowMs: 15 * 60 * 1000 });
const otpLimit = createRateLimit({ limit: 10, windowMs: 15 * 60 * 1000 });

router.post('/login', loginLimit, login);
router.post('/register', registrationLimit, register);
router.post('/login/verify', otpLimit, verifyOtp);
router.post('/register/verify', otpLimit, verifyOtp);
router.post('/otp/resend', otpLimit, resendOtp);
router.get('/me', authenticate, getMe);
router.get('/admin/pending-directors', authenticate, authorize('admin'), getPendingDirectors);
router.post('/admin/directors/:id/approve', authenticate, authorize('admin'), approveDirector);

module.exports = router;
