import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { DatabaseService } from '../database';
import { users } from '../schema';
import { canReviewVerifications } from './verification.policy';

/** Must run after JwtAuthGuard. Role is read from the database, never trusted from the token. */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>().user;
    if (!user) throw new ForbiddenException('Authentication is required');
    const [row] = await this.database.db.select({ role: users.platformRole, mfa: users.mfaEnabled })
      .from(users).where(eq(users.id, user.sub)).limit(1);
    if (!row || !canReviewVerifications(row.role, row.mfa)) {
      throw new ForbiddenException('DBI admin role with MFA enabled is required');
    }
    return true;
  }
}

