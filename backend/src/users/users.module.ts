import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseModule } from '../database.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [UsersController],
  providers: [UsersService, AuditService, JwtAuthGuard],
})
export class UsersModule {}

