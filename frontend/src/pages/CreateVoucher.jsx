import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Plus, Trash2, Send, Save, ArrowLeft } from 'lucide-react';

const CreateVoucher = () => {
  const [items, setItems] = useState([{ description: '', category: 'Travel', amount: '' }]);
  const [signature, setSignature] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { description: '', category: 'Travel', amount: '' }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (status) => {
    try {
      if (!signature && status === 'Pending Approval') {
        setError('Employee signature upload is mandatory before submitting for approval!');
        return;
      }

      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      formData.append('status', status);
      if (signature) {
        formData.append('signature', signature);
      }

      await API.post('/vouchers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating voucher');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs mb-6 transition"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>

            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Create Expense Voucher</h2>
              <p className="text-sm text-slate-500 mb-8">Fill in your itemized expenses and upload your digital authorization signature.</p>

              {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl mb-6 text-sm font-semibold">{error}</div>}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">Expense Line Items</h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-xl transition"
                  >
                    <Plus size={14} />
                    <span>Add Item</span>
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                    <input
                      type="text"
                      placeholder="Expense Description (e.g. Client Dinner)"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="flex-2 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Travel">Travel</option>
                      <option value="Food">Food</option>
                      <option value="Supplies">Supplies</option>
                      <option value="Client Meeting">Client Meeting</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      required
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="text-rose-500 hover:text-rose-700 p-2.5 rounded-xl bg-rose-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-8 p-6 bg-slate-50 border border-slate-200/60 rounded-2xl">
                <label className="block text-sm font-extrabold text-slate-800 mb-2">Employee Digital Signature (Image Upload)</label>
                <p className="text-xs text-slate-500 mb-4">Required when submitting for directorship approval.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignature(e.target.files[0])}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition cursor-pointer"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSubmit('Draft')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3.5 rounded-2xl font-bold text-sm transition"
                >
                  <Save size={16} />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={() => handleSubmit('Pending Approval')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/25 transition"
                >
                  <Send size={16} />
                  <span>Submit for Approval</span>
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateVoucher;