import { Body, Controller, HttpCode, HttpException, HttpStatus, InternalServerErrorException, Logger, Post, UseGuards } from '@nestjs/common';
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
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  CompleteAccountSetupDto,
  GoogleSignInDto,
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
  AccountSetupResponseDto,
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
@ApiExtraModels(AuthTokensResponseDto, AccountSetupResponseDto, MfaChallengeResponseDto)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register an account and send an email verification link' })
  @ApiAcceptedResponse({ type: MessageResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input or required consent is missing', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'An account with this email already exists', type: ErrorResponseDto })
  @ApiServiceUnavailableResponse({ description: 'Database or Brevo email delivery is unavailable', type: ErrorResponseDto })
  async signUp(@Body() body: SignUpDto) {
    try {
      return await this.auth.signUp(body);
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.getStatus() >= 500) this.logger.error(`Signup failed: ${error.message}`);
        throw error;
      }

      // Drizzle errors include bound SQL parameters. Log the underlying diagnostic without them.
      const cause = error instanceof DrizzleQueryError ? error.cause : error;
      if (cause instanceof DatabaseError) {
        const schemaError = cause.code === '42703' || cause.code === '42P01';
        this.logger.error(`Signup failed: PostgreSQL ${cause.code}${schemaError ? ` (${cause.message})` : ''}`);
      } else {
        const frames = cause instanceof Error ? cause.stack?.split('\n').filter((line) => /^\s+at /.test(line)).join('\n') : undefined;
        this.logger.error('Signup failed unexpectedly', frames);
      }
      throw new InternalServerErrorException();
    }
  }

  @Post('complete-account-setup')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @ApiOperation({ summary: 'Choose an individual or organization account after email verification' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid account type', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Setup token is invalid, expired, or already used', type: ErrorResponseDto })
  completeAccountSetup(@Body() body: CompleteAccountSetupDto) {
    return this.auth.completeAccountSetup(body);
  }

  @Post('google/challenge')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create a short-lived single-use nonce for Google sign-in' })
  @ApiOkResponse({ description: 'Single-use nonce for the Google Identity Services credential' })
  @ApiServiceUnavailableResponse({ description: 'Google sign-in is not configured', type: ErrorResponseDto })
  createGoogleChallenge() {
    return this.auth.createGoogleChallenge();
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in or sign up with a verified Google identity' })
  @ApiOkResponse({ schema: { oneOf: [
    { $ref: getSchemaPath(AuthTokensResponseDto) },
    { $ref: getSchemaPath(AccountSetupResponseDto) },
    { $ref: getSchemaPath(MfaChallengeResponseDto) },
  ] } })
  @ApiBadRequestResponse({ description: 'Invalid input or required consent is missing', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Google identity is invalid or unavailable', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'An account already uses this Google identity or email', type: ErrorResponseDto })
  googleSignIn(@Body() body: GoogleSignInDto) {
    return this.auth.googleSignIn(body);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 50, ttl: 60_000 } })
  @ApiOperation({ summary: 'Verify an email address using its one-time token' })
  @ApiOkResponse({ type: EmailVerifiedResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid token format', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token is invalid or expired', type: ErrorResponseDto })
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.auth.verifyEmail(body.token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiAcceptedResponse({ type: MessageResponseDto, description: 'Same response whether or not the account exists' })
  @ApiBadRequestResponse({ description: 'Invalid email address', type: ErrorResponseDto })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @ApiOperation({ summary: 'Set a new password using a one-time reset token' })
  @ApiOkResponse({ schema: { example: { passwordReset: true } } })
  @ApiBadRequestResponse({ description: 'Invalid input or password does not meet requirements', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Reset token is invalid, expired, or already used', type: ErrorResponseDto })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Returns session tokens, an account setup token, or an email OTP challenge',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AuthTokensResponseDto) },
        { $ref: getSchemaPath(AccountSetupResponseDto) },
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
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
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
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
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
  @Throttle({ default: { limit: 25, ttl: 60_000 } })
  @ApiOperation({ summary: 'Complete sign-in using an emailed MFA code' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'OTP challenge is invalid, expired, used, or locked', type: ErrorResponseDto })
  verifyMfaChallenge(@Body() body: VerifyMfaDto) {
    return this.auth.verifyMfaSignIn(body.challengeToken, body.code);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60_000 } })
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
  @Throttle({ default: { limit: 100, ttl: 60_000 } })
  @ApiOperation({ summary: 'Revoke a refresh token' })
  @ApiOkResponse({ type: SignedOutResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input', type: ErrorResponseDto })
  signOut(@Body() body: SignOutDto) {
    return this.auth.signOut(body.refreshToken);
  }
}
