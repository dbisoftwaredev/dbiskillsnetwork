import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseModule } from '../database.module';
import { PlatformAdminGuard } from '../verification/platform-admin.guard';
import { AdminRplController, PassportController, TalentProfileController } from './passport.controller';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { PassportService } from './passport.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [TalentProfileController, PassportController, AdminRplController],
  providers: [PassportService, AuditService, JwtAuthGuard, OptionalJwtAuthGuard, PlatformAdminGuard],
  exports: [PassportService],
})
export class PassportModule {}
