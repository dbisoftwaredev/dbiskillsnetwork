import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: 'Check your email for a verification link' })
  message!: string;
}

export class EmailVerifiedResponseDto {
  @ApiProperty({ example: true })
  verified!: boolean;

  @ApiProperty({ description: 'One-time token to choose an account type before signing in' })
  setupToken!: string;
}

export class AccountSetupResponseDto {
  @ApiProperty({ example: true })
  accountSetupRequired!: boolean;

  @ApiProperty({ description: 'One-time token to choose an account type before signing in' })
  setupToken!: string;
}

export class AuthTokensResponseDto {
  @ApiProperty({ description: 'Short-lived JWT access token' })
  accessToken!: string;

  @ApiProperty({ description: 'Opaque refresh token; store securely and use only with refresh/signout' })
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ example: 900, description: 'Access-token lifetime in seconds' })
  expiresIn!: number;
}

export class MfaChallengeResponseDto {
  @ApiProperty({ example: true })
  mfaRequired!: boolean;

  @ApiProperty({ description: 'Opaque one-time challenge token; submit with the email code' })
  challengeToken!: string;

  @ApiProperty({ example: 300, description: 'Challenge lifetime in seconds' })
  expiresIn!: number;

  @ApiPropertyOptional({ description: 'Email address receiving the code, for social sign-in' })
  email?: string;
}

export class MfaEnabledResponseDto {
  @ApiProperty({ example: true })
  mfaEnabled!: boolean;
}

export class SignedOutResponseDto {
  @ApiProperty({ example: true })
  signedOut!: boolean;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 401 })
  statusCode!: number;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'Unauthorized' },
      { type: 'array', items: { type: 'string' }, example: ['email must be an email'] },
      { type: 'object', additionalProperties: true, example: { status: 'not_ready', database: 'unavailable' } },
    ],
  })
  message!: string | string[] | Record<string, unknown>;

  @ApiProperty({ example: 'Unauthorized' })
  error!: string;
}
