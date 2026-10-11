require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const initializeAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;

  if (username !== 'admin') throw new Error('ADMIN_USERNAME must be admin');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set a valid ADMIN_EMAIL before initializing the Admin account');
  }
  if (!password || password.length < 12) {
    throw new Error('Set ADMIN_INITIAL_PASSWORD to a strong initial password of at least 12 characters');
  }

  const existing = await pool.query('SELECT id, is_admin FROM users WHERE username = $1', [username]);
  if (existing.rows.length) {
    if (!existing.rows[0].is_admin) {
      throw new Error('The configured Admin username is already assigned to a non-admin account');
    }
    console.log('Admin account already initialized; password was not changed.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users
      (name, username, email, password_hash, role, is_admin, email_verified, account_status)
     VALUES ('System Administrator', $1, $2, $3, 'accounts', TRUE, TRUE, 'active')`,
    [username, email, passwordHash]
  );
  console.log('Admin account initialized. Run this script again to confirm without changing its password.');
};

initializeAdmin()
  .catch((error) => {
    console.error(`Admin initialization failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
