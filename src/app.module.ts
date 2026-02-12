import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.modules';
import { MembersModule } from './modules/members/members.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import swaggerConfig from './config/swagger.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, swaggerConfig],
      envFilePath: '.env',
    }),
    MembersModule,
    AuthModule,
    HealthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
