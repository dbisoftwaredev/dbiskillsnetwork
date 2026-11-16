import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DatabaseModule } from '../database.module';
import { OrganizationRoleGuard } from '../organizations/organization-role.guard';
import { PlatformAdminGuard } from './platform-admin.guard';
import { AdminVerificationController, OrganizationVerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [OrganizationVerificationController, AdminVerificationController],
  providers: [VerificationService, AuditService, JwtAuthGuard, OrganizationRoleGuard, PlatformAdminGuard],
})
export class VerificationModule {}

