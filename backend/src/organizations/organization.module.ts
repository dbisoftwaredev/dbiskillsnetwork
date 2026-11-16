import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database.module';
import { AuthEmailService } from '../auth/email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationController } from './organization.controller';
import { OrganizationRoleGuard } from './organization-role.guard';
import { OrganizationService } from './organization.service';

@Module({
  imports: [DatabaseModule, JwtModule.register({})],
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRoleGuard, JwtAuthGuard, AuthEmailService],
})
export class OrganizationModule {}
