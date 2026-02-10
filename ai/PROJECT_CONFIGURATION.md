# Project Configuration & Usage Guide

This guide details how to configure, run, and maintain the `api-cooperative` project, based on the configuration defined in `package.json`.

## 1. Prerequisites

Before starting, ensure you have the following installed:
- **Node.js**: The JavaScript runtime environment required to run the application. We recommend the latest LTS version.
- **npm**: The Node Package Manager, used to install dependencies and run scripts. It comes bundled with Node.js.

## 2. Installation

Install all project dependencies defined in `package.json`.

```bash
npm install
```
*This command reads the `package.json` file and downloads all required libraries into the `node_modules` directory. It also generates a `package-lock.json` to ensure consistent dependency versions across different environments.*

## 3. Scripts & Commands

The following scripts are available for development, testing, and production.

### Development

- **Start (Standard):**
  ```bash
  npm run start
  ```
  *Compiles the application and starts the server. This is useful for checking if the app runs correctly without the overhead of file watchers.*

- **Start (Watch Mode):**
  ```bash
  npm run start:dev
  ```
  *Recommended for active development. It watches for file changes in the `src` directory and automatically recompiles and restarts the server, speeding up your workflow.*

- **Start (Debug):**
  ```bash
  npm run start:debug
  ```
  *Runs the application in debug mode with watch enabled. This allows you to attach a debugger (like the one in VS Code or Chrome DevTools) to inspect variables and step through code.*

### Production

- **Build:**
  ```bash
  npm run build
  ```
  *Compiles the TypeScript code into optimized JavaScript in the `dist` directory. This step is required before deploying to production.*

- **Start (Production):**
  ```bash
  npm run start:prod
  ```
  *Runs the compiled application from `dist/main.js`. This is the command you should use in your production environment (e.g., inside a Docker container) for best performance.*

### Code Quality & Formatting

- **Lint:**
  ```bash
  npm run lint
  ```
  *Runs ESLint to analyze the codebase for potential errors, stylistic issues, and bad practices. The `--fix` flag is included to automatically correct many issues.*

- **Format:**
  ```bash
  npm run format
  ```
  *Runs Prettier to format the code according to the project's style rules (indentation, quotes, etc.), ensuring a consistent codebase.*

### Testing

- **Unit Tests:**
  ```bash
  npm run test
  ```
  *Runs the standard unit test suite using Jest. It looks for files ending in `.spec.ts`.*

- **Watch Tests:**
  ```bash
  npm run test:watch
  ```
  *Runs tests in watch mode. Jest will re-run tests related to changed files, giving you immediate feedback during development.*

- **Coverage:**
  ```bash
  npm run test:cov
  ```
  *Runs the tests and generates a code coverage report, showing which lines of code are covered by tests and which are not.*

- **End-to-End (E2E) Tests:**
  ```bash
  npm run test:e2e
  ```
  *Runs end-to-end integration tests using the configuration in `test/jest-e2e.json`. These tests verify the application works as a whole, typically by making real HTTP requests.*

## 4. Key Dependencies & Tech Stack

Based on the `dependencies` and `devDependencies`, this project uses:

- **Framework:**
  - **NestJS** (`@nestjs/core`, `@nestjs/common`): A progressive Node.js framework for building efficient, scalable server-side applications. It uses modern JavaScript and is built with and fully supports TypeScript.

- **Platform:**
  - **Express** (`@nestjs/platform-express`): The underlying HTTP server framework used by NestJS. It handles request routing and middleware.

- **Database:**
  - **TypeORM** (`@nestjs/typeorm`, `typeorm`): An Object-Relational Mapper (ORM) that allows you to interact with the database using TypeScript classes and objects instead of raw SQL.
  - **Drivers**:
    - `mysql2`: The driver for connecting to MySQL databases.
    - `pg`: The driver for connecting to PostgreSQL databases.

- **Authentication:**
  - **Passport** (`@nestjs/passport`, `passport`): A popular authentication middleware for Node.js.
  - **JWT** (`passport-jwt`, `@types/passport-jwt`): Strategies for handling JSON Web Token (JWT) authentication, allowing stateless user sessions.

- **Validation:**
  - **class-validator**: Uses decorators (like `@IsString()`, `@Min()`) to define validation rules for your Data Transfer Objects (DTOs).
  - **class-transformer**: Transforms plain JavaScript objects into typed class instances, often used in conjunction with validation.

- **Documentation:**
  - **Swagger** (`@nestjs/swagger`, `swagger-ui-express`): Automatically generates interactive API documentation from your code and decorators.

- **HTTP Client:**
  - **Axios** (`@nestjs/axios`): A promise-based HTTP client used to make requests to external APIs.

- **Testing:**
  - **Jest** (`jest`, `ts-jest`): A delightful JavaScript testing framework with a focus on simplicity. `ts-jest` allows Jest to test TypeScript files directly.
  - **Supertest** (`supertest`): Used in E2E tests to simulate HTTP requests to the application.

## 5. Configuration Notes

- **Jest Configuration:** The `jest` key in `package.json` configures the test runner to look for files ending in `.spec.ts` inside the `src` directory and uses `ts-jest` for transformation. It also sets the coverage directory.
- **Environment:** While `package.json` manages dependencies, runtime configuration (like database credentials) typically relies on environment variables (often loaded via `@nestjs/config`). Ensure a `.env` file is set up in the root directory, following the example in `GEMINI.md`.