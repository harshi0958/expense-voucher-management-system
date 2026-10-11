/**
 * Generates a unique voucher number in format: VCH-YYYYMM-XXXXX
 */
const generateVoucherNumber = async (pool) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `VCH-${year}${month}-`;

  // Get count of vouchers this month to generate sequence
  const result = await pool.query(
    "SELECT COUNT(*) FROM vouchers WHERE voucher_number LIKE $1",
    [`${prefix}%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  const sequence = String(count).padStart(5, '0');

  return `${prefix}${sequence}`;
};

module.exports = { generateVoucherNumber };

