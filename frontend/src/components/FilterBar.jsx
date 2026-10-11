/**
 * Reusable search and filter bar for voucher lists
 */
const FilterBar = ({ filters, onChange, showEmployeeFilter = true }) => {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    onChange({});
  };

  return (
    <div className="card mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="label">Voucher #</label>
          <input
            name="voucher_number"
            value={filters.voucher_number || ''}
            onChange={handleChange}
            placeholder="Search by number..."
            className="input-field text-sm"
          />
        </div>
        {showEmployeeFilter && (
          <div>
            <label className="label">Employee Name</label>
            <input
              name="employee_name"
              value={filters.employee_name || ''}
              onChange={handleChange}
              placeholder="Search by name..."
              className="input-field text-sm"
            />
          </div>
        )}
        <div>
          <label className="label">Department</label>
          <input
            name="department"
            value={filters.department || ''}
            onChange={handleChange}
            placeholder="Filter by department..."
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select name="category" value={filters.category || ''} onChange={handleChange} className="input-field text-sm">
            <option value="">All Categories</option>
            <option value="Travel">Travel</option>
            <option value="Food">Food & Meals</option>
            <option value="Accommodation">Accommodation</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Training">Training</option>
            <option value="Communication">Communication</option>
            <option value="Medical">Medical</option>
            <option value="General">General</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={filters.status || ''} onChange={handleChange} className="input-field text-sm">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="label">Date From</label>
          <input type="date" name="date_from" value={filters.date_from || ''} onChange={handleChange} className="input-field text-sm" />
        </div>
        <div>
          <label className="label">Date To</label>
          <input type="date" name="date_to" value={filters.date_to || ''} onChange={handleChange} className="input-field text-sm" />
        </div>
        <div className="flex items-end">
          <button onClick={handleReset} className="btn-secondary w-full text-sm">
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

