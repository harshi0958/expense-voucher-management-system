const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail } = require('../services/emailService');
const { evaluateOtp } = require('../utils/otpPolicy');

const OTP_TTL_MINUTES = 10;
const CHALLENGE_TTL_MINUTES = 30;
const OTP_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_ROLES = new Set(['employee', 'director']);

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const tokenHash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const otpHash = (code) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required for OTP security');
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(code).digest('hex');
};
const makeOtp = () => crypto.randomInt(0, 1000000).toString().padStart(6, '0');
const makeChallenge = () => crypto.randomBytes(32).toString('hex');
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.is_admin ? 'admin' : user.role,
  employee_id: user.employee_id,
});

const issueOtp = async (user, purpose, challengeHash) => {
  const client = await pool.connect();
  const code = makeOtp();
  let challenge = challengeHash;
  let rawChallenge;
  let challengeExpiresAt;

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1, hashtext($2))', [user.id, purpose]);

    const recent = await client.query(
      `SELECT sent_at FROM auth_otps
       WHERE user_id = $1 AND purpose = $2
       ORDER BY sent_at DESC LIMIT 1`,
      [user.id, purpose]
    );
    if (recent.rows[0]) {
      const secondsSinceLastSend = (Date.now() - new Date(recent.rows[0].sent_at).getTime()) / 1000;
      if (secondsSinceLastSend < OTP_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastSend);
        const error = new Error(`Please wait ${waitSeconds} seconds before requesting another code`);
        error.status = 429;
        throw error;
      }
    }

    if (challenge) {
      const priorChallenge = await client.query(
        `SELECT challenge_expires_at FROM auth_otps
         WHERE user_id = $1 AND purpose = $2 AND challenge_hash = $3
         ORDER BY sent_at DESC LIMIT 1`,
        [user.id, purpose, challenge]
      );
      if (!priorChallenge.rows[0] || new Date(priorChallenge.rows[0].challenge_expires_at) <= new Date()) {
        const error = new Error('This verification session has expired. Please start again.');
        error.status = 400;
        throw error;
      }
      challengeExpiresAt = priorChallenge.rows[0].challenge_expires_at;
    } else {
      rawChallenge = makeChallenge();
      challenge = tokenHash(rawChallenge);
      challengeExpiresAt = new Date(Date.now() + CHALLENGE_TTL_MINUTES * 60 * 1000);
    }

    await client.query(
      `UPDATE auth_otps SET consumed_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL`,
      [user.id, purpose]
    );
    await client.query(
      `INSERT INTO auth_otps
        (user_id, purpose, code_hash, challenge_hash, expires_at, challenge_expires_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + ($5 * INTERVAL '1 minute'), $6)`,
      [user.id, purpose, otpHash(code), challenge, OTP_TTL_MINUTES, challengeExpiresAt]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  try {
    await sendEmail({
      to: user.email,
      subject: purpose === 'registration' ? 'Verify your ExpenseVMS email' : 'Your ExpenseVMS sign-in code',
      text: `Your ExpenseVMS verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes. If you did not request this code, you can ignore this email.`,
    });
  } catch (error) {
    await pool.query(
      `UPDATE auth_otps SET consumed_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND purpose = $2 AND challenge_hash = $3 AND consumed_at IS NULL`,
      [user.id, purpose, challenge]
    );
    error.status = 503;
    error.publicMessage = 'Email delivery is unavailable. Please try again later.';
    throw error;
  }

  return {
    challengeToken: rawChallenge,
    expiresInSeconds: CHALLENGE_TTL_MINUTES * 60,
  };
};

const register = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { name, password, role } = body;
    const email = normalizeEmail(body.email);
    if (body.employee_id != null && typeof body.employee_id !== 'string') {
      return res.status(400).json({ message: 'Employee ID must be text' });
    }
    const employeeId = String(body.employee_id || '').trim() || null;

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 255) {
      return res.status(400).json({ message: 'Name must be between 2 and 255 characters' });
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 255) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
      return res.status(400).json({ message: 'Password must be between 10 and 128 characters' });
    }
    if (!PUBLIC_ROLES.has(role)) {
      return res.status(400).json({ message: 'Only employee or director registration is available' });
    }
    if (employeeId && employeeId.length > 50) {
      return res.status(400).json({ message: 'Employee ID must be no longer than 50 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (name, employee_id, email, password_hash, role, email_verified, account_status)
       VALUES ($1, $2, $3, $4, $5, FALSE, 'pending_email')
       RETURNING id, name, email, role`,
      [name.trim(), employeeId, email, passwordHash, role]
    );

    try {
      const challenge = await issueOtp(result.rows[0], 'registration');
      return res.status(201).json({
        message: 'Verification email sent. Enter the code to finish registration.',
        ...challenge,
      });
    } catch (error) {
      await pool.query('DELETE FROM users WHERE id = $1 AND email_verified = FALSE', [result.rows[0].id]);
      return res.status(error.status || 503).json({
        message: error.publicMessage || error.message || 'Unable to send a verification email',
      });
    }
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { password, role: requestedRole } = body;
    const identity = String(body.email || body.username || '').trim();
    if (!identity || typeof password !== 'string' || !password || password.length > 128) {
      return res.status(400).json({ message: 'Email/username and a valid password are required' });
    }
    if (requestedRole && !['employee', 'director', 'accounts', 'admin'].includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid login portal' });
    }

    const result = await pool.query(
      `SELECT id, name, email, username, password_hash, role, employee_id, is_admin,
              email_verified, account_status
       FROM users
       WHERE email = $1 OR (is_admin = TRUE AND username = $2)`,
      [normalizeEmail(identity), identity]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    const effectiveRole = user.is_admin ? 'admin' : user.role;
    if (requestedRole && requestedRole !== effectiveRole) {
      return res.status(403).json({ message: `Use the ${effectiveRole} sign-in page for this account` });
    }
    if (!user.email_verified) {
      return res.status(403).json({ message: 'Verify your email before signing in' });
    }
    if (user.account_status !== 'active') {
      return res.status(403).json({
        message: user.account_status === 'pending_approval'
          ? 'Your Director account is waiting for Admin authorization'
          : 'This account is not active',
      });
    }

    const challenge = await issueOtp(user, 'login');
    return res.json({
      message: 'A sign-in code was sent to your registered email address',
      ...challenge,
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  const { challengeToken, code } = req.body || {};
  const purpose = req.path.startsWith('/register/') ? 'registration' : 'login';
  if (typeof challengeToken !== 'string' || !/^[a-f0-9]{64}$/.test(challengeToken)
      || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'A valid verification session and 6-digit code are required' });
  }

  const challenge = tokenHash(challengeToken);
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT o.id, o.user_id, o.code_hash, o.expires_at, o.challenge_expires_at,
              o.attempts, o.consumed_at, u.name, u.email, u.role, u.employee_id,
              u.is_admin, u.email_verified, u.account_status
       FROM auth_otps o
       JOIN users u ON u.id = o.user_id
       WHERE o.challenge_hash = $1 AND o.purpose = $2
       ORDER BY o.sent_at DESC LIMIT 1 FOR UPDATE OF o`,
      [challenge, purpose]
    );
    const record = result.rows[0];
    const otpState = evaluateOtp(record, record ? otpHash(code) : '', new Date());
    if (otpState === 'missing' || otpState === 'used' || otpState === 'challenge_expired') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Verification session is invalid or expired' });
    }
    if (otpState === 'expired') {
      await client.query('COMMIT');
      return res.status(400).json({ message: 'Code expired. Request a new code.' });
    }
    if (otpState === 'attempts_exhausted') {
      await client.query('COMMIT');
      return res.status(429).json({ message: 'Too many incorrect codes. Request a new code.' });
    }

    if (otpState === 'incorrect') {
      await client.query('UPDATE auth_otps SET attempts = attempts + 1 WHERE id = $1', [record.id]);
      await client.query('COMMIT');
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    await client.query(
      'UPDATE auth_otps SET consumed_at = CURRENT_TIMESTAMP WHERE id = $1 AND consumed_at IS NULL',
      [record.id]
    );
    if (purpose === 'registration') {
      const status = record.role === 'director' ? 'pending_approval' : 'active';
      await client.query(
        `UPDATE users SET email_verified = TRUE, account_status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [status, record.user_id]
      );
      await client.query('COMMIT');
      return res.json({
        message: status === 'active'
          ? 'Email verified. You can now sign in.'
          : 'Email verified. Your Director account is pending Admin authorization.',
      });
    }

    if (!record.email_verified || record.account_status !== 'active') {
      await client.query('COMMIT');
      return res.status(403).json({ message: 'This account is not active' });
    }
    await client.query('COMMIT');

    const user = {
      id: record.user_id,
      name: record.name,
      email: record.email,
      role: record.role,
      employee_id: record.employee_id,
      is_admin: record.is_admin,
    };
    const token = jwt.sign(
      { userId: user.id, role: user.is_admin ? 'admin' : user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('OTP verification transaction rollback failed', rollbackError.message);
      }
    }
    next(error);
  } finally {
    if (client) client.release();
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { challengeToken, purpose } = body;
    if (typeof challengeToken !== 'string' || !/^[a-f0-9]{64}$/.test(challengeToken)
        || !['registration', 'login'].includes(purpose)) {
      return res.status(400).json({ message: 'A valid verification session and purpose are required' });
    }
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.email_verified, u.account_status
       FROM auth_otps o JOIN users u ON u.id = o.user_id
       WHERE o.challenge_hash = $1 AND o.purpose = $2
       ORDER BY o.sent_at DESC LIMIT 1`,
      [tokenHash(challengeToken), purpose]
    );
    const user = result.rows[0];
    if (!user || (purpose === 'registration' && user.email_verified)
        || (purpose === 'login' && user.account_status !== 'active')) {
      return res.status(400).json({ message: 'Verification session is invalid or expired' });
    }
    const challenge = await issueOtp(user, purpose, tokenHash(challengeToken));
    return res.json({ message: 'A new verification code was sent', ...challenge });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
};

const getMe = async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    employee_id: req.user.employee_id,
  });
};

const getPendingDirectors = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, employee_id, created_at
       FROM users
       WHERE role = 'director' AND email_verified = TRUE AND account_status = 'pending_approval'
       ORDER BY created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const approveDirector = async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE users SET account_status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role = 'director' AND email_verified = TRUE AND account_status = 'pending_approval'
       RETURNING id, name, email, role`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Pending Director account not found' });
    res.json({ message: 'Director account authorized', user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  verifyOtp,
  resendOtp,
  getMe,
  getPendingDirectors,
  approveDirector,
};
