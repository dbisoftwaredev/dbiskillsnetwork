import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { readConfig } from '../config';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  accountType: 'TALENT' | 'ORGANIZATION_REPRESENTATIVE';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const secret = readConfig().accessTokenSecret;
    if (!secret) throw new ServiceUnavailableException('Authentication is not configured');

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const match = request.headers.authorization?.match(/^Bearer\s+([^\s]+)$/i);
    if (!match) throw new UnauthorizedException('Bearer access token is required');

    try {
      const payload = await this.jwt.verifyAsync<AuthenticatedUser>(match[1], { secret });
      if (!payload.sub || !payload.email || !['TALENT', 'ORGANIZATION_REPRESENTATIVE'].includes(payload.accountType)) {
        throw new UnauthorizedException('Access token is invalid');
      }
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Access token is invalid or expired');
    }
  }
}
