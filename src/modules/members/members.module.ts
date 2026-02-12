import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembersController } from './controllers/members.controller';
import { MembersService } from './services/members.service';
import { Members } from './entities/member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Members])],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}

