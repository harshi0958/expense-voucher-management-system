import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { voucherApi } from '../../api';
import { formatDate } from '../../utils/format';

const CATEGORIES = ['Travel', 'Food & Meals', 'Accommodation', 'Office Supplies', 'Training', 'Communication', 'Medical', 'General'];

const EditVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    voucherApi.getById(id).then((res) => {
      const v = res.data;
      if (v.status !== 'draft') {
        navigate(`/employee/vouchers/${id}`);
        return;
      }
      reset({
        expense_date: v.expense_date?.split('T')[0],
        department: v.department,
        title: v.title,
        category: v.category,
        description: v.description,
        amount: v.amount,
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    setSaving(true);
    setServerError('');
    try {
      await voucherApi.update(id, data);
      navigate(`/employee/vouchers/${id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm mb-4">← Back</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Voucher</h1>

      {serverError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Expense Date *</label>
            <input type="date" className="input-field" {...register('expense_date', { required: 'Required' })} />
            {errors.expense_date && <p className="error-text">{errors.expense_date.message}</p>}
          </div>
          <div>
            <label className="label">Department *</label>
            <input type="text" className="input-field" {...register('department', { required: 'Required' })} />
            {errors.department && <p className="error-text">{errors.department.message}</p>}
          </div>
        </div>
        <div>
          <label className="label">Expense Title *</label>
          <input type="text" className="input-field" {...register('title', { required: 'Required' })} />
          {errors.title && <p className="error-text">{errors.title.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input-field" {...register('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (₹) *</label>
            <input type="number" step="0.01" min="0.01" className="input-field"
              {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })} />
            {errors.amount && <p className="error-text">{errors.amount.message}</p>}
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea rows={3} className="input-field" {...register('description')} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditVoucher;

