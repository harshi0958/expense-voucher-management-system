const pool = require('../config/db');
const { generateVoucherNumber } = require('../utils/voucherNumber');

// Helper to build filter query
const buildFilterQuery = (filters, role, userId) => {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Role-based visibility
  if (role === 'employee') {
    conditions.push(`v.employee_id = $${paramIndex++}`);
    params.push(userId);
  }

  // Search filters
  if (filters.voucher_number) {
    conditions.push(`v.voucher_number ILIKE $${paramIndex++}`);
    params.push(`%${filters.voucher_number}%`);
  }
  if (filters.employee_name) {
    conditions.push(`v.employee_name ILIKE $${paramIndex++}`);
    params.push(`%${filters.employee_name}%`);
  }
  if (filters.department) {
    conditions.push(`v.department ILIKE $${paramIndex++}`);
    params.push(`%${filters.department}%`);
  }
  if (filters.category) {
    conditions.push(`v.category ILIKE $${paramIndex++}`);
    params.push(`%${filters.category}%`);
  }
  if (filters.status) {
    conditions.push(`v.status = $${paramIndex++}`);
    params.push(filters.status);
  }
  if (filters.date_from) {
    conditions.push(`v.expense_date >= $${paramIndex++}`);
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push(`v.expense_date <= $${paramIndex++}`);
    params.push(filters.date_to);
  }
  if (filters.amount_min) {
    conditions.push(`v.amount >= $${paramIndex++}`);
    params.push(parseFloat(filters.amount_min));
  }
  if (filters.amount_max) {
    conditions.push(`v.amount <= $${paramIndex++}`);
    params.push(parseFloat(filters.amount_max));
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  return { whereClause, params };
};

// GET /api/vouchers
const getVouchers = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { sort_by = 'created_at', sort_dir = 'desc', page = 1, limit = 20, ...filters } = req.query;

    // Whitelist sortable columns
    const allowedSortCols = ['created_at', 'voucher_number', 'expense_date', 'amount', 'status', 'employee_name'];
    const sortCol = allowedSortCols.includes(sort_by) ? sort_by : 'created_at';
    const sortDir = sort_dir.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { whereClause, params } = buildFilterQuery(filters, role, userId);
    const countParams = [...params];

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM vouchers v ${whereClause}`,
      countParams
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(parseInt(limit), offset);
    const dataResult = await pool.query(
      `SELECT v.id, v.voucher_number, v.voucher_date, v.expense_date,
              v.department, v.title, v.category, v.amount, v.status,
              v.employee_name, v.employee_ref_id,
              v.approval_date, v.created_at, v.updated_at
       FROM vouchers v
       ${whereClause}
       ORDER BY v.${sortCol} ${sortDir}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/vouchers/:id
const getVoucherById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const result = await pool.query(
      `SELECT v.*, 
              u.name AS director_name
       FROM vouchers v
       LEFT JOIN users u ON u.id = v.director_id
       WHERE v.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    const voucher = result.rows[0];

    // Employees can only see their own vouchers
    if (role === 'employee' && voucher.employee_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers
const createVoucher = async (req, res, next) => {
  try {
    const { id: userId, name: userName, employee_id: empRefId } = req.user;
    const { expense_date, department, title, category, description, amount } = req.body;

    // Validation
    const errors = [];
    if (!expense_date) errors.push('Expense date is required');
    if (!department) errors.push('Department is required');
    if (!title) errors.push('Expense title is required');
    if (!amount) errors.push('Amount is required');
    if (amount && parseFloat(amount) <= 0) errors.push('Amount must be greater than zero');

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const voucherNumber = await generateVoucherNumber(pool);

    const result = await pool.query(
      `INSERT INTO vouchers 
        (voucher_number, expense_date, department, title, category, description, amount, status, employee_id, employee_name, employee_ref_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8, $9, $10)
       RETURNING *`,
      [voucherNumber, expense_date, department, title, category || 'General', description, parseFloat(amount), userId, userName, empRefId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// PUT /api/vouchers/:id
const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const { expense_date, department, title, category, description, amount } = req.body;

    const existing = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });

    const voucher = existing.rows[0];
    if (voucher.employee_id !== userId) return res.status(403).json({ message: 'Access denied' });
    if (voucher.status !== 'draft') return res.status(400).json({ message: 'Only draft vouchers can be edited' });

    // Validation
    const errors = [];
    if (amount && parseFloat(amount) <= 0) errors.push('Amount must be greater than zero');
    if (errors.length > 0) return res.status(400).json({ message: 'Validation failed', errors });

    const result = await pool.query(
      `UPDATE vouchers SET
        expense_date = COALESCE($1, expense_date),
        department = COALESCE($2, department),
        title = COALESCE($3, title),
        category = COALESCE($4, category),
        description = COALESCE($5, description),
        amount = COALESCE($6, amount),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [expense_date, department, title, category, description, amount ? parseFloat(amount) : null, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/vouchers/:id
const deleteVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const existing = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });

    const voucher = existing.rows[0];
    if (voucher.employee_id !== userId) return res.status(403).json({ message: 'Access denied' });
    if (voucher.status !== 'draft') return res.status(400).json({ message: 'Only draft vouchers can be deleted' });

    await pool.query('DELETE FROM vouchers WHERE id = $1', [id]);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/submit
const submitVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const existing = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });

    const voucher = existing.rows[0];
    if (voucher.employee_id !== userId) return res.status(403).json({ message: 'Access denied' });
    if (voucher.status !== 'draft') return res.status(400).json({ message: 'Only draft vouchers can be submitted' });
    if (!voucher.employee_signature_url) {
      return res.status(400).json({ message: 'Employee signature is required before submission' });
    }

    const result = await pool.query(
      `UPDATE vouchers SET status = 'submitted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/approve
const approveVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: directorId } = req.user;

    const existing = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });

    const voucher = existing.rows[0];
    if (voucher.status !== 'submitted') {
      return res.status(400).json({ message: 'Only submitted vouchers can be approved' });
    }
    if (!voucher.director_signature_url) {
      return res.status(400).json({ message: 'Director signature is required before approval' });
    }

    const result = await pool.query(
      `UPDATE vouchers SET 
        status = 'approved', 
        director_id = $1,
        approval_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [directorId, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/reject
const rejectVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: directorId } = req.user;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const existing = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });

    const voucher = existing.rows[0];
    if (voucher.status !== 'submitted') {
      return res.status(400).json({ message: 'Only submitted vouchers can be rejected' });
    }

    const result = await pool.query(
      `UPDATE vouchers SET 
        status = 'rejected', 
        director_id = $1,
        rejection_reason = $2,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [directorId, rejection_reason.trim(), id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/vouchers/:id/signature  (upload signature for a voucher)
const uploadVoucherSignature = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'employee' or 'director'
    const { id: userId, role } = req.user;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const existing = await pool.query('SELECT * FROM vouchers WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });

    const voucher = existing.rows[0];

    let updateField;
    if (type === 'director' && role === 'director') {
      if (voucher.status !== 'submitted') {
        return res.status(400).json({ message: 'Can only add director signature to submitted vouchers' });
      }
      updateField = 'director_signature_url';
    } else if (type === 'employee' && role === 'employee') {
      if (voucher.employee_id !== userId) return res.status(403).json({ message: 'Access denied' });
      if (voucher.status !== 'draft') {
        return res.status(400).json({ message: 'Can only update employee signature on draft vouchers' });
      }
      updateField = 'employee_signature_url';
    } else {
      return res.status(400).json({ message: 'Invalid signature type or role mismatch' });
    }

    const result = await pool.query(
      `UPDATE vouchers SET ${updateField} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [fileUrl, id]
    );

    res.json({ message: 'Signature uploaded successfully', voucher: result.rows[0], url: fileUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  submitVoucher,
  approveVoucher,
  rejectVoucher,
  uploadVoucherSignature,
};

