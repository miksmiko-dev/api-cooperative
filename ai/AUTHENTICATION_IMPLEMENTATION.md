# Step-by-Step Guide: Implementing Passport & JWT Authentication

This guide outlines the process for implementing secure authentication using Passport and JSON Web Tokens (JWT) in the `api-cooperative` project.

## 1. Dependencies
*This is used for installing the core libraries required for Passport and JWT authentication.*

Ensure the following packages are installed (already present in `package.json`):

- `@nestjs/passport`: NestJS wrapper for Passport.
- `@nestjs/jwt`: NestJS utilities for JWT manipulation.
- `passport`: Express-compatible authentication middleware.
- `passport-jwt`: Passport strategy for authenticating with a JSON Web Token.
- `@types/passport-jwt`: TypeScript definitions.

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt
npm install -D @types/passport-jwt
```

## 2. Configuration (`src/modules/auth/`)

### 2.1. Update `AuthModule`
*This is used for bootstrapping the authentication logic and integrating dependencies like JWT and Users.*

**File:** `src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module'; // To validate users

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
            expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### 2.2. Implement JWT Strategy
*This is used for defining how the application extracts and validates the JWT from incoming requests.*

**File:** `src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    // payload contains the decoded JWT claims
    // Returns the object that will be attached to the Request object (e.g., req.user)
    return { userId: payload.sub, email: payload.email };
  }
}
```

## 3. Business Logic (`src/modules/auth/services/`)
*This is used for handling the core authentication logic, such as validating user credentials and signing tokens.*

**File:** `src/modules/auth/services/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
// import { compare } from 'bcrypt'; // Assuming you use bcrypt for password hashing

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email); // Need to implement this in UsersService
    // if (user && await compare(pass, user.password)) {
    if (user && user.password === pass) { // WARNING: Use hashing in production!
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

## 4. Controller (`src/modules/auth/controllers/`)
*This is used for exposing the public API endpoints for authentication (e.g., login).*

**File:** `src/modules/auth/controllers/auth.controller.ts`

```typescript
import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto'; // Or a dedicated LoginDto

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) { // Define a LoginDto
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
}
```

## 5. Protecting Routes
*This is used for protecting specific API routes by ensuring the user provides a valid JWT.*

**File:** `src/modules/auth/guards/jwt-auth.guard.ts` (Already exists, standard implementation)

**Usage Example:**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Request() req) {
    return req.user;
  }
}
```

## 6. Config Updates
*This is used for externalizing security settings like secrets and expiration times.*

```typescript
// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '60m',
}));
```