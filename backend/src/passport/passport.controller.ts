import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlatformAdminGuard } from '../verification/platform-admin.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import {
  AddPassportSkillDto,
  DecideRplDto,
  SubmitCredentialDto,
  UpdatePassportVisibilityDto,
  UpdateTalentProfileDto,
} from './passport.dto';
import { PassportService } from './passport.service';

@Controller('talent/profile')
@UseGuards(JwtAuthGuard)
@ApiTags('Talent Profile')
@ApiBearerAuth()
export class TalentProfileController {
  constructor(private readonly passport: PassportService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get logged-in talent profile, handle, availability, and completion breakdown' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.passport.getMyProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update talent profile, availability, and optionally redeem a confirmed Career Readiness Explorer snapshot' })
  @ApiConflictResponse({ description: 'Passport handle is already taken' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateTalentProfileDto) {
    return this.passport.updateMyProfile(user.sub, body);
  }
}

@Controller('passport')
@ApiTags('Digital Skills Passport')
export class PassportController {
  constructor(private readonly passport: PassportService) {}

  @Post('skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Attach a self-declared skill to the Digital Skills Passport' })
  @ApiNotFoundResponse({ description: 'Taxonomy skill not found' })
  addSkill(@CurrentUser() user: AuthenticatedUser, @Body() body: AddPassportSkillDto) {
    return this.passport.addPassportSkill(user.sub, body);
  }

  @Delete('skills/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a skill from the Digital Skills Passport' })
  @ApiNotFoundResponse({ description: 'Passport skill not found' })
  removeSkill(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.passport.removePassportSkill(user.sub, id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get full compiled Digital Skills Passport (including RPL verified tags and credentials)' })
  getMyPassport(@CurrentUser() user: AuthenticatedUser) {
    return this.passport.getMyPassport(user.sub);
  }

  @Patch('visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Passport privacy visibility (PUBLIC, EMPLOYERS_ONLY, PRIVATE)' })
  updateVisibility(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdatePassportVisibilityDto) {
    return this.passport.updateVisibility(user.sub, body);
  }

  @Post('credentials')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit standard certification / document metadata (e.g., CCNA, CCNP) for Recognition of Prior Learning (RPL)' })
  @ApiBadRequestResponse({ description: 'Invalid mappedSkillIds or metadata' })
  submitCredential(@CurrentUser() user: AuthenticatedUser, @Body() body: SubmitCredentialDto) {
    return this.passport.submitCredential(user.sub, body);
  }

  @Get('credentials')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List submitted credential wallet items and their RPL verification status' })
  listCredentials(@CurrentUser() user: AuthenticatedUser) {
    return this.passport.listMyCredentials(user.sub);
  }

  @Get('public/:handle')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'View a public or verified-employer-scoped Digital Skills Passport by handle (includes RPL verified labels, redacts private contact/document details)' })
  @ApiOkResponse({ description: 'Redacted Digital Skills Passport with QR verification path' })
  @ApiForbiddenResponse({ description: 'Passport is PRIVATE or EMPLOYERS_ONLY without verified employer access' })
  @ApiNotFoundResponse({ description: 'Passport handle not found' })
  async getPublicPassport(
    @Param('handle') handle: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Res({ passthrough: true }) res: { setHeader: (name: string, value: string) => void },
  ) {
    const result = await this.passport.getPublicPassport(handle, user?.sub);
    if (result.visibility !== 'PUBLIC') {
      res.setHeader('Cache-Control', 'no-store');
    }
    return result;
  }
}

@Controller('admin/passport')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@ApiTags('DBI Admin')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'DBI admin role with MFA enabled is required' })
export class AdminRplController {
  constructor(private readonly passport: PassportService) {}

  @Get('rpl-verifications')
  @ApiOperation({ summary: 'List pending Recognition of Prior Learning (RPL) certification verification requests' })
  listPending() {
    return this.passport.listPendingRplVerifications();
  }

  @Patch('rpl-verifications/:credentialId/decide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject an RPL certification request (approval marks mapped skills VERIFIED via RPL)' })
  @ApiBadRequestResponse({ description: 'Reason missing for rejection' })
  decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param('credentialId', ParseUUIDPipe) credentialId: string,
    @Body() body: DecideRplDto,
  ) {
    return this.passport.decideRplVerification(credentialId, user.sub, body);
  }
}
