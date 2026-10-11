import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { voucherApi } from '../../api';

const CATEGORIES = ['Travel', 'Food & Meals', 'Accommodation', 'Office Supplies', 'Training', 'Communication', 'Medical', 'General'];

const CreateVoucher = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { category: 'General' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await voucherApi.create(data);
      navigate(`/employee/vouchers/${res.data.id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm mb-4">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Voucher</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details below. The voucher will be saved as Draft.</p>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Expense Date *</label>
            <input type="date" className="input-field" {...register('expense_date', { required: 'Expense date is required' })} />
            {errors.expense_date && <p className="error-text">{errors.expense_date.message}</p>}
          </div>
          <div>
            <label className="label">Department *</label>
            <input type="text" className="input-field" placeholder="e.g. Engineering" {...register('department', { required: 'Department is required' })} />
            {errors.department && <p className="error-text">{errors.department.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Expense Title *</label>
          <input type="text" className="input-field" placeholder="Brief title for this expense" {...register('title', { required: 'Expense title is required' })} />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select className="input-field" {...register('category', { required: true })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (₹) *</label>
            <input type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than zero' },
              })} />
            {errors.amount && <p className="error-text">{errors.amount.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea rows={3} className="input-field" placeholder="Detailed description of the expense..."
            {...register('description')} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : '💾 Save as Draft'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateVoucher;

