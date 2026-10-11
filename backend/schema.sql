-- Expense Voucher Management System - Database Schema
-- Run this file to initialize the database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  employee_id VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'director', 'accounts')),
  username VARCHAR(50) UNIQUE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT TRUE,
  account_status VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'pending_email', 'pending_approval', 'disabled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_admin ON users (is_admin) WHERE is_admin = TRUE;

CREATE TABLE IF NOT EXISTS auth_otps (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('registration', 'login')),
  code_hash CHAR(64) NOT NULL,
  challenge_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  challenge_expires_at TIMESTAMP NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  consumed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_otps_user_purpose_sent
  ON auth_otps (user_id, purpose, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_otps_challenge
  ON auth_otps (challenge_hash, purpose);

-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id SERIAL PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expense_date DATE NOT NULL,
  department VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),

  -- Employee info
  employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  employee_ref_id VARCHAR(50),
  employee_signature_url VARCHAR(500),

  -- Director / Approval info
  director_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  director_signature_url VARCHAR(500),
  approval_date TIMESTAMP,
  rejection_reason TEXT,

  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_vouchers_employee_id ON vouchers(employee_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_created_at ON vouchers(created_at);
CREATE INDEX IF NOT EXISTS idx_vouchers_voucher_number ON vouchers(voucher_number);

-- Seed default users (passwords are bcrypt hashed version of "password123")
INSERT INTO users (name, employee_id, email, password_hash, role) VALUES
  ('Alice Johnson', 'EMP001', 'alice@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
  ('Bob Smith', 'EMP002', 'bob@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee'),
  ('Carol White', 'DIR001', 'carol@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'director'),
  ('Dave Brown', 'ACC001', 'dave@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'accounts')
ON CONFLICT (email) DO NOTHING;

-- Note: The seed password for all users is "password123"
-- Change all passwords after initial setup!
