# Step-by-Step Guide: Creating a New Module

This guide outlines the process for adding a new feature module to the `api-cooperative` project. We follow a modular architecture where each domain feature (e.g., `users`, `auth`, `products`) is self-contained.

## 1. Planning & Naming
Choose a clear, plural name for your module (e.g., `products`, `orders`). This name will be used for the directory, class names, and API routes.

## 2. Directory Structure
Create the following folder structure under `src/modules/<feature-name>/`:

```text
src/modules/<feature-name>/
├── dto/                 # Data Transfer Objects (validation)
├── entities/            # Database entities (TypeORM)
├── controllers/         # API Controllers
├── services/            # Business Logic
└── <feature-name>.module.ts
```

## 3. Step-by-Step Implementation

### Step 3.1: Create the Entity
Define your data model in `entities/<feature-singular>.entity.ts`.

```typescript
// src/modules/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;
}
```

### Step 3.2: Create DTOs
Define input validation classes in `dto/`. Use `class-validator` decorators.

**Create DTO (`create-<feature>.dto.ts`):**
```typescript
// src/modules/products/dto/create-product.dto.ts
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

**Update DTO (`update-<feature>.dto.ts`):**
```typescript
// src/modules/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### Step 3.3: Create the Service
Implement business logic in `services/<feature>.service.ts`.

```typescript
// src/modules/products/services/products.service.ts
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all products`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
```

### Step 3.4: Create the Controller
Define API endpoints in `controllers/<feature>.controller.ts`.

```typescript
// src/modules/products/controllers/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
```

### Step 3.5: Define the Module
Wire everything together in `<feature>.module.ts`.

```typescript
// src/modules/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Product } from './entities/product.entity';

@Module({
  // imports: [TypeOrmModule.forFeature([Product])], // Uncomment when database is ready
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

## 4. Registration
Finally, register your new module in the root `AppModule`.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ProductsModule } from './modules/products/products.module'; // Import here

@Module({
  imports: [
    // ... other modules
    ProductsModule, // Add here
  ],
  // ...
})
export class AppModule {}
```

## Using CLI (Optional)
You can also use the NestJS CLI to scaffold these files, though manual adjustment to match our folder structure might be needed.

```bash
nest g module modules/products
nest g controller modules/products
nest g service modules/products
```
