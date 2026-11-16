import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateCommunicationPreferencesDto, UpdateMeDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user, onboarding state and organization memberships' })
  @ApiOkResponse({ description: 'Current user profile' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.users.getMe(user.sub);
  }

  @Patch()
  @ApiOperation({ summary: 'Update personal details and save-and-resume goal-first onboarding progress' })
  @ApiOkResponse({ description: 'Updated user profile' })
  @ApiBadRequestResponse({ description: 'Invalid input or onboarding cannot be completed yet' })
  updateMe(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateMeDto) {
    return this.users.updateMe(user.sub, body);
  }

  @Get('communication-preferences')
  @ApiOperation({ summary: 'Get transactional vs. marketing communication settings, channels and frequency' })
  @ApiOkResponse({ description: 'Communication preferences' })
  getPreferences(@CurrentUser() user: AuthenticatedUser) {
    return this.users.getCommunicationPreferences(user.sub);
  }

  @Patch('communication-preferences')
  @ApiOperation({ summary: 'Update channels, frequency and optional marketing consent (audited)' })
  @ApiOkResponse({ description: 'Updated communication preferences' })
  updatePreferences(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateCommunicationPreferencesDto) {
    return this.users.updateCommunicationPreferences(user.sub, body);
  }
}

