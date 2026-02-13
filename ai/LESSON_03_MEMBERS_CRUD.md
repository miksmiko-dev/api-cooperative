# Lesson 03: Building Out the Members CRUD Endpoints

## Overview
Your Members module has basic `findAll`, `findOne`, `update`, and a placeholder `remove`. This lesson fixes existing issues, adds proper DTOs, and completes the CRUD with best practices.

---

## Current Problems

| # | File | Issue |
|---|------|-------|
| 1 | `members.service.ts` | `update()` method parameter `val` has no type — `val: any` is implicit |
| 2 | `members.controller.ts` | `update()` accepts `@Body() val: Members` — you should never use an Entity as a DTO |
| 3 | `members.service.ts` | `remove()` is a placeholder returning a string |
| 4 | `members.controller.ts` | No `create` endpoint (registration handles creation, but admin might need to create members) |
| 5 | `members.controller.ts` | Route naming uses verbs (`getAllMembers`) instead of REST conventions |

---

## Concept: Why Never Use Entities as DTOs

```typescript
// BAD — Entity as request body
@Patch('profile/:account_id')
update(@Body() val: Members) { ... }
```

**Why this is dangerous:**
1. A user could send `{ "id": 999 }` in the body and overwrite the primary key
2. A user could send `{ "date_created": "2000-01-01" }` and forge timestamps
3. `ValidationPipe` only validates `class-validator` decorators — your Entity doesn't have them
4. You expose your database schema directly to API consumers

**The fix:** Always use a **DTO (Data Transfer Object)** that only contains the fields you allow to be updated, with proper validation decorators.

---

## Step 1: Fix the Update DTO

**File:** `src/modules/members/dto/update-member.dto.ts`

First, let's check what you currently have, then replace it:

```typescript
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Sex } from 'src/common/constants/sex.enum';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: Date;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;
}
```

**Why every field is `@IsOptional()`:**
This is a PATCH endpoint. PATCH means "partial update" — the client only sends the fields they want to change. If you used PUT (full replacement), all fields would be required.

**Why `@IsDateString()` instead of `@IsDate()`:**
JSON doesn't have a Date type. The client sends dates as strings like `"1990-01-15"`. `@IsDateString()` validates the string format. `@IsDate()` would fail because the raw JSON body is a string, not a Date object (even with `transform: true` in ValidationPipe, it can be unreliable for dates in PATCH).

---

## Step 2: Fix the Members Service

**File:** `src/modules/members/services/members.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Members } from '../entities/member.entity';
import { UpdateMemberDto } from '../dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Members)
    private membersRepository: Repository<Members>,
  ) {}

  async findAll(): Promise<Members[]> {
    return this.membersRepository.find();
  }

  async findOne(account_id: string): Promise<Members> {
    const member = await this.membersRepository.findOne({
      where: { account_id },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${account_id} not found`);
    }
    return member;
  }

  async update(account_id: string, dto: UpdateMemberDto): Promise<Members> {
    const member = await this.membersRepository.findOne({
      where: { account_id },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${account_id} not found`);
    }

    // Merge only the provided fields into the existing entity
    Object.assign(member, dto);
    return this.membersRepository.save(member);
  }

  async remove(account_id: string): Promise<void> {
    const member = await this.membersRepository.findOne({
      where: { account_id },
    });
    if (!member) {
      throw new NotFoundException(`Member with ID ${account_id} not found`);
    }
    await this.membersRepository.remove(member);
  }
}
```

**Key changes explained:**

1. **`update()` now uses `UpdateMemberDto`** instead of `any` — TypeScript enforces what fields are allowed
2. **`Object.assign(member, dto)`** — Only overwrites the fields present in the DTO. If the client sends `{ "first_name": "New" }`, only `first_name` changes
3. **`save()` instead of `update()`** — `save()` triggers TypeORM lifecycle hooks (like `@UpdateDateColumn`). The raw `update()` method skips them
4. **`remove()` is fully implemented** — uses `account_id` instead of `id` for consistency with the rest of your API

---

## Step 3: Fix the Members Controller

**File:** `src/modules/members/controllers/members.controller.ts`

```typescript
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MembersService } from '../services/members.service';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/roles.enum';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':account_id')
  findOne(@Param('account_id') account_id: string) {
    return this.membersService.findOne(account_id);
  }

  @Patch(':account_id')
  update(
    @Param('account_id') account_id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(account_id, updateMemberDto);
  }

  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Delete(':account_id')
  remove(@Param('account_id') account_id: string) {
    return this.membersService.remove(account_id);
  }
}
```

**Key changes explained:**

### REST Naming Convention

```
BEFORE (verb-based):          AFTER (resource-based):
GET  /member/getAllMembers  → GET    /members
GET  /member/profile/:id   → GET    /members/:account_id
PATCH /member/profile/:id  → PATCH  /members/:account_id
DELETE /member/:id          → DELETE /members/:account_id
```

**Why?** REST is about **resources**, not **actions**. The HTTP method (GET, POST, PATCH, DELETE) already describes the action. The URL should describe the resource.

- `GET /members` — "get the members collection" (the verb is GET)
- `DELETE /members/:id` — "delete from the members collection" (the verb is DELETE)
- `GET /member/getAllMembers` — redundant: "get" appears twice

### Controller route changed from `'member'` to `'members'`
REST convention uses **plural nouns** for collection endpoints.

### `@UseGuards(JwtAuthGuard)` removed
If you completed Lesson 02 and registered guards globally, you don't need this. The global `JwtAuthGuard` handles it.

### `@Roles()` on Delete
Only admins should be able to delete members. Regular members shouldn't delete each other.

---

## Step 4: Soft Delete vs Hard Delete (Best Practice)

The `remove()` method above does a **hard delete** — the record is permanently gone. In most real applications, you want a **soft delete** — mark the record as inactive but keep the data.

**Why soft delete?**
- Audit trail — you can see what was deleted and when
- Recovery — accidentally deleted records can be restored
- Data integrity — foreign keys to this record won't break

TypeORM has built-in soft delete support:

**Update your entity** (`src/modules/members/entities/member.entity.ts`):

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,  // Add this import
} from 'typeorm';
import { Sex } from 'src/common/constants/sex.enum';

@Entity('members')
export class Members {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  account_id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'datetime' })
  birth_date: Date;

  @Column({ type: 'smallint' })
  sex: Sex;

  @CreateDateColumn({ type: 'datetime' })
  date_created: Date;

  @UpdateDateColumn({ type: 'datetime' })
  date_updated: Date;

  @DeleteDateColumn({ type: 'datetime' })  // Add this
  date_deleted: Date;
}
```

**Then change `remove()` in the service:**

```typescript
async remove(account_id: string): Promise<void> {
  const member = await this.membersRepository.findOne({
    where: { account_id },
  });
  if (!member) {
    throw new NotFoundException(`Member with ID ${account_id} not found`);
  }
  await this.membersRepository.softRemove(member);
}
```

**How it works:** `softRemove()` doesn't delete the row. It sets `date_deleted` to the current timestamp. TypeORM automatically excludes soft-deleted records from all `find()` queries. To include them, use `{ withDeleted: true }`.

---

## Testing Your Endpoints

```bash
# Get all members
curl http://localhost:3301/api/members \
  -H "Authorization: Bearer <token>"

# Get one member
curl http://localhost:3301/api/members/<account_id> \
  -H "Authorization: Bearer <token>"

# Update a member (partial — only first_name)
curl -X PATCH http://localhost:3301/api/members/<account_id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "first_name": "NewName" }'

# Delete a member (requires ADMIN or SUPERADMIN role)
curl -X DELETE http://localhost:3301/api/members/<account_id> \
  -H "Authorization: Bearer <token>"
```

---

## Recommendation

After completing this lesson, consider:
- Adding **pagination** to `findAll()` — returning all members at once doesn't scale. Use `skip` and `take` with TypeORM:
  ```typescript
  findAll(page = 1, limit = 10) {
    return this.membersRepository.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }
  ```
- Adding a **search/filter** endpoint (e.g., find members by name)
- Implementing **ownership validation** — a regular member should only be able to update their own profile, not others'. Use `@CurrentUser()` to compare `req.user.account_id` with the route param
