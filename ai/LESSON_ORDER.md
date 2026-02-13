# Lesson Plan: api-cooperative

Complete these lessons in order. Each builds on the previous one.

## Lessons

| # | File | Topic | Depends On |
|---|------|-------|------------|
| 01 | `LESSON_01_FIXING_AUTH_FLOW.md` | Fix login + implement register end-to-end | — |
| 02 | `LESSON_02_ROLES_GUARD.md` | Implement real role-based access control | Lesson 01 (needs working auth) |
| 03 | `LESSON_03_MEMBERS_CRUD.md` | Fix Members CRUD, proper DTOs, REST conventions, soft delete | Lesson 02 (uses @Roles) |
| 04 | `LESSON_04_TYPEORM_MIGRATIONS.md` | Replace `synchronize: true` with version-controlled migrations | Lesson 03 (entities finalized) |

## Existing Reference Docs

These were already in the `ai/` folder and remain useful as reference:

- `PROJECT_CONFIGURATION.md` — npm scripts, dependencies, tech stack overview
- `AUTHENTICATION_IMPLEMENTATION.md` — Passport/JWT setup reference
- `CREATING_A_MODULE.md` — How to scaffold a new NestJS module
