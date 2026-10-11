BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE is_admin = TRUE)
     OR EXISTS (SELECT 1 FROM users WHERE account_status <> 'active' OR email_verified = FALSE) THEN
    RAISE EXCEPTION 'Rollback blocked: pending accounts or the initialized Admin exist; preserve this data and roll back only after resolving it explicitly.';
  END IF;
END $$;

DROP TABLE auth_otps;
DROP INDEX IF EXISTS idx_users_single_admin;
DROP INDEX IF EXISTS idx_users_username;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_status_check;
ALTER TABLE users
  DROP COLUMN account_status,
  DROP COLUMN email_verified,
  DROP COLUMN is_admin,
  DROP COLUMN username;

COMMIT;
