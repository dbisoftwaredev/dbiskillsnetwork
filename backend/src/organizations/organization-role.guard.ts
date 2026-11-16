import { CanActivate, createParamDecorator, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { organizationMembers } from '../schema';
import { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { OrganizationRole } from './organization.policy';

const ORGANIZATION_ROLES_KEY = 'organization_roles';
export const OrganizationRoles = (...roles: OrganizationRole[]) => SetMetadata(ORGANIZATION_ROLES_KEY, roles);

export const CurrentOrganizationRole = createParamDecorator(
  (_data: unknown, context: ExecutionContext): OrganizationRole =>
    context.switchToHttp().getRequest<{ organizationRole: OrganizationRole }>().organizationRole,
);

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  constructor(
    private readonly database: DatabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      params: { organizationId?: string };
      user?: AuthenticatedUser;
      organizationRole?: OrganizationRole;
    }>();
    const user = request.user;
    if (!user) throw new UnauthorizedException('Authentication is required');

    const organizationId = request.params.organizationId;
    if (!organizationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(organizationId)) {
      throw new ForbiddenException('Organization membership is required');
    }

    const [membership] = await this.database.db.select({ role: organizationMembers.role })
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.userId, user.sub),
      ))
      .limit(1);
    if (!membership) throw new ForbiddenException('Organization membership is required');
    request.organizationRole = membership.role;

    const requiredRoles = this.reflector.get(ORGANIZATION_ROLES_KEY, context.getHandler()) as OrganizationRole[] | undefined;
    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Your organization role does not allow this action');
    }

    return true;
  }
}
