import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { readConfig } from '../config';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secret = readConfig().accessTokenSecret;
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const match = request.headers.authorization?.match(/^Bearer\s+([^\s]+)$/i);
    if (!match || !secret) return true;

    try {
      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(match[1], { secret });
      if (payload.sub && payload.email && ['TALENT', 'ORGANIZATION_REPRESENTATIVE'].includes(payload.accountType)) {
        request.user = payload;
      }
    } catch {
      // Invalid optional bearer token is treated as anonymous on public routes
    }
    return true;
  }
}
