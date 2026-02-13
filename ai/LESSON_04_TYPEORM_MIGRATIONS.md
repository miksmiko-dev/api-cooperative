# Lesson 04: Setting Up TypeORM Migrations

## Overview
Your project currently uses `synchronize: true` in TypeORM, which auto-creates/modifies database tables based on your entities. This is convenient for development but **dangerous in production** — it can silently drop columns or tables. This lesson teaches you to use **migrations**, which are version-controlled database changes.

---

## Why Migrations Matter

| Feature | `synchronize: true` | Migrations |
|---------|---------------------|------------|
| Auto-creates tables | Yes | No — you run them manually |
| Safe for production | **No** — can drop data | **Yes** — explicit, reviewed changes |
| Version controlled | No | Yes — migration files in git |
| Rollback support | No | Yes — every migration has `up()` and `down()` |
| Team collaboration | Risky — different schemas collide | Safe — migrations run in order |

**Real-world example of what goes wrong:**
You have a `first_name` column. You rename it to `firstName` in your entity. With `synchronize: true`, TypeORM will **drop** `first_name` (losing all data) and **create** `firstName`. With migrations, you'd write an `ALTER TABLE RENAME COLUMN` that preserves data.

---

## Step 1: Install the Required Package

You need the TypeORM CLI to generate and run migrations.

```bash
npm install -D ts-node
```

You already have `typeorm` and `ts-node` may already be installed, but let's ensure it's explicit in devDependencies.

---

## Step 2: Create a TypeORM CLI Configuration

TypeORM CLI needs its own configuration file because it runs outside of NestJS (no dependency injection, no ConfigService).

**Create file:** `src/database/data-source.ts`

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load .env manually since we're outside NestJS
dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
```

**Why a separate file?**
The NestJS `DatabaseModule` uses `ConfigService` which is only available inside the NestJS DI container. The TypeORM CLI is a standalone tool — it can't use `ConfigService`. So we create a `DataSource` that reads `.env` directly.

**Install dotenv if not present:**

```bash
npm install dotenv
```

---

## Step 3: Add Migration Scripts to package.json

**File:** `package.json`

Add these scripts to the `"scripts"` section:

```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts"
  }
}
```

**What each command does:**

| Command | Purpose |
|---------|---------|
| `migration:generate` | Compares your entities to the current DB schema and auto-generates migration code |
| `migration:create` | Creates an empty migration file for manual SQL |
| `migration:run` | Executes all pending migrations |
| `migration:revert` | Undoes the last migration |

---

## Step 4: Disable Synchronize

**File:** `src/database/database.modules.ts`

Change `synchronize` to `false` and add the migrations path:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,  // NEVER true in production
      }),
    }),
  ],
})
export class DatabaseModule {}
```

**Also remove the `console.log`** from the factory function — logging database credentials (even masked) is a bad habit that can leak into production logs.

---

## Step 5: Generate Your First Migration

Make sure your database is running:

```bash
docker compose up -d
```

Then generate a migration based on your current entities:

```bash
npm run migration:generate src/database/migrations/InitialSchema
```

**What happens:**
1. TypeORM connects to your database
2. It compares your entities (`Members`, `Credential`) with the actual database tables
3. It generates a migration file at `src/database/migrations/<timestamp>-InitialSchema.ts`
4. The file contains `up()` (apply changes) and `down()` (revert changes) methods

**The generated file will look something like:**

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`members\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`account_id\` varchar(255) NOT NULL,
        \`first_name\` varchar(255) NOT NULL,
        \`last_name\` varchar(255) NOT NULL,
        \`birth_date\` datetime NOT NULL,
        \`sex\` smallint NOT NULL,
        \`date_created\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`date_updated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_...\` (\`account_id\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);
    // ... similar for credentials table
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`members\``);
    // ... similar for credentials table
  }
}
```

---

## Step 6: Run the Migration

```bash
npm run migration:run
```

**What happens:**
1. TypeORM creates a `migrations` table in your database (tracks which migrations have run)
2. Executes the `up()` method of each pending migration
3. Records the migration as "completed" in the `migrations` table

---

## Step 7: Future Workflow

When you need to change the database schema:

### Scenario: Adding a `phone_number` column to Members

1. **Update the entity first:**
```typescript
// src/modules/members/entities/member.entity.ts
@Column({ nullable: true })
phone_number: string;
```

2. **Generate a migration:**
```bash
npm run migration:generate src/database/migrations/AddPhoneNumberToMembers
```

3. **Review the generated file** — always read what TypeORM generated before running it

4. **Run the migration:**
```bash
npm run migration:run
```

5. **Commit both the entity change AND the migration file** — they go together

### Scenario: Reverting a bad migration

```bash
npm run migration:revert
```

This runs the `down()` method of the last executed migration.

---

## Important Rules

1. **Never edit a migration that has already been run** — If you need to change something, create a new migration
2. **Always review generated migrations** — TypeORM sometimes generates destructive SQL (DROP + CREATE instead of ALTER)
3. **Commit migration files to git** — They are part of your codebase, just like entity files
4. **Run migrations in CI/CD** — Before deploying, run `migration:run` as part of your deployment pipeline
5. **Never mix `synchronize: true` with migrations** — Choose one approach

---

## Recommendation

After completing this lesson, consider:
- Adding a `migration:run` step to your Docker Compose or deployment scripts so migrations run automatically on deploy
- Creating a seed script (`src/database/seeds/`) to populate the database with initial data (like a SUPERADMIN account)
- Adding a `migration:status` script to check which migrations have/haven't been run:
  ```json
  "migration:status": "typeorm-ts-node-commonjs migration:show -d src/database/data-source.ts"
  ```
