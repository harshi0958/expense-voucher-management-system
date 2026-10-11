# Task: Rewrite and Upgrade the Complete README.md for Expense Voucher Management System

Act as a Senior Software Engineer, Technical Writer, and Open-Source Project Maintainer.

I have an **Expense Voucher Management System** project that I need to submit professionally and publish on GitHub. Your task is to inspect the existing project and completely rewrite its root `README.md` into a polished, accurate, production-style technical document suitable for an internship evaluation and portfolio presentation.

## 1. Critical Rules

Before writing the README:

1. Inspect the complete project directory and existing README.
2. Verify the actual implementation by examining the backend, frontend, database configuration, API routes, authentication middleware, migrations, environment variables, and package manifests.
3. Confirm the actual technology stack, commands, folder structure, endpoints, database tables, and environment variable names from the source code.
4. Do not invent features, endpoints, environment variables, database fields, commands, or implementation details.
5. Do not claim that a feature is implemented unless the code supports that claim.
6. Preserve the existing application code and configuration. This task is primarily a documentation task.
7. Do not expose passwords, API keys, JWT secrets, OTP values, database credentials, private tokens, or other sensitive information.
8. Never include real secrets in the README. Reference environment variables and `.env.example` instead.
9. If a feature or behavior cannot be verified, explicitly identify it as unverified instead of presenting it as fact.
10. If an essential detail is missing, document the limitation accurately rather than making assumptions.

## 2. README Structure

Rewrite the complete root `README.md` using the following structure, adapting headings when necessary to reflect the actual implementation.

### A. Project Title and Overview

- Project name: Expense Voucher Management System.
- Write a concise, professional description of the application.
- Explain the business problem it solves and the intended users.
- Explain the main workflow for managing expense vouchers.
- Include only functionality confirmed by the implementation.

### B. Key Features

Organize implemented features into logical categories:

- Authentication and authorization.
- User and administrator functionality, if implemented.
- Expense voucher creation and management.
- Voucher status and approval workflows, if implemented.
- Dashboard and expense statistics.
- Search, filtering, sorting, and pagination, if implemented.
- Database persistence and data validation.
- Email or OTP functionality, if implemented.
- Error handling and security features.

Distinguish implemented features from planned or incomplete functionality.

### C. Technology Stack

Document the actual technologies used, including:

- Frontend framework and relevant libraries.
- Backend runtime and framework.
- Database and database driver/ORM.
- Authentication and authorization mechanisms.
- Email provider or external integrations.
- Development tools and other important dependencies.

Use the project's package manifests and configuration files as the source of truth.

### D. Application Architecture

Explain how the frontend, backend, API layer, authentication system, and PostgreSQL database interact.

Include a Mermaid architecture diagram based on the actual project.

Example structure to adapt:

Browser/UI → Frontend → Backend API → Authentication/Business Logic → PostgreSQL

Add external services only if the application actually uses them.

Also explain the responsibilities of important backend and frontend modules.

### E. Project Directory Structure

Inspect the real repository and provide a useful directory tree.

Include the important files and folders, such as:

- Frontend source.
- Backend source.
- API routes and controllers.
- Middleware and utilities.
- Database schema and migration files.
- Environment example files.
- Tests.
- Root configuration files.

Do not invent directories or files. Keep the tree concise and accurate.

### F. Prerequisites

Document the verified prerequisites, such as:

- Supported Node.js version.
- npm or other package manager.
- PostgreSQL version or compatible requirement.
- Git.
- Any additional runtime or external service required.

Mention how to verify installed versions.

### G. Installation and Local Setup

Provide complete, sequential setup instructions for Windows PowerShell and, where straightforward, equivalent commands for macOS/Linux.

Cover:

1. Clone the GitHub repository.
2. Navigate to the project directory.
3. Install frontend dependencies.
4. Install backend dependencies.
5. Create the PostgreSQL database.
6. Configure the database connection.
7. Apply the required schema or migrations.
8. Configure environment variables.
9. Start the backend.
10. Start the frontend.
11. Verify that the application is running.

Use the actual directory names and package scripts from the repository.

Do not assume that the frontend and backend use the same package manager, port, or environment file.

If database migrations run automatically, explain that. If manual SQL execution is required, provide the verified command and file path.

Clearly distinguish development commands from production build commands.

### H. Environment Configuration

Document the variables actually required by the application, using `backend/.env.example` and other relevant environment files.

Include the following categories where applicable:

- Database connection settings.
- JWT or session configuration.
- Resend or another email provider.
- Administrator bootstrap/configuration settings.
- Frontend API base URL.
- Application port and runtime configuration.

For each variable, explain its purpose, whether it is required, and how to obtain or configure it.

Provide a safe example using placeholders only.

Never publish real credentials.

Explain that `.env` files containing secrets should not be committed to Git.

Do not add speculative environment variables.

### I. Database Schema

Document the actual PostgreSQL schema, including the verified tables:

- `users`
- `vouchers`
- `auth_otps`

For each table, describe:

- Its purpose.
- Important columns and data types.
- Primary keys and foreign keys.
- Relationships between tables.
- Constraints, indexes, and default values where relevant.
- Any important security or lifecycle behavior.

Verify all details against the schema and migrations.

Include an ER diagram using Mermaid, reflecting actual foreign-key relationships. Do not draw relationships that are not supported by the schema.

Explain database initialization and migration behavior.

### J. Authentication and Authorization

Describe the actual authentication flow, including registration/login, token or session handling, protected routes, administrator access, and OTP/email verification where applicable.

Explain:

- How authentication credentials are supplied.
- How protected endpoints validate the user.
- How authorization rules are enforced.
- How OTP expiration, consumption, and attempt limits work, if implemented.
- How administrator configuration is handled.
- What security precautions developers must take.

Do not disclose secrets or describe security controls that are not implemented.

### K. API Documentation

Create a comprehensive API reference based on the actual backend routes and middleware.

Organize endpoints into relevant groups:

1. Authentication.
2. User/profile management.
3. Expense vouchers.
4. Dashboard/statistics.
5. Administrator functions.
6. Other implemented modules.

For every verified endpoint, document:

- HTTP method.
- Actual route path.
- Purpose.
- Authentication requirements.
- Required role or permissions.
- Query parameters.
- Path parameters.
- Request body.
- Successful response structure.
- Relevant error responses and HTTP status codes.

Provide realistic example requests and sanitized JSON responses.

Use placeholders for tokens and personal data.

Document search, filtering, sorting, and pagination parameters only when they exist in the implementation.

Do not fabricate example response fields. Verify examples against route handlers, validation schemas, and service logic.

If a full API specification cannot be verified, document only the confirmed endpoints and clearly state the limitation.

### L. Expense Voucher Workflow

Explain the voucher lifecycle step by step, using the actual supported statuses and transitions.

Describe who can create, view, edit, submit, approve, reject, or delete vouchers according to the real authorization rules.

Document amount validation, required fields, date handling, status changes, and any audit or approval behavior where implemented.

Include a Mermaid workflow diagram based on verified behavior.

If the project does not implement a particular workflow stage, do not imply that it does.

### M. Dashboard and Reporting

Explain the actual dashboard features and how statistics are calculated.

Document the available metrics, date filters, aggregations, and API sources only after verifying their implementation.

Clarify any relevant assumptions about amounts, statuses, date ranges, and excluded records.

### N. Validation, Errors, and Security

Describe the implemented validation rules, error-handling conventions, and security measures.

Cover relevant items such as:

- Input validation.
- Password hashing.
- JWT/session validation.
- Authorization checks.
- SQL injection prevention.
- CORS configuration.
- Secret management.
- Rate limiting.
- OTP protections.
- Safe error responses.

For each security measure, verify the code first. Do not claim that rate limiting, encryption, CSRF protection, or other controls exist without evidence.

Include practical security recommendations separately from currently implemented protections.

### O. Testing and Verification

Inspect the repository to identify actual tests, lint scripts, build scripts, and validation commands.

Document:

- How to run available tests.
- How to run linting and type checks, if configured.
- How to build the frontend and backend.
- How to verify the database connection.
- How to verify critical API endpoints.
- How to confirm that authentication and voucher workflows operate correctly.

If tests are missing, state that honestly and provide a manual smoke-testing checklist without claiming automated test coverage.

### P. Troubleshooting

Include useful troubleshooting steps for verified or common setup issues:

- PostgreSQL connection failures.
- Incorrect database credentials.
- Missing environment variables.
- Port conflicts.
- Dependency installation problems.
- Frontend-to-backend connectivity issues.
- Invalid or expired JWT/OTP.
- Email delivery or provider configuration errors.
- Missing database tables or unapplied migrations.

For each issue, explain how to diagnose and resolve it without exposing secrets or recommending unsafe production shortcuts.

### Q. Assumptions Made

Preserve and review the existing README's seven explicit assumptions.

For each assumption:

- State it clearly.
- Explain why it matters.
- Identify whether it is confirmed by the code, a business-rule assumption, or an unresolved limitation.
- Correct any assumption contradicted by the implementation.

Do not silently delete these seven assumptions. If the existing README contains additional relevant assumptions, preserve them as well.

### R. Database Migration and Rollback Instructions

Document the existing migration procedure accurately.

Include:

1. Pre-migration backup.
2. Required application/database state.
3. Migration file location and execution commands.
4. Post-migration verification.
5. Safe rollback procedure, if one exists.
6. Conditions under which rollback is unsafe or incomplete.
7. Recovery guidance.

Preserve the existing additive migration strategy and guarded rollback approach if they match the implementation.

Never recommend blindly dropping tables or deleting production data.

Clearly explain that a rollback may not restore data removed or transformed by a migration.

### S. Deployment Guide

Provide a practical deployment overview based on the actual stack.

Explain frontend and backend deployment requirements, PostgreSQL hosting, environment configuration, HTTPS, CORS, and email provider setup as applicable.

Separate verified deployment configuration from general recommendations.

Do not claim that the application is production-ready or already deployed unless verified.

Do not invent live URLs.

### T. GitHub Publishing

Document a safe Git workflow for publishing the project.

Include:

- Checking repository status.
- Reviewing changed files.
- Ensuring `.env` and other secrets are excluded.
- Reviewing staged files before committing.
- Creating a descriptive commit.
- Pushing to the correct branch.

Use safe Git commands and remind developers to review staged files before pushing.

Do not overwrite remote history or use force-push commands as a default.

### U. Limitations and Future Improvements

Separate existing limitations from potential future enhancements.

Suggest improvements only where relevant, such as:

- Expanded automated testing.
- Better audit logging.
- Stronger access controls.
- Enhanced reporting.
- API documentation tooling.
- Monitoring and observability.

Do not present future improvements as completed features.

### V. Contributing

Provide a concise contribution workflow appropriate for the repository:

- Fork or branch.
- Make focused changes.
- Run applicable checks.
- Submit a pull request with a clear description.

### W. License

Inspect the repository for a license file and verify any existing license information.

If no license exists, do not invent a license or imply that the repository is open-source under a specific license. State that the licensing terms have not yet been specified.

### X. Author and Project Links

Use only verified repository metadata and existing project information.

Include relevant links, if confirmed:

- GitHub repository.
- Author GitHub profile.
- Live application.
- Contact or portfolio.

Do not fabricate contact information, live deployments, or external URLs.

Keep this section professional and concise.

## 3. Writing and Formatting Standards

The final README must:

- Use clean, professional Markdown.
- Have a logical table of contents with working internal anchors.
- Use consistent heading levels.
- Use concise explanations and readable tables.
- Use fenced code blocks with correct language identifiers.
- Include Mermaid diagrams only where they improve understanding.
- Use valid, copy-pasteable shell commands.
- Use sanitized request and response examples.
- Avoid unnecessary emojis, excessive badges, promotional language, and repetitive descriptions.
- Avoid generic claims such as “fully secure,” “enterprise-grade,” or “production-ready” unless demonstrably justified.
- Be comprehensive enough for a new developer to understand and run the project independently.
- Remain readable rather than becoming an unnecessarily long dump of source code.

## 4. Final Verification

After rewriting `README.md`, perform a consistency review:

1. Check every documented command against `package.json`, scripts, configuration, and actual tooling.
2. Check API routes against the backend implementation.
3. Check database tables and relationships against the schema and migration files.
4. Check every environment variable against the corresponding code.
5. Check that all seven existing assumptions are preserved and reviewed.
6. Check that migration and rollback instructions match the actual scripts and files.
7. Check internal Markdown links, code fences, Mermaid syntax, and the table of contents.
8. Ensure no credentials or secrets appear in the README.
9. Ensure the setup instructions work from a clean checkout as far as the available environment allows.
10. Run any available documentation linting or validation tools, if configured.

Do not claim that commands or tests passed unless you actually executed them and observed the result.

## 5. Scope and Deliverable

- Update the existing root `README.md` in place.
- Preserve all accurate, project-specific documentation and improve its clarity and completeness.
- Do not rewrite application source code, database migrations, or environment configuration merely to make the README easier to write.
- Do not create duplicate README files in subdirectories unless explicitly required.
- If you discover a genuine implementation/documentation mismatch, report it separately instead of silently changing application behavior.

When finished, provide a concise summary containing:

1. The major README sections completed.
2. The actual files inspected.
3. Any inconsistencies or missing implementation details discovered.
4. Any verification commands executed and their actual results.
5. Confirmation that secrets were not added to the documentation.
6. The final Git status and whether the README changes are ready to commit.

**Final objective:** Deliver a complete, accurate, professional, submission-ready README.md for the existing Expense Voucher Management System, grounded in the real codebase rather than assumptions.
