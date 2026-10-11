const pool = require('../config/db');

const getDashboard = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    if (role === 'employee') {
      const result = await pool.query(
        `SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'draft') AS draft,
          COUNT(*) FILTER (WHERE status = 'submitted') AS pending,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved,
          COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
          COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) AS total_approved_amount,
          COALESCE(SUM(amount), 0) AS total_claimed
         FROM vouchers WHERE employee_id = $1`,
        [userId]
      );

      const recentResult = await pool.query(
        `SELECT id, voucher_number, title, amount, status, created_at
         FROM vouchers WHERE employee_id = $1
         ORDER BY created_at DESC LIMIT 5`,
        [userId]
      );

      res.json({ stats: result.rows[0], recent: recentResult.rows });

    } else if (role === 'director') {
      const result = await pool.query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'submitted') AS pending_approval,
          COUNT(*) FILTER (WHERE status = 'approved' AND DATE(approval_date) = CURRENT_DATE) AS approved_today,
          COUNT(*) FILTER (WHERE status = 'rejected' AND DATE(updated_at) = CURRENT_DATE) AS rejected_today,
          COALESCE(SUM(amount) FILTER (WHERE status = 'submitted'), 0) AS total_pending_amount
         FROM vouchers`
      );

      const recentResult = await pool.query(
        `SELECT id, voucher_number, employee_name, title, amount, status, created_at
         FROM vouchers
         ORDER BY created_at DESC LIMIT 10`
      );

      res.json({ stats: result.rows[0], recent: recentResult.rows });

    } else if (role === 'accounts') {
      const result = await pool.query(
        `SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'submitted') AS pending_approval,
          COUNT(*) FILTER (WHERE status = 'approved') AS approved,
          COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
          COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) AS total_approved_amount
         FROM vouchers`
      );

      const recentApproved = await pool.query(
        `SELECT id, voucher_number, employee_name, title, amount, approval_date
         FROM vouchers WHERE status = 'approved'
         ORDER BY approval_date DESC LIMIT 10`
      );

      res.json({ stats: result.rows[0], recent_approved: recentApproved.rows });
    } else if (role === 'admin') {
      const result = await pool.query(
        `SELECT COUNT(*) AS pending_directors
         FROM users
         WHERE role = 'director' AND email_verified = TRUE AND account_status = 'pending_approval'`
      );
      res.json({ stats: result.rows[0] });
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
