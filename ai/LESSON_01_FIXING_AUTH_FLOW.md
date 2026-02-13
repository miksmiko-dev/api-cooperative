# Lesson 01: Fixing & Completing the Auth Flow (Login + Register)

## Overview
Your login and register endpoints exist but have several issues that need fixing before they'll work end-to-end. This lesson walks through each problem, explains **why** it's a problem, and gives you the corrected code.

---

## Current Problems

| # | File | Issue |
|---|------|-------|
| 1 | `credential.entity.ts` | `password` field has `@Exclude()` but no `@Column()` — TypeORM won't persist it |
| 2 | `auth.service.ts` (login) | Password comparison is commented out — anyone can log in with just an email |
| 3 | `auth.service.ts` (login) | Returns `...member` which includes the raw password hash in the response |
| 4 | `auth.service.ts` (registration) | Uses undefined variable `email` instead of `val.username` |
| 5 | `auth.service.ts` (registration) | `this.hashService.hash()` is async but missing `await` |
| 6 | `auth.service.ts` (registration) | Registration doesn't actually create anything — returns `'test'` |
| 7 | `auth.controller.ts` | Method name typo: `registr` instead of `register` |

---

## Step 1: Fix the Credential Entity

**File:** `src/modules/auth/entities/credential.entity.ts`

**Problem:** The `password` field has `@Exclude()` (good for serialization) but is missing `@Column()`. Without `@Column()`, TypeORM doesn't know this field maps to a database column, so it won't save or read passwords.

**Best Practice:** Always pair `@Exclude()` with `@Column()`. `@Exclude()` is from `class-transformer` and only affects serialization (JSON output). `@Column()` is from TypeORM and affects database mapping. They serve different purposes.

**What to change:**

```typescript
// BEFORE (broken):
@Exclude()
password: string;

// AFTER (correct):
@Exclude()
@Column()
password: string;
```

**Your full corrected entity should look like:**

```typescript
import { Exclude } from 'class-transformer';
import { Role } from 'src/common/constants/roles.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account_id: string;

  @Column()
  account_type: Role;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime' })
  date_created: Date;

  @UpdateDateColumn({ type: 'datetime' })
  date_updated: Date;
}
```

---

## Step 2: Fix the Auth Controller (Typo)

**File:** `src/modules/auth/controllers/auth.controller.ts`

**Problem:** The method is named `registr` — a typo. While it technically works (NestJS routes based on the `@Post('register')` decorator, not the method name), naming matters for readability and maintainability.

**Best Practice:** Method names should clearly describe what they do. Other developers (and future you) will read method names more than decorators when scanning code.

**What to change:**

```typescript
// BEFORE:
@Public()
@Post('register')
registr(@Body() register: AuthRegisterDTO) {
  return this.authService.registration(register);
}

// AFTER:
@Public()
@Post('register')
register(@Body() register: AuthRegisterDTO) {
  return this.authService.register(register);
}
```

> **Note:** We also rename `this.authService.registration()` to `this.authService.register()` for consistency. You'll update the service method name in the next step.

---

## Step 3: Fix the Auth Service — Login Method

**File:** `src/modules/auth/services/auth.service.ts`

**Problem 1:** Password comparison is commented out. This means anyone who knows an email can log in without the correct password. This is a critical security issue.

**Problem 2:** The response uses `...member` spread, which includes ALL fields from the Credential entity — including the password hash. Even though `@Exclude()` exists on the entity, it only works when you use `ClassSerializerInterceptor`. Without it, the raw object is returned as-is.

**Best Practice:** Never trust serialization decorators alone to protect sensitive data. Explicitly select which fields to return. This is called the principle of **defense in depth** — multiple layers of protection.

**What to change for the login method:**

```typescript
async login(value: AuthLoginDTO): Promise<any> {
  const credential = await this.credentialRepository.findOne({
    where: { email: value.email },
  });

  if (!credential) throw new UnauthorizedException('Invalid Credential');

  // Compare the plain-text password with the stored hash
  const isPasswordMatch = await this.hashService.compare(
    value.password,
    credential.password,
  );
  if (!isPasswordMatch) throw new UnauthorizedException('Invalid Credential');

  // Return token + safe fields only (never include password)
  return {
    id: credential.id,
    account_id: credential.account_id,
    email: credential.email,
    account_type: credential.account_type,
    token: this.jwtService.sign({
      id: credential.id,
      account_id: credential.account_id,
      email: credential.email,
    }),
  };
}
```

**Why we return the same error message for both "user not found" and "wrong password":**
This is a security practice called **constant-time error messaging**. If you return "User not found" vs "Wrong password", an attacker can figure out which emails exist in your system. Always use a generic message like "Invalid Credential".

---

## Step 4: Fix the Auth Service — Registration Method

**File:** `src/modules/auth/services/auth.service.ts`

**Problems:**
1. `where: { email }` — `email` is undefined. Should be `val.username`
2. `this.hashService.hash()` returns a `Promise<string>` but missing `await`
3. Doesn't actually create any records
4. Registration needs to create BOTH a `Credential` record AND a `Members` record (since they're linked by `account_id`)

**Best Practice:** When two tables need to be created together, consider using a **database transaction**. If one insert fails, both should roll back. This prevents orphaned records (e.g., a credential exists but no member profile).

**What to change — rename the method and implement it properly:**

```typescript
async register(val: AuthRegisterDTO) {
  // 1. Check for duplicate email
  const existingEmail = await this.credentialRepository.findOne({
    where: { email: val.username },
  });
  if (existingEmail) {
    throw new ConflictException('Email already exists');
  }

  // 2. Generate a unique account_id
  const account_id = crypto.randomUUID();

  // 3. Hash the password (await is required — hash() is async)
  const hashedPassword = await this.hashService.hash(val.password);

  // 4. Create the credential record
  const credential = this.credentialRepository.create({
    account_id,
    email: val.username,
    password: hashedPassword,
    account_type: Role.MEMBER,
  });
  await this.credentialRepository.save(credential);

  // 5. Create the member profile
  const member = this.membersRepository.create({
    account_id,
    first_name: val.first_name,
    last_name: val.last_name,
    birth_date: val.birth_date,
    sex: val.sex,
  });
  await this.membersRepository.save(member);

  return {
    message: 'Registration successful',
    account_id,
  };
}
```

**For this to work, you need to inject the Members repository too.**

Add to the constructor:

```typescript
constructor(
  @InjectRepository(Credential)
  private readonly credentialRepository: Repository<Credential>,
  @InjectRepository(Members)
  private readonly membersRepository: Repository<Members>,
  private readonly hashService: HashService,
  private readonly jwtService: JwtService,
) {}
```

And add the import at the top of the file:

```typescript
import { Members } from 'src/modules/members/entities/member.entity';
import { ConflictException } from '@nestjs/common';
```

**You also need to update `auth.module.ts`** to register the Members entity:

```typescript
imports: [
  TypeOrmModule.forFeature([Credential, Members]),  // Add Members here
  MembersModule,
  PassportModule,
  // ... rest stays the same
],
```

And import at the top:

```typescript
import { Members } from '../members/entities/member.entity';
```

---

## Step 5: Remove Unused Import

**File:** `src/modules/auth/services/auth.service.ts`

You have `import * as bcrypt from 'bcrypt'` at the top but you're using `HashService` instead (which wraps bcrypt internally). Remove the direct bcrypt import.

```typescript
// DELETE this line:
import * as bcrypt from 'bcrypt';
```

**Best Practice:** Don't import libraries directly when you have a wrapper service. The whole point of `HashService` is to centralize hashing logic. If you ever need to switch from bcrypt to argon2, you only change one file.

---

## Step 6: Your Complete Fixed `auth.service.ts`

After all changes, your file should look like this:

```typescript
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthLoginDTO } from '../dto/auth-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Credential } from '../entities/credential.entity';
import { Members } from 'src/modules/members/entities/member.entity';
import { Repository } from 'typeorm';
import { HashService } from 'src/common/hash/hash.service';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDTO } from '../dto/register.dto';
import { Role } from 'src/common/constants/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(Members)
    private readonly membersRepository: Repository<Members>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async login(value: AuthLoginDTO): Promise<any> {
    const credential = await this.credentialRepository.findOne({
      where: { email: value.email },
    });

    if (!credential) throw new UnauthorizedException('Invalid Credential');

    const isPasswordMatch = await this.hashService.compare(
      value.password,
      credential.password,
    );
    if (!isPasswordMatch) throw new UnauthorizedException('Invalid Credential');

    return {
      id: credential.id,
      account_id: credential.account_id,
      email: credential.email,
      account_type: credential.account_type,
      token: this.jwtService.sign({
        id: credential.id,
        account_id: credential.account_id,
        email: credential.email,
      }),
    };
  }

  async register(val: AuthRegisterDTO) {
    const existingEmail = await this.credentialRepository.findOne({
      where: { email: val.username },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const account_id = crypto.randomUUID();

    const hashedPassword = await this.hashService.hash(val.password);

    const credential = this.credentialRepository.create({
      account_id,
      email: val.username,
      password: hashedPassword,
      account_type: Role.MEMBER,
    });
    await this.credentialRepository.save(credential);

    const member = this.membersRepository.create({
      account_id,
      first_name: val.first_name,
      last_name: val.last_name,
      birth_date: val.birth_date,
      sex: val.sex,
    });
    await this.membersRepository.save(member);

    return {
      message: 'Registration successful',
      account_id,
    };
  }
}
```

---

## Testing Your Changes

After making all the changes:

1. **Start the database:** `docker compose up -d`
2. **Start the dev server:** `npm run start:dev`
3. **Test registration** (using curl or Postman):
```bash
curl -X POST http://localhost:3301/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "sex": 0,
    "birth_date": "1990-01-15",
    "region_id": 1,
    "municipal_id": 1,
    "city_id": 1,
    "brgy_id": 1,
    "address": "123 Main St",
    "username": "juan@email.com",
    "password": "StrongP@ss1"
  }'
```

4. **Test login:**
```bash
curl -X POST http://localhost:3301/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@email.com",
    "password": "StrongP@ss1"
  }'
```

5. **Test a protected route** (use the token from login):
```bash
curl http://localhost:3301/api/member/getAllMembers \
  -H "Authorization: Bearer <your-token-here>"
```

---

## Recommendation

Before moving to the next lesson, I recommend you also:
- Rename `AuthRegisterDTO`'s `username` field to `email` for clarity — it accepts an email address, so the field name should reflect that
- Add `@MinLength(7)` and `@MaxLength(12)` back to the password field in `AuthLoginDTO` for consistent validation
- Consider using `@IsEnum(Sex)` instead of `@IsNumber()` + `@MaxLength(1)` for the `sex` field in `AuthRegisterDTO` — it's more precise and self-documenting
