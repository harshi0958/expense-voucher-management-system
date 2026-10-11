import mongoose from 'mongoose';

const expenseItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: { type: String, required: true }, // Travel, Food, Supplies, etc.
  amount: { type: Number, required: true },
});

const voucherSchema = new mongoose.Schema(
  {
    voucherNumber: { type: String, required: true, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [expenseItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
      default: 'Draft',
    },
    employeeSignature: { type: String }, // File path / URL
    directorSignature: { type: String }, // File path / URL
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

const Voucher = mongoose.model('Voucher', voucherSchema);
export default Voucher;