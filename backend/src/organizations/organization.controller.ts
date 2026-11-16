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
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  AcceptOrganizationInvitationDto,
  CreateOrganizationDto,
  InviteOrganizationMemberDto,
  UpdateOrganizationDto,
} from './organization.dto';
import {
  OrganizationInvitationResponseDto,
  OrganizationMemberResponseDto,
  OrganizationResponseDto,
} from './organization.responses';
import {
  CurrentOrganizationRole,
  OrganizationRoleGuard,
  OrganizationRoles,
} from './organization-role.guard';
import { OrganizationRole } from './organization.policy';
import { OrganizationService } from './organization.service';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiTags('Organizations')
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizations: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: 'List organization workspaces for the authenticated user' })
  @ApiOkResponse({ type: OrganizationResponseDto, isArray: true })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.organizations.listForUser(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create an organization workspace and assign its creator as owner' })
  @ApiCreatedResponse({ type: OrganizationResponseDto })
  @ApiForbiddenResponse({ description: 'Only organization representatives can create workspaces' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateOrganizationDto) {
    return this.organizations.create(user, body);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an organization invitation for the invited email address' })
  @ApiOkResponse({ schema: { example: { organizationId: '00000000-0000-4000-8000-000000000000', role: 'RECRUITER' } } })
  @ApiForbiddenResponse({ description: 'Invitation is invalid, expired, already used, or belongs to another email' })
  acceptInvitation(@CurrentUser() user: AuthenticatedUser, @Body() body: AcceptOrganizationInvitationDto) {
    return this.organizations.acceptInvitation(user, body.token);
  }

  @Get(':organizationId')
  @UseGuards(OrganizationRoleGuard)
  @ApiOperation({ summary: 'Get an organization workspace' })
  @ApiOkResponse({ type: OrganizationResponseDto })
  @ApiForbiddenResponse({ description: 'Organization membership is required' })
  get(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.organizations.getById(organizationId);
  }

  @Patch(':organizationId')
  @UseGuards(OrganizationRoleGuard)
  @OrganizationRoles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Update organization profile details' })
  @ApiOkResponse({ type: OrganizationResponseDto })
  @ApiForbiddenResponse({ description: 'Owner or admin role is required' })
  update(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() body: UpdateOrganizationDto,
  ) {
    return this.organizations.update(organizationId, body);
  }

  @Get(':organizationId/members')
  @UseGuards(OrganizationRoleGuard)
  @ApiOperation({ summary: 'List workspace members and their roles' })
  @ApiOkResponse({ type: OrganizationMemberResponseDto, isArray: true })
  listMembers(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.organizations.listMembers(organizationId);
  }

  @Post(':organizationId/members/invite')
  @UseGuards(OrganizationRoleGuard)
  @OrganizationRoles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Invite a member by email with a limited organization role' })
  @ApiAcceptedResponse({ type: OrganizationInvitationResponseDto })
  @ApiConflictResponse({ description: 'The user is already a member' })
  @ApiForbiddenResponse({ description: 'The actor cannot assign the requested role' })
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationRole() actorRole: OrganizationRole,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() body: InviteOrganizationMemberDto,
  ) {
    return this.organizations.invite(user, organizationId, body, actorRole);
  }

  @Delete(':organizationId/members/:userId')
  @UseGuards(OrganizationRoleGuard)
  @OrganizationRoles('OWNER', 'ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  @ApiOkResponse({ schema: { example: { removed: true } } })
  @ApiForbiddenResponse({ description: 'The actor cannot remove the target member' })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentOrganizationRole() actorRole: OrganizationRole,
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
  ) {
    return this.organizations.removeMember(
      organizationId,
      user.sub,
      targetUserId,
      actorRole,
    );
  }
}
