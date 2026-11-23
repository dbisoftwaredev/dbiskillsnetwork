import {
  BadRequestException,
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { and, eq, gt, isNotNull, isNull, lt, sql } from 'drizzle-orm';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { readConfig } from '../config';
import { DatabaseService } from '../database';
import {
  consentRecords,
  emailOtpChallenges,
  emailVerificationTokens,
  accountSetupTokens,
  googleAuthChallenges,
  googleIdentities,
  passwordResetTokens,
  refreshTokens,
  users,
} from '../schema';
import { AuthEmailService } from './email.service';
import { CompleteAccountSetupDto, GoogleSignInDto, SignUpDto } from './auth.dto';
import { verifyGoogleCredential } from './google-token';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const EMAIL_OTP_TTL_MS = 5 * 60 * 1000;
const EMAIL_OTP_MAX_ATTEMPTS = 5;
const ACCOUNT_SETUP_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const GOOGLE_CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MFAChallengeMessage = 'Verification code is invalid, expired, or has already been used';

type AccountType = 'TALENT' | 'ORGANIZATION_REPRESENTATIVE';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwt: JwtService,
    private readonly email: AuthEmailService,
  ) {}

  async signUp(input: SignUpDto): Promise<{ message: string }> {
    if (input.termsAccepted !== true || input.privacyAccepted !== true) {
      throw new BadRequestException('Terms and privacy notice must be accepted');
    }

    const config = readConfig();
    const email = input.email.trim().toLowerCase();
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const verificationToken = randomBytes(32).toString('base64url');
    const [user] = await this.database.db.transaction(async (tx) => {
      const [created] = await tx.insert(users).values({
        email,
        passwordHash,
        accountType: 'TALENT',
        accountTypeSelectedAt: null,
      }).onConflictDoNothing({ target: users.email }).returning({ id: users.id });
      if (!created) return [];

      await tx.insert(consentRecords).values([
        { userId: created.id, type: 'TERMS', granted: true, version: config.termsVersion },
        { userId: created.id, type: 'PRIVACY', granted: true, version: config.privacyVersion },
        { userId: created.id, type: 'MARKETING', granted: input.marketingOptIn, version: 'v1' },
      ]);
      await tx.insert(emailVerificationTokens).values({
        userId: created.id,
        tokenHash: this.hashToken(verificationToken),
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      });
      return [created];
    });

    if (!user) throw new ConflictException('An account with this email already exists');

    try {
      await this.email.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      await this.database.db.delete(users).where(eq(users.id, user.id));
      throw error;
    }
    return { message: 'Check your email for a verification link' };
  }

  async verifyEmail(token: string): Promise<{ verified: true; setupToken: string }> {
    const tokenHash = this.hashToken(token);
    const now = new Date();
    const userId = await this.database.db.transaction(async (tx) => {
      const [record] = await tx.select({ id: emailVerificationTokens.id, userId: emailVerificationTokens.userId })
        .from(emailVerificationTokens)
        .where(and(eq(emailVerificationTokens.tokenHash, tokenHash), gt(emailVerificationTokens.expiresAt, now)))
        .limit(1);
      if (!record) throw new UnauthorizedException('Verification link is invalid or expired');

      await tx.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, record.userId));
      await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, record.id));
      return record.userId;
    });
    const setupToken = await this.createAccountSetupToken(userId);
    return { verified: true, setupToken };
  }

  async completeAccountSetup(input: CompleteAccountSetupDto) {
    const now = new Date();
    const account = await this.database.db.transaction(async (tx) => {
      const [setup] = await tx.select({
        id: accountSetupTokens.id,
        userId: accountSetupTokens.userId,
      }).from(accountSetupTokens).where(and(
        eq(accountSetupTokens.tokenHash, this.hashToken(input.setupToken)),
        isNull(accountSetupTokens.consumedAt),
        gt(accountSetupTokens.expiresAt, now),
      )).limit(1);
      if (!setup) return undefined;

      const [user] = await tx.update(users).set({
        accountType: input.accountType,
        accountTypeSelectedAt: now,
        updatedAt: now,
      }).where(and(
        eq(users.id, setup.userId),
        isNull(users.accountTypeSelectedAt),
        isNotNull(users.emailVerifiedAt),
      )).returning({ id: users.id, email: users.email });
      if (!user) return undefined;

      const [consumed] = await tx.update(accountSetupTokens)
        .set({ consumedAt: now })
        .where(and(eq(accountSetupTokens.id, setup.id), isNull(accountSetupTokens.consumedAt)))
        .returning({ id: accountSetupTokens.id });
      return consumed ? user : undefined;
    });
    if (!account) throw new UnauthorizedException('Account setup link is invalid, expired, or already used');
    return this.issueSession(account.id, account.email, input.accountType);
  }

  async createGoogleChallenge(): Promise<{ challengeToken: string; expiresIn: number }> {
    this.requireGoogleClientId();
    const challengeToken = randomBytes(32).toString('base64url');
    await this.database.db.delete(googleAuthChallenges).where(lt(googleAuthChallenges.expiresAt, new Date()));
    await this.database.db.insert(googleAuthChallenges).values({
      tokenHash: this.hashToken(challengeToken),
      expiresAt: new Date(Date.now() + GOOGLE_CHALLENGE_TTL_MS),
    });
    return { challengeToken, expiresIn: GOOGLE_CHALLENGE_TTL_MS / 1000 };
  }

  async googleSignIn(input: GoogleSignInDto) {
    if (input.mode === 'SIGN_UP' && (input.termsAccepted !== true || input.privacyAccepted !== true)) {
      throw new BadRequestException('Terms and privacy notice must be accepted');
    }

    const clientId = this.requireGoogleClientId();
    const identity = await verifyGoogleCredential(input.credential, clientId, input.challengeToken);
    const signUpPasswordHash = input.mode === 'SIGN_UP'
      ? await argon2.hash(randomBytes(32).toString('base64url'), { type: argon2.argon2id })
      : null;
    const now = new Date();
    const user = await this.database.db.transaction(async (tx) => {
      const [challenge] = await tx.update(googleAuthChallenges).set({ consumedAt: now })
        .where(and(
          eq(googleAuthChallenges.tokenHash, this.hashToken(input.challengeToken)),
          isNull(googleAuthChallenges.consumedAt),
          gt(googleAuthChallenges.expiresAt, now),
        )).returning({ id: googleAuthChallenges.id });
      if (!challenge) throw new UnauthorizedException('Google sign-in attempt expired; try again');

      const [linkedIdentity] = await tx.select({ userId: googleIdentities.userId })
        .from(googleIdentities).where(eq(googleIdentities.googleSubject, identity.subject)).limit(1);
      if (linkedIdentity) {
        const [linkedUser] = await tx.select({
          id: users.id,
          email: users.email,
          accountType: users.accountType,
          accountTypeSelectedAt: users.accountTypeSelectedAt,
          emailVerifiedAt: users.emailVerifiedAt,
          mfaEnabled: users.mfaEnabled,
        }).from(users).where(eq(users.id, linkedIdentity.userId)).limit(1);
        if (!linkedUser) throw new UnauthorizedException('Google account is unavailable');
        if (input.mode === 'SIGN_UP') throw new ConflictException('This Google account is already registered. Sign in instead.');
        return linkedUser;
      }

      const [existing] = await tx.select({
        id: users.id,
        email: users.email,
        accountType: users.accountType,
        accountTypeSelectedAt: users.accountTypeSelectedAt,
        emailVerifiedAt: users.emailVerifiedAt,
        mfaEnabled: users.mfaEnabled,
      }).from(users).where(eq(users.email, identity.email)).limit(1);

      if (input.mode === 'SIGN_UP' && existing) {
        throw new ConflictException('An account already uses this email. Sign in instead.');
      }
      if (input.mode === 'SIGN_IN' && !existing) {
        throw new UnauthorizedException('No account uses this Google email. Create an account first.');
      }

      let linkedUser = existing;
      if (!linkedUser) {
        if (!signUpPasswordHash) throw new BadRequestException('Google account cannot be created in sign-in mode');
        const [created] = await tx.insert(users).values({
          email: identity.email,
          passwordHash: signUpPasswordHash,
          accountType: 'TALENT',
          accountTypeSelectedAt: null,
          emailVerifiedAt: now,
        }).returning({
          id: users.id,
          email: users.email,
          accountType: users.accountType,
          accountTypeSelectedAt: users.accountTypeSelectedAt,
          emailVerifiedAt: users.emailVerifiedAt,
          mfaEnabled: users.mfaEnabled,
        });
        if (!created) throw new ServiceUnavailableException('Unable to create the account');
        const config = readConfig();
        await tx.insert(consentRecords).values([
          { userId: created.id, type: 'TERMS', granted: true, version: config.termsVersion },
          { userId: created.id, type: 'PRIVACY', granted: true, version: config.privacyVersion },
          { userId: created.id, type: 'MARKETING', granted: input.marketingOptIn, version: 'v1' },
        ]);
        linkedUser = created;
      } else if (!linkedUser.emailVerifiedAt) {
        await tx.update(users).set({ emailVerifiedAt: now, updatedAt: now }).where(eq(users.id, linkedUser.id));
        await tx.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, linkedUser.id));
      }

      await tx.insert(googleIdentities).values({ userId: linkedUser.id, googleSubject: identity.subject });
      return linkedUser;
    });

    if (!user.accountTypeSelectedAt) {
      return { accountSetupRequired: true as const, setupToken: await this.createAccountSetupToken(user.id) };
    }
    if (user.mfaEnabled) {
      const challengeToken = await this.createEmailOtpChallenge(user.id, user.email, 'MFA_SIGN_IN');
      return { mfaRequired: true as const, challengeToken, expiresIn: EMAIL_OTP_TTL_MS / 1000, email: user.email };
    }
    return this.issueSession(user.id, user.email, user.accountType);
  }

  async forgotPassword(emailInput: string): Promise<{ message: string }> {
    const [user] = await this.database.db.select({
      id: users.id,
      email: users.email,
    }).from(users).where(eq(users.email, emailInput.trim().toLowerCase())).limit(1);

    if (user) {
      const rawToken = randomBytes(32).toString('base64url');
      const tokenHash = this.hashToken(rawToken);
      await this.database.db.transaction(async (tx) => {
        await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
        await tx.insert(passwordResetTokens).values({
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
        });
      });

      try {
        await this.email.sendPasswordResetEmail(user.email, rawToken);
      } catch (error) {
        await this.database.db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash));
        throw error;
      }
    }

    return { message: 'If an account exists for this email, a password reset link will be sent' };
  }

  async resetPassword(token: string, password: string): Promise<{ passwordReset: true }> {
    const tokenHash = this.hashToken(token);
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const now = new Date();
    const userId = await this.database.db.transaction(async (tx) => {
      const [resetToken] = await tx.update(passwordResetTokens)
        .set({ consumedAt: now })
        .where(and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.consumedAt),
          gt(passwordResetTokens.expiresAt, now),
        ))
        .returning({ userId: passwordResetTokens.userId });
      if (!resetToken) return undefined;

      await tx.update(users).set({ passwordHash, updatedAt: now }).where(eq(users.id, resetToken.userId));
      await tx.update(refreshTokens)
        .set({ revokedAt: now })
        .where(and(eq(refreshTokens.userId, resetToken.userId), isNull(refreshTokens.revokedAt)));
      return resetToken.userId;
    });

    if (!userId) throw new UnauthorizedException('Password reset link is invalid, expired, or already used');
    return { passwordReset: true };
  }

  async signIn(emailInput: string, password: string) {
    this.getAccessTokenSecret();
    const email = emailInput.trim().toLowerCase();
    const [user] = await this.database.db.select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      accountType: users.accountType,
      accountTypeSelectedAt: users.accountTypeSelectedAt,
      emailVerifiedAt: users.emailVerifiedAt,
      mfaEnabled: users.mfaEnabled,
    }).from(users).where(eq(users.email, email)).limit(1);

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Email or password is incorrect');
    }
    if (!user.emailVerifiedAt) throw new UnauthorizedException('Verify your email address before signing in');
    if (user.mfaEnabled) {
      const challengeToken = await this.createEmailOtpChallenge(user.id, user.email, 'MFA_SIGN_IN');
      return { mfaRequired: true as const, challengeToken, expiresIn: EMAIL_OTP_TTL_MS / 1000 };
    }
    if (!user.accountTypeSelectedAt) {
      return { accountSetupRequired: true as const, setupToken: await this.createAccountSetupToken(user.id) };
    }
    return this.issueSession(user.id, user.email, user.accountType);
  }

  async startMfaSetup(userId: string): Promise<{ mfaRequired: true; challengeToken: string; expiresIn: number }> {
    const [user] = await this.database.db.select({
      id: users.id,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      mfaEnabled: users.mfaEnabled,
    }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user?.emailVerifiedAt) throw new UnauthorizedException('Account is unavailable');
    if (user.mfaEnabled) throw new ConflictException('Email OTP MFA is already enabled');

    const challengeToken = await this.createEmailOtpChallenge(user.id, user.email, 'MFA_ENROLLMENT');
    return { mfaRequired: true, challengeToken, expiresIn: EMAIL_OTP_TTL_MS / 1000 };
  }

  async verifyMfaSetup(userId: string, challengeToken: string, code: string): Promise<{ mfaEnabled: true }> {
    await this.consumeEmailOtpChallenge(challengeToken, code, 'MFA_ENROLLMENT', userId);
    const updated = await this.database.db.transaction(async (tx) => {
      const [account] = await tx.update(users)
        .set({ mfaEnabled: true, updatedAt: new Date() })
        .where(and(eq(users.id, userId), eq(users.mfaEnabled, false)))
        .returning({ id: users.id });
      if (account) {
        await tx.update(refreshTokens)
          .set({ revokedAt: new Date() })
          .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
      }
      return account;
    });
    if (!updated) throw new ConflictException('Email OTP MFA is already enabled');
    return { mfaEnabled: true };
  }

  async verifyMfaSignIn(challengeToken: string, code: string) {
    const userId = await this.consumeEmailOtpChallenge(challengeToken, code, 'MFA_SIGN_IN');
    const [user] = await this.database.db.select({
      id: users.id,
      email: users.email,
      accountType: users.accountType,
      accountTypeSelectedAt: users.accountTypeSelectedAt,
      emailVerifiedAt: users.emailVerifiedAt,
      mfaEnabled: users.mfaEnabled,
    }).from(users).where(eq(users.id, userId)).limit(1);
    if (!user?.emailVerifiedAt || !user.mfaEnabled) throw new UnauthorizedException('Account is unavailable');
    if (!user.accountTypeSelectedAt) {
      return { accountSetupRequired: true as const, setupToken: await this.createAccountSetupToken(user.id) };
    }
    return this.issueSession(user.id, user.email, user.accountType);
  }

  async refresh(rawToken: string) {
    this.getAccessTokenSecret();
    const tokenHash = this.hashToken(rawToken);
    const now = new Date();
    const rawRefreshToken = randomBytes(32).toString('base64url');
    const user = await this.database.db.transaction(async (tx) => {
      const [existing] = await tx.select({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
        expiresAt: refreshTokens.expiresAt,
      }).from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).limit(1);
      if (!existing || existing.expiresAt <= now) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }

      const [revoked] = await tx.update(refreshTokens)
        .set({ revokedAt: now })
        .where(and(
          eq(refreshTokens.id, existing.id),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, now),
        ))
        .returning({ userId: refreshTokens.userId });
      if (!revoked) throw new UnauthorizedException('Refresh token has already been used');

      const [account] = await tx.select({
        id: users.id,
        email: users.email,
        accountType: users.accountType,
        emailVerifiedAt: users.emailVerifiedAt,
      }).from(users).where(eq(users.id, revoked.userId)).limit(1);
      if (!account?.emailVerifiedAt) throw new UnauthorizedException('Account is unavailable');

      await tx.insert(refreshTokens).values({
        userId: account.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_MS),
      });
      return account;
    });

    return {
      accessToken: await this.createAccessToken(user),
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  async signOut(rawToken: string): Promise<{ signedOut: true }> {
    await this.database.db.update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.tokenHash, this.hashToken(rawToken)), isNull(refreshTokens.revokedAt)));
    return { signedOut: true };
  }

  private async issueSession(userId: string, email: string, accountType: AccountType) {
    const accessTokenSecret = this.getAccessTokenSecret();
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, accountType },
      { secret: accessTokenSecret, expiresIn: ACCESS_TOKEN_TTL },
    );
    const rawRefreshToken = randomBytes(32).toString('base64url');
    await this.database.db.insert(refreshTokens).values({
      userId,
      tokenHash: this.hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    return {
      accessToken,
      refreshToken: rawRefreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  private async createAccessToken(user: { id: string; email: string; accountType: 'TALENT' | 'ORGANIZATION_REPRESENTATIVE' }) {
    return this.jwt.signAsync(
      { sub: user.id, email: user.email, accountType: user.accountType },
      { secret: this.getAccessTokenSecret(), expiresIn: ACCESS_TOKEN_TTL },
    );
  }

  private getAccessTokenSecret(): string {
    const secret = readConfig().accessTokenSecret;
    if (!secret) throw new ServiceUnavailableException('Authentication is not configured');
    return secret;
  }

  private requireGoogleClientId(): string {
    const clientId = readConfig().googleClientId;
    if (!clientId) throw new ServiceUnavailableException('Google sign-in is not configured');
    return clientId;
  }

  private async createAccountSetupToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    await this.database.db.transaction(async (tx) => {
      await tx.delete(accountSetupTokens).where(lt(accountSetupTokens.expiresAt, new Date()));
      await tx.delete(accountSetupTokens).where(and(
        eq(accountSetupTokens.userId, userId),
        isNull(accountSetupTokens.consumedAt),
      ));
      await tx.insert(accountSetupTokens).values({
        userId,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + ACCOUNT_SETUP_TOKEN_TTL_MS),
      });
    });
    return token;
  }

  private async createEmailOtpChallenge(
    userId: string,
    email: string,
    purpose: 'MFA_ENROLLMENT' | 'MFA_SIGN_IN',
  ): Promise<string> {
    const rawChallengeToken = randomBytes(32).toString('base64url');
    const challengeHash = this.hashToken(rawChallengeToken);
    const code = randomInt(100_000, 1_000_000).toString();
    const codeHash = createHmac('sha256', this.getAccessTokenSecret())
      .update(`dbi-email-otp:v1:${challengeHash}:${code}`)
      .digest('hex');
    const now = new Date();

    await this.database.db.transaction(async (tx) => {
      await tx.delete(emailOtpChallenges).where(and(
        eq(emailOtpChallenges.userId, userId),
        eq(emailOtpChallenges.purpose, purpose),
        isNull(emailOtpChallenges.consumedAt),
      ));
      await tx.insert(emailOtpChallenges).values({
        userId,
        purpose,
        challengeHash,
        codeHash,
        expiresAt: new Date(now.getTime() + EMAIL_OTP_TTL_MS),
      });
    });

    try {
      await this.email.sendMfaCode(email, code);
    } catch (error) {
      await this.database.db.delete(emailOtpChallenges).where(eq(emailOtpChallenges.challengeHash, challengeHash));
      throw error;
    }
    return rawChallengeToken;
  }

  private async consumeEmailOtpChallenge(
    rawChallengeToken: string,
    code: string,
    purpose: 'MFA_ENROLLMENT' | 'MFA_SIGN_IN',
    requiredUserId?: string,
  ): Promise<string> {
    const challengeHash = this.hashToken(rawChallengeToken);
    const codeHash = createHmac('sha256', this.getAccessTokenSecret())
      .update(`dbi-email-otp:v1:${challengeHash}:${code}`)
      .digest('hex');
    const now = new Date();

    const outcome = await this.database.db.transaction(async (tx) => {
      const conditions = [
        eq(emailOtpChallenges.challengeHash, challengeHash),
        eq(emailOtpChallenges.purpose, purpose),
        isNull(emailOtpChallenges.consumedAt),
      ];
      if (requiredUserId) conditions.push(eq(emailOtpChallenges.userId, requiredUserId));
      const [challenge] = await tx.select({
        id: emailOtpChallenges.id,
        userId: emailOtpChallenges.userId,
        codeHash: emailOtpChallenges.codeHash,
        expiresAt: emailOtpChallenges.expiresAt,
        attemptCount: emailOtpChallenges.attemptCount,
      }).from(emailOtpChallenges).where(and(...conditions)).limit(1);

      if (!challenge || challenge.expiresAt <= now) return undefined;
      if (challenge.attemptCount >= EMAIL_OTP_MAX_ATTEMPTS) {
        await tx.update(emailOtpChallenges)
          .set({ consumedAt: now })
          .where(and(eq(emailOtpChallenges.id, challenge.id), isNull(emailOtpChallenges.consumedAt)));
        return undefined;
      }

      const matches = timingSafeEqual(Buffer.from(challenge.codeHash, 'hex'), Buffer.from(codeHash, 'hex'));
      if (!matches) {
        await tx.update(emailOtpChallenges).set({
          attemptCount: sql`${emailOtpChallenges.attemptCount} + 1`,
          consumedAt: challenge.attemptCount + 1 >= EMAIL_OTP_MAX_ATTEMPTS ? now : null,
        }).where(and(
          eq(emailOtpChallenges.id, challenge.id),
          eq(emailOtpChallenges.attemptCount, challenge.attemptCount),
          isNull(emailOtpChallenges.consumedAt),
        ));
        return undefined;
      }

      const [consumed] = await tx.update(emailOtpChallenges)
        .set({ consumedAt: now })
        .where(and(
          eq(emailOtpChallenges.id, challenge.id),
          eq(emailOtpChallenges.attemptCount, challenge.attemptCount),
          isNull(emailOtpChallenges.consumedAt),
          gt(emailOtpChallenges.expiresAt, now),
        ))
        .returning({ userId: emailOtpChallenges.userId });
      return consumed?.userId;
    });

    if (!outcome) throw new UnauthorizedException(MFAChallengeMessage);
    return outcome;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
