import express from 'express';
import { createVoucher, getVouchers, updateVoucherStatus, getDashboardStats } from '../controllers/voucherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('Employee'), upload.single('signature'), createVoucher)
  .get(protect, getVouchers);

router.get('/stats', protect, getDashboardStats);

router.put('/:id/status', protect, authorize('Director'), upload.single('signature'), updateVoucherStatus);

export default router;