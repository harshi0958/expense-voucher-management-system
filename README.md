# Expense Voucher Management System

A full-stack web application for digitizing the employee expense voucher approval workflow at ABC Company.

## Features

- **Role-based access control** — Employee, Director, Accounts Team, and a separately initialized Admin
- **Email OTP** — Email verification at registration and email OTP at sign-in
- **Director authorization** — Self-registered Directors require Admin approval before they can sign in
- **Complete voucher lifecycle** — Draft → Submitted → Approved / Rejected
- **Image upload** — Employee and Director signature uploads
- **Search & Filter** — By voucher number, employee name, department, category, status, and date range (Bonus feature)
- **Dashboards** — Role-specific statistics for each user type
- **JWT Authentication** — Secure, stateless sessions
- **Print/Download** — Voucher printing for Accounts team

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6, React Hook Form, Axios |
| Backend | Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, Multer |
| Database | PostgreSQL |

---

## Project Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone and navigate
```bash
git clone <repo-url>
cd expense-voucher-system
```

### 2. Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE expense_voucher_db;"

# Run schema (creates tables + seed users)
psql -U postgres -d expense_voucher_db -f backend/schema.sql
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Configure DB credentials and generate a private JWT_SECRET with at least 32 random characters

# Start backend
npm run dev   # development (nodemon)
# or
npm start     # production
```

Backend runs on **http://localhost:5000**

#### Existing database upgrade (preserves existing users and vouchers)

The auth upgrade is a standalone, additive migration and is **not run automatically**. The following commands use the project defaults (`localhost:5432`, user `postgres`, database `expense_voucher_db`) and run from the repository root. Adjust them only if your local PostgreSQL settings differ. Back up outside the repository and verify the dump before migrating:

```powershell
$backupDir = 'C:\db-backups'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$backup = Join-Path $backupDir ("expense_voucher_db_{0}.dump" -f (Get-Date -Format 'yyyyMMdd_HHmmss'))

# PostgreSQL 17 default Windows installation path. Adjust only if PostgreSQL is installed elsewhere.
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' --host=localhost --port=5432 --username=postgres --password --format=custom --file="$backup" expense_voucher_db
if ($LASTEXITCODE -ne 0) { throw 'pg_dump failed. Do not apply the migration.' }
if (!(Test-Path $backup) -or (Get-Item $backup).Length -le 0) { throw 'Backup file is missing or empty. Do not apply the migration.' }
Get-Item $backup | Select-Object FullName, Length
```

`--password` prompts for the database password without placing it in command history. A non-empty file and a successful `pg_dump` exit code are required before continuing. For a different database, update the host, port, username, and database name to match the intended target.

Apply only after confirming the backup and the target database:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -v ON_ERROR_STOP=1 --host=localhost --port=5432 --username=postgres --password --dbname=expense_voucher_db --file='backend\migrations\20261011_auth_otp.sql'
if ($LASTEXITCODE -ne 0) { throw 'Migration failed. Do not start the updated application until the database state is reviewed.' }
```

This migration adds account-state/verification metadata and an OTP table. Existing accounts are considered verified and active so they retain their current access; existing voucher rows are not changed. Do not run `schema.sql` against an existing installation as a substitute for this migration.

The paired `20261011_auth_otp.down.sql` rollback is guarded: it refuses to remove auth state if there are pending accounts or an initialized Admin. OTP rows are temporary and are removed by rollback. Resolve pending account states explicitly and take another backup before considering rollback.

#### Email OTP configuration

Set `RESEND_API_KEY` and `EMAIL_FROM` in the untracked `backend/.env` file. `EMAIL_FROM` must be a sender/domain verified with Resend. The API returns an error rather than claiming delivery if credentials are missing or the provider rejects the message. Actual end-to-end delivery remains **unverified until tested with valid Resend credentials and a real inbox**.

#### Initialize the Admin account (once)

After applying the migration, set `ADMIN_USERNAME=admin`, `ADMIN_EMAIL` to a monitored mailbox, and `ADMIN_INITIAL_PASSWORD` in the local `backend/.env`; use the initial password supplied by the project owner. Never put the password in frontend code, this README, source control, or a committed environment file. Initialize the account manually:

```powershell
cd backend
npm run admin:init
```

The initializer hashes the configured password and does not change it if run again. Before deployment, set `ADMIN_NEW_PASSWORD` to a strong replacement in the untracked `.env`, run `npm run admin:password` once from `backend`, then remove `ADMIN_NEW_PASSWORD` from the environment file. This manual rotation command is not run on server startup. The initializer creates one Admin only; public registration cannot assign Admin or Accounts access. Admin credentials require OTP to the configured email address.

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Existing Demo Accounts

The development schema seed includes demo accounts using the sample password `password123`. Do not expose seeded demo credentials in a production deployment; change or remove those accounts through an approved operational process.

| Role | Email | Name |
|------|-------|------|
| Employee | alice@company.com | Alice Johnson |
| Employee | bob@company.com | Bob Smith |
| Director | carol@company.com | Carol White |
| Accounts | dave@company.com | Dave Brown |

---

## Database Schema

### `users`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-incremented primary key |
| name | VARCHAR(255) | Full name |
| employee_id | VARCHAR(50) | Optional employee reference ID |
| email | VARCHAR(255) UNIQUE | Login email |
| password_hash | VARCHAR(255) | bcrypt hashed password |
| role | VARCHAR(20) | `employee` / `director` / `accounts` |
| username | VARCHAR(50) | Optional unique username used by the initialized Admin |
| is_admin | BOOLEAN | Privileged Admin marker; set only by the backend initializer |
| email_verified | BOOLEAN | Email verification state |
| account_status | VARCHAR(30) | `active` / `pending_email` / `pending_approval` / `disabled` |
| created_at | TIMESTAMP | Row creation time |

### `vouchers`
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Auto-incremented primary key |
| voucher_number | VARCHAR(50) UNIQUE | Auto-generated: `VCH-YYYYMM-XXXXX` |
| voucher_date | DATE | Date the voucher was created |
| expense_date | DATE | Date the expense was incurred |
| department | VARCHAR(255) | Employee's department |
| title | VARCHAR(255) | Short expense title |
| category | VARCHAR(100) | Expense category |
| description | TEXT | Detailed description |
| amount | DECIMAL(12,2) | Expense amount (> 0) |
| status | VARCHAR(30) | `draft` / `submitted` / `approved` / `rejected` |
| employee_id | INTEGER FK | References `users.id` |
| employee_name | VARCHAR(255) | Denormalized for display |
| employee_ref_id | VARCHAR(50) | Employee ID at time of voucher |
| employee_signature_url | VARCHAR(500) | Path to uploaded signature image |
| director_id | INTEGER FK | References `users.id` (null until acted upon) |
| director_signature_url | VARCHAR(500) | Path to director's signature image |
| approval_date | TIMESTAMP | When the voucher was approved |
| rejection_reason | TEXT | Reason if rejected |
| created_at | TIMESTAMP | Row creation time |
| updated_at | TIMESTAMP | Last modification time |

### `auth_otps`

Stores only keyed hashes of short-lived codes and challenge tokens, not plaintext OTPs. OTPs expire after 10 minutes, verification challenges after 30 minutes, sends are separated by a 60-second cooldown, and each code has at most five attempts.

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require: `Authorization: Bearer <jwt_token>`

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register an Employee or Director and send email verification OTP |
| POST | `/auth/register/verify` | Verify registration email; Directors remain pending Admin authorization |
| POST | `/auth/login` | Validate password and send login OTP |
| POST | `/auth/login/verify` | Verify login OTP and return JWT |
| POST | `/auth/otp/resend` | Resend an OTP using its short-lived challenge token |
| GET | `/auth/me` | Get current authenticated user |
| GET | `/auth/admin/pending-directors` | Admin: list verified Director registrations awaiting authorization |
| POST | `/auth/admin/directors/:id/approve` | Admin: authorize a pending Director |

#### Login flow

First submit credentials to `/auth/login`. This validates the password and emails an OTP; it does not return a JWT yet. Then submit the returned `challengeToken` and six-digit code to `/auth/login/verify`.

```json
// Request
{ "email": "alice@company.com", "password": "<password>", "role": "employee" }

// POST /auth/login response
{ "message": "A sign-in code was sent to your registered email address", "challengeToken": "<short-lived token>", "expiresInSeconds": 1800 }

// POST /auth/login/verify request
{ "challengeToken": "<short-lived token>", "code": "<six digits>" }
```

The application includes `/employee/login`, `/director/login`, `/accounts/login`, `/admin/login`, `/employee/register`, and `/director/register` screens. The Admin account is provisioned only through `npm run admin:init`.

### Voucher Endpoints
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/vouchers` | All | List vouchers (employees see only theirs) |
| GET | `/vouchers/:id` | All | Get voucher details |
| POST | `/vouchers` | Employee | Create a new draft voucher |
| PUT | `/vouchers/:id` | Employee | Update a draft voucher |
| DELETE | `/vouchers/:id` | Employee | Delete a draft voucher |
| POST | `/vouchers/:id/submit` | Employee | Submit voucher for approval |
| POST | `/vouchers/:id/approve` | Director | Approve a submitted voucher |
| POST | `/vouchers/:id/reject` | Director | Reject with a reason |
| POST | `/vouchers/:id/signature?type=employee\|director` | Employee/Director | Upload signature image |

#### GET /vouchers — Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `voucher_number` | string | Search by voucher number |
| `employee_name` | string | Search by employee name |
| `department` | string | Filter by department |
| `category` | string | Filter by category |
| `date_from` | date | Expense date range start |
| `date_to` | date | Expense date range end |
| `amount_min` | number | Minimum amount |
| `amount_max` | number | Maximum amount |
| `sort_by` | string | Sort column (default: `created_at`) |
| `sort_dir` | string | `asc` or `desc` (default: `desc`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20) |

### Dashboard Endpoint
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Role-specific statistics |

---


## GitHub publishing checklist

Before publishing, keep the local `backend/.env` private. The root `.gitignore` excludes environment files, dependencies, build output, and uploaded signature files. Never force-add these files. From the repository root, after extracting this source ZIP:

```powershell
git init
git add .
git status --short
```

Review the staged list. It must not contain `.env`, `node_modules`, `frontend/dist`, or `backend/uploads` files. Then commit and connect your own GitHub repository:

```powershell
git commit -m "Prepare Expense Voucher Management System"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If the repository already exists locally, do not run `git init` again; check `git status` and `git remote -v` first. Replace the remote URL with your actual repository URL. Do not publish database dumps, local signature uploads, API keys, JWT secrets, or real credentials.

## Verification status

Backend tests can be run with `cd backend` then `npm test`; frontend production compilation can be checked with `cd frontend` then `npm install` and `npm run build`. Real PostgreSQL migration and Resend delivery require your local database backup and valid provider configuration, respectively; they are not performed by the source package.

## Assumptions Made

1. **Password change not implemented** — Seed passwords are demo-only; a change-password feature would be added for production.
2. **No voucher email notifications** — OTP email is implemented through Resend; submission/approval/rejection notifications are not included.
3. **Signature images are stored locally** — In production, a cloud storage service (S3, GCS) should be used.
4. **Director scope** — Authorized Directors share the existing organization-wide voucher review scope.
5. **Voucher number uniqueness** — Uses `VCH-YYYYMM-XXXXX` format with count-based sequence. In high-concurrency scenarios, a DB sequence would be safer.
6. **INR currency** — Currency formatted as Indian Rupees (₹) since ABC Company appears to be an Indian firm.
7. **No pagination UI** — Pagination is implemented on the backend API; the frontend currently loads the first page (up to 20 records). A full pagination UI component can be added.

---

## Folder Structure

```
expense-voucher-system/
├── backend/
│   ├── src/
│   │   ├── app.js                    # Express entry point
│   │   ├── config/db.js              # PostgreSQL pool
│   │   ├── controllers/
│   │   │   ├── authController.js     # Login, /me
│   │   │   ├── voucherController.js  # All voucher operations
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verify + role guard
│   │   │   ├── upload.js             # Multer config
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── vouchers.js
│   │   │   └── dashboard.js
│   │   └── utils/voucherNumber.js
│   ├── uploads/                       # Uploaded signature images
│   ├── migrations/                    # Additive auth migration + guarded rollback
│   ├── scripts/initializeAdmin.js     # One-time Admin initializer
│   ├── schema.sql                     # Fresh-install DB schema + seed data
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                       # Axios + API functions
    │   ├── components/                # Reusable UI components
    │   ├── context/AuthContext.jsx    # Auth state
    │   ├── pages/
    │   │   ├── auth/Login.jsx
    │   │   ├── employee/              # 5 pages
    │   │   ├── director/              # 4 pages
    │   │   └── accounts/             # 3 pages
    │   ├── utils/format.js
    │   └── App.jsx                    # Routes
    └── package.json
```
