# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS 11 REST API for a cooperative management system. Uses TypeORM with MySQL 8.0, JWT authentication via Passport, and class-validator for DTO validation.

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload (watch mode)
npm run start:debug        # Start with debug + watch

# Build
npm run build              # Compile TypeScript to dist/
npm run start:prod         # Run compiled production build

# Testing
npm run test               # Run unit tests (Jest)
npm run test -- --testPathPattern=members  # Run tests matching pattern
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests (uses test/jest-e2e.json)

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

# Database
docker compose up -d       # Start MySQL 8.0 (port 3307)
```

## Architecture

**Global prefix:** All routes are prefixed with `/api`.

**Global pipes/filters:** `main.ts` registers `ValidationPipe` (transform + whitelist) and `AllExceptionsFilter` globally.

**Module structure:** Each feature lives in `src/modules/<feature>/` with subdirectories for controllers, services, entities, dto, guards, and strategies.

**Key modules:**
- **AuthModule** — JWT login/register with Passport. `JwtAuthGuard` is applied globally; use `@Public()` decorator to skip auth on specific routes.
- **MembersModule** — Member CRUD. `Members` entity links to `Credential` entity via `account_id`.
- **DatabaseModule** — TypeORM async config using `ConfigService`. Entities auto-discovered from `modules/**/*.entity{.ts,.js}`.
- **HashModule** — Global bcrypt wrapper (`HashService.hash()`, `HashService.compare()`).
- **HealthModule** — `/health` endpoint via `@nestjs/terminus`.

**Auth flow:** Login returns JWT containing `{id, account_id, email}`. `JwtStrategy` validates the token and attaches the `Members` object to `req.user`. Use `@CurrentUser()` decorator to access it in controllers. `@Roles()` + `RolesGuard` for role-based access.

**Entities:**
- `members` table — id, account_id (unique), first_name, last_name, birth_date, sex (enum)
- `credentials` table — id, account_id (unique), account_type (Role enum), email (unique), password (excluded from serialization), is_active

**Enums:** `Role` (MEMBER, ADMIN, SUPERADMIN), `Sex` (MALE=0, FEMALE=1) in `src/common/constants/`.

## Configuration

Environment variables loaded via `@nestjs/config`. Config files in `src/config/`:
- `app.config.ts` — PORT, NODE_ENV
- `jwt.config.ts` — JWT_SECRET, JWT_EXPIRES_IN
- `swagger.config.ts` — Swagger UI setup

Required `.env` vars: `NODE_ENV`, `PORT`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `JWT_SECRET`, `JWT_EXPIRES_IN`.

## Code Style

- Single quotes, trailing commas (Prettier)
- `@typescript-eslint/no-explicit-any` is disabled
- TypeScript target: ES2023, module: nodenext
- Unit tests colocated with source as `*.spec.ts`
