import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationRoleGuard, OrganizationRoles } from '../organizations/organization-role.guard';
import { PlatformAdminGuard } from './platform-admin.guard';
import { DecideVerificationDto, SubmitVerificationDto } from './verification.dto';
import { VerificationService } from './verification.service';

@Controller('organizations/:organizationId/verification')
@UseGuards(JwtAuthGuard)
@ApiTags('Organization Verification')
@ApiBearerAuth()
export class OrganizationVerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OrganizationRoleGuard)
  @OrganizationRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Submit CAC document metadata for DBI verification review' })
  @ApiOkResponse({ schema: { example: { submissionId: '…', organizationId: '…', verificationStatus: 'PENDING_REVIEW' } } })
  @ApiBadRequestResponse({ description: 'CAC registration number missing or invalid input' })
  @ApiConflictResponse({ description: 'Organization is already pending review or verified' })
  @ApiForbiddenResponse({ description: 'Owner or admin role is required' })
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() body: SubmitVerificationDto,
  ) {
    return this.verification.submit(organizationId, user.sub, body);
  }
}

@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@ApiTags('DBI Admin')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'DBI admin role with MFA enabled is required' })
export class AdminVerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Get('verifications')
  @ApiOperation({ summary: 'List pending organization verification requests (oldest first)' })
  list() {
    return this.verification.listPending();
  }

  @Patch(':organizationId/verification/decide')
  @ApiOperation({ summary: 'Approve or reject a pending organization verification (audited)' })
  @ApiBadRequestResponse({ description: 'Reason missing for rejection' })
  decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() body: DecideVerificationDto,
  ) {
    return this.verification.decide(organizationId, user.sub, body);
  }
}

