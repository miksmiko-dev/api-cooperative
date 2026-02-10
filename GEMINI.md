# Project Overview

`api-cooperative` is a backend API built with [NestJS](https://nestjs.com/), designed to manage cooperative systems. It features a modular architecture, authentication via JWT, and database integration using TypeORM with MySQL.

## Tech Stack

-   **Framework:** NestJS (Express under the hood)
-   **Language:** TypeScript
-   **Database:** MySQL 8.0 (via Docker), managed by TypeORM
-   **Authentication:** Passport, JWT Strategy
-   **Validation:** class-validator, class-transformer
-   **Containerization:** Docker Compose
-   **Testing:** Jest (Unit & E2E)

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16+ recommended)
-   [npm](https://www.npmjs.com/)
-   [Docker](https://www.docker.com/) & Docker Compose

### Environment Setup

1.  Clone the repository.
2.  Create a `.env` file in the root directory (copy from a template if available, otherwise use the reference below).

**Required Environment Variables (`.env`):**

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3307
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=cooperative

# JWT Configuration (Ensure these match your jwt.config.ts expectations)
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=3600
```

### Installation

Install the dependencies:

```bash
npm install
```

### Database Setup

Start the MySQL database container:

```bash
docker-compose up -d
```

*   **Port:** The database is exposed on port `3307` (mapped to internal `3306`) to avoid conflicts with local MySQL instances.
*   **Credentials:** Root password is `password` (as defined in `docker-compose.yml`).

### Running the Application

**Development Mode:**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

**Production Mode:**

```bash
npm run build
npm run start:prod
```

## Project Structure

```text
src/
├── app.module.ts        # Main application module
├── main.ts              # Entry point (bootstrapping)
├── common/              # Shared resources (decorators, guards, filters)
├── config/              # Configuration files (app, jwt, swagger)
├── database/            # Database module and connection setup
├── health/              # Health check module
├── modules/             # Feature modules
│   ├── auth/            # Authentication logic
│   └── users/           # User management
└── test/                # E2E tests
```

## Development Conventions

### Linting & Formatting

Ensure code quality before committing:

```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Testing

Run the test suite:

```bash
# Unit tests
npm run test

# End-to-End tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation

The project includes configuration for Swagger (`@nestjs/swagger`), but the setup in `main.ts` appears to be pending or located elsewhere. Once enabled, documentation is typically served at `/api` or `/docs`.

## Key Features

-   **Authentication:** JWT-based auth with `AuthModule` and `JwtAuthGuard`.
-   **User Management:** `UsersModule` for handling user data.
-   **Health Checks:** `HealthModule` for monitoring application status.
-   **Global Validation:** `ValidationPipe` is enabled globally for DTO validation.
