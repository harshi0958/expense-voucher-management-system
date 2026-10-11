const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateSignatureImage } = upload;
const {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  uploadVoucherSignature,
} = require('../controllers/voucherController');

// All routes require authentication
router.use(authenticate);

// List vouchers (filtered by role internally)
router.get('/', getVouchers);

// Get single voucher
router.get('/:id', getVoucherById);

// Employee: Create voucher
router.post('/', authorize('employee'), createVoucher);

// Employee: Update draft voucher
router.put('/:id', authorize('employee'), updateVoucher);

// Employee: Delete draft voucher
router.delete('/:id', authorize('employee'), deleteVoucher);

// Employee: Submit voucher
router.post('/:id/submit', authorize('employee'), submitVoucher);

// Director: Approve voucher
router.post('/:id/approve', authorize('director'), approveVoucher);

// Director: Reject voucher
router.post('/:id/reject', authorize('director'), rejectVoucher);

// Upload signature (employee or director)
router.post('/:id/signature', authorize('employee', 'director'), upload.single('signature'), validateSignatureImage, uploadVoucherSignature);

module.exports = router;

