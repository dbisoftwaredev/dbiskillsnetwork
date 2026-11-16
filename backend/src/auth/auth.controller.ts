import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignInDto,
  SignOutDto,
  SignUpDto,
  VerifyEmailDto,
  VerifyMfaDto,
  VerifyMfaSetupDto,
} from './auth.dto';
import {
  AuthTokensResponseDto,
  EmailVerifiedResponseDto,
  ErrorResponseDto,
  MfaChallengeResponseDto,
  MfaEnabledResponseDto,
  MessageResponseDto,
  SignedOutResponseDto,
} from './auth.responses';
import { CurrentUser } from './current-user.decorator';
import { AuthenticatedUser, JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
@ApiExtraModels(AuthTokensResponseDto, MfaChallengeResponseDto)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register an account and send an email verification link' })
  @ApiAcceptedResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input or required consent is missing', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'An account with this email already exists', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Database or Brevo email delivery is unavailable', type: ErrorResponseDto })
  signUp(@Body() body: SignUpDto) {
    return this.auth.signUp(body);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Verify an email address using its one-time token' })
  @ApiOkResponse({ type: EmailVerifiedResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid token format', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token is invalid or expired', type: ErrorResponseDto })
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.auth.verifyEmail(body.token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiAcceptedResponse({ type: MessageResponseDto, description: 'Same response whether or not the account exists' })
  @ApiBadRequestResponse({ description: 'Invalid email address', type: ErrorResponseDto })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Set a new password using a one-time reset token' })
  @ApiOkResponse({ schema: { example: { passwordReset: true } } })
  @ApiBadRequestResponse({ description: 'Invalid input or password does not meet requirements', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Reset token is invalid, expired, or already used', type: ErrorResponseDto })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Returns tokens when MFA is disabled, or a challenge token when email OTP MFA is enabled',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AuthTokensResponseDto) },
        { $ref: getSchemaPath(MfaChallengeResponseDto) },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credentials are incorrect or email is unverified', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Authentication is not configured', type: ErrorResponseDto })
  signIn(@Body() body: SignInDto) {
    return this.auth.signIn(body.email, body.password);
  }

  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: 'Start email OTP MFA enrollment for the authenticated account' })
  @ApiOkResponse({ type: MfaChallengeResponseDto })
  @ApiConflictResponse({ description: 'Email OTP MFA is already enabled', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Email delivery or authentication is unavailable', type: ErrorResponseDto })
  setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.startMfaSetup(user.sub);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Confirm the email OTP to enable MFA' })
  @ApiOkResponse({ type: MfaEnabledResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token or OTP challenge is invalid or expired', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Email OTP MFA is already enabled', type: ErrorResponseDto })
  verifyMfaSetup(@CurrentUser() user: AuthenticatedUser, @Body() body: VerifyMfaSetupDto) {
    return this.auth.verifyMfaSetup(user.sub, body.challengeToken, body.code);
  }

  @Post('mfa/challenge')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Complete sign-in using an emailed MFA code' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'OTP challenge is invalid, expired, used, or locked', type: ErrorResponseDto })
  verifyMfaChallenge(@Body() body: VerifyMfaDto) {
    return this.auth.verifyMfaSignIn(body.challengeToken, body.code);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Rotate a refresh token and issue a new access token' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token is invalid, expired, or already used', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Authentication is not configured', type: ErrorResponseDto })
  refresh(@Body() body: RefreshTokenDto) {
    return this.auth.refresh(body.refreshToken);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiOkResponse({ type: SignedOutResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  signOut(@Body() body: SignOutDto) {
    return this.auth.signOut(body.refreshToken);
  }
}
