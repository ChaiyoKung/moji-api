# Project Configuration

## Project
**Moji API** — The backend service for Moji, a minimal and friendly expense tracker app to help you stay mindful with your money — with a touch of charm.

## Development Commands

| Command       | Script            |
|---------------|-------------------|
| Install       | `pnpm install`    |
| Dev           | `pnpm start:dev`  |
| Test (unit)   | `pnpm test`       |
| Test (e2e)    | `pnpm test:e2e`   |
| Lint          | `pnpm lint`       |
| Format        | `pnpm format`     |
| Build         | `pnpm build`      |

## Architecture Overview

### Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** NestJS v11
- **Database:** MongoDB via Mongoose
- **Auth:** JWT + Passport (passport-jwt, passport-local), Google OAuth (google-auth-library)
- **Validation:** class-validator, class-transformer, Zod
- **Testing:** Jest
- **Containerization:** Docker

### Key Architectural Patterns
- NestJS Module → Controller → Service → Mongoose Schema
- Each domain is a self-contained NestJS module

### Directory Structure
- `src/` — application source code, one folder per domain module (accounts, auth, categories, transactions, users, analytics, version)
- `test/` — e2e tests
- `public/` — static assets
- `scripts/` — utility scripts

### Important Development Rules
1. **Code style** — Always run `pnpm format` and `pnpm lint` before committing.
2. **Commit style** — Follow Conventional Commits: `feat(scope): description`, `fix(scope): description`, etc.
3. **Branch policy**
   - Feature branches: based on `main`, prefix `feat/` (e.g. `feat/crud-users`)
   - Hotfix branches: based on `main`, prefix `fix/` (e.g. `fix/auth-google-error`)
4. **Unit tests** — Always write unit tests for pure functions.
