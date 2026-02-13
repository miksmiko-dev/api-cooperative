# Lesson 02: Implementing Proper Role-Based Access Control (RBAC)

## Overview
Your `RolesGuard` currently returns `true` for everyone — meaning **any authenticated user can access any endpoint**, regardless of their role. This lesson implements real RBAC so that endpoints decorated with `@Roles(Role.ADMIN)` actually restrict access.

---

## How RBAC Works in NestJS (Concept)

```
Request → JwtAuthGuard → RolesGuard → Controller
              ↓               ↓
       "Who are you?"   "Are you allowed?"
```

1. **JwtAuthGuard** runs first — validates the JWT token and attaches `req.user`
2. **RolesGuard** runs second — reads the `@Roles()` decorator, checks if `req.user` has the required role
3. If both pass, the controller method executes

**Key concept:** Guards run in the order they are registered. Since `JwtAuthGuard` populates `req.user`, it **must** run before `RolesGuard`.

---

## Current Problem

**File:** `src/common/guards/roles.guard.ts`

```typescript
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (!requiredRoles) return true;

  // BUG: Always returns true — never checks the user's role!
  return true;
  // const { user } = context.switchToHttp().getRequest();
  // return requiredRoles.includes(user.role);
}
```

The commented-out code was almost correct, but has one issue: it checks `user.role`, but your `req.user` is a `Members` entity which doesn't have a `role` field. The role lives in the `Credential` entity under `account_type`.

---

## The Fix Requires Understanding Your Data Flow

Your JWT payload (set in `auth.service.ts` login) contains:
```typescript
{ id, account_id, email }
```

Your `JwtStrategy.validate()` fetches the `Members` entity and attaches it to `req.user`:
```typescript
async validate(payload: any): Promise<Members> {
  const member = await this.membersService.findOne(payload.account_id);
  return member;  // This becomes req.user
}
```

**Problem:** The `Members` entity doesn't have a role/account_type field. The role is stored in `Credential`. So `req.user.role` or `req.user.account_type` will be `undefined`.

**Two options to fix this:**

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | Include `account_type` in the JWT payload, read it in `validate()` | No extra DB query | Role changes won't take effect until token is refreshed |
| B | Fetch Credential in `validate()` along with Members | Always fresh role data | Extra DB query on every request |

**Recommended: Option A** — It's more performant, and role changes are rare. If an admin changes someone's role, requiring them to re-login is acceptable behavior.

---

## Step 1: Update the JWT Payload (Auth Service)

**File:** `src/modules/auth/services/auth.service.ts`

In the `login()` method, add `account_type` to the JWT payload:

```typescript
// BEFORE:
token: this.jwtService.sign({
  id: credential.id,
  account_id: credential.account_id,
  email: credential.email,
}),

// AFTER:
token: this.jwtService.sign({
  id: credential.id,
  account_id: credential.account_id,
  email: credential.email,
  account_type: credential.account_type,  // Add this
}),
```

---

## Step 2: Create a Type for the JWT Payload

**Best Practice:** Never use `any` for your JWT payload. Create an interface so TypeScript catches mistakes.

**File to create:** `src/modules/auth/interfaces/jwt-payload.interface.ts`

```typescript
import { Role } from 'src/common/constants/roles.enum';

export interface JwtPayload {
  id: number;
  account_id: string;
  email: string;
  account_type: Role;
}
```

---

## Step 3: Update the JWT Strategy

**File:** `src/modules/auth/strategies/jwt.strategy.ts`

The `validate()` method needs to return an object that includes the role. We'll attach the role from the JWT payload to the member object.

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { MembersService } from 'src/modules/members/services/members.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private membersService: MembersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayload) {
    const member = await this.membersService.findOne(payload.account_id);

    if (!member) {
      throw new UnauthorizedException();
    }

    // Attach role info from the token to req.user
    return {
      ...member,
      account_type: payload.account_type,
    };
  }
}
```

**Why we spread `member` and add `account_type`:**
The `Members` entity doesn't have a role field. By spreading the member and adding `account_type`, we create a combined object that has both member data AND role info. This is what `req.user` will contain.

---

## Step 4: Fix the RolesGuard

**File:** `src/common/guards/roles.guard.ts`

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/roles.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no @Roles() decorator is present, allow access
    if (!requiredRoles) return true;

    // 3. Get the user from the request (set by JwtStrategy.validate())
    const { user } = context.switchToHttp().getRequest();

    // 4. Check if the user's role matches any of the required roles
    const hasRole = requiredRoles.includes(user.account_type);
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}
```

**Why `ForbiddenException` (403) instead of `UnauthorizedException` (401)?**
- **401 Unauthorized** = "I don't know who you are" (authentication failure)
- **403 Forbidden** = "I know who you are, but you're not allowed" (authorization failure)

Using the correct HTTP status code helps frontend developers and API consumers handle errors properly.

---

## Step 5: Register the RolesGuard Globally (Optional but Recommended)

You can use `@UseGuards(RolesGuard)` on individual controllers, but it's better to register it globally so you never forget it.

**File:** `src/app.module.ts`

Add the `RolesGuard` as a global guard alongside `JwtAuthGuard`:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  // ...
  providers: [
    // Order matters! JwtAuthGuard runs first, then RolesGuard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

**If you do this**, you can **remove** `@UseGuards(JwtAuthGuard)` from `MembersController` since it's now global. The `@Public()` decorator still works to skip auth on specific routes.

---

## Step 6: Usage Examples

### Restrict an endpoint to admins only:

```typescript
@Roles(Role.ADMIN)
@Get('admin-dashboard')
getAdminDashboard() {
  return { message: 'Welcome, admin' };
}
```

### Allow multiple roles:

```typescript
@Roles(Role.ADMIN, Role.SUPERADMIN)
@Delete(':id')
remove(@Param('id') id: string) {
  return this.membersService.remove(+id);
}
```

### No @Roles() = any authenticated user can access:

```typescript
@Get('profile/:account_id')
getProfile(@Param('account_id') account_id: string) {
  // Any logged-in user can access (JwtAuthGuard still runs)
  return this.membersService.findOne(account_id);
}
```

### Public endpoint (no auth, no role check):

```typescript
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

---

## Summary Table

| Decorator | Auth Required? | Role Check? |
|-----------|---------------|-------------|
| (none) | Yes (JWT) | No — any authenticated user |
| `@Roles(Role.ADMIN)` | Yes (JWT) | Yes — only ADMIN |
| `@Public()` | No | No |
| `@Public()` + `@Roles(...)` | No | No (`@Public` overrides everything) |

---

## Recommendation

After completing this lesson, consider:
- Adding a `SUPERADMIN` role to manage other admins
- Creating an endpoint like `PATCH /api/member/:account_id/role` restricted to `SUPERADMIN` for changing user roles
- Writing unit tests for the `RolesGuard` to verify it correctly allows/denies access
