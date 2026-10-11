require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const changeAdminPassword = async () => {
  const password = process.env.ADMIN_NEW_PASSWORD;
  if (!password || password.length < 12 || password.length > 128) {
    throw new Error('Set ADMIN_NEW_PASSWORD to a strong password between 12 and 128 characters');
  }

  const admins = await pool.query('SELECT id FROM users WHERE is_admin = TRUE');
  if (admins.rows.length !== 1) {
    throw new Error('Expected exactly one initialized Admin account');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND is_admin = TRUE',
    [passwordHash, admins.rows[0].id]
  );
  console.log('Admin password changed.');
};

changeAdminPassword()
  .catch((error) => {
    console.error(`Admin password change failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
