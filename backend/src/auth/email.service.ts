import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { readConfig } from '../config';

@Injectable()
export class AuthEmailService {
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const config = readConfig();
    const verificationUrl = new URL('/auth/verify-email', config.appOrigin);
    verificationUrl.searchParams.set('token', token);
    const link = verificationUrl.toString();
    await this.send(to, {
      subject: 'Verify your DBI Skills Network account',
      textContent: `Verify your email address: ${link}`,
      htmlContent: `<p>Verify your email address to activate your DBI Skills Network account.</p><p><a href="${link.replaceAll('&', '&amp;')}">Verify email</a></p>`,
    });
  }

  async sendMfaCode(to: string, code: string): Promise<void> {
    await this.send(to, {
      subject: 'Your DBI Skills Network verification code',
      textContent: `Your verification code is ${code}. It expires in five minutes. Do not share this code with anyone.`,
      htmlContent: `<p>Your verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>It expires in five minutes. Do not share this code with anyone.</p>`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const config = readConfig();
    const resetUrl = new URL('/auth/reset-password', config.appOrigin);
    resetUrl.searchParams.set('token', token);
    const link = resetUrl.toString();
    await this.send(to, {
      subject: 'Reset your DBI Skills Network password',
      textContent: `Use this link to reset your password. It expires in one hour: ${link}`,
      htmlContent: `<p>Use this link to reset your password. It expires in one hour:</p><p><a href="${link.replaceAll('&', '&amp;')}">Reset password</a></p>`,
    });
  }

  async sendOrganizationInvitation(to: string, organizationName: string, token: string): Promise<void> {
    const config = readConfig();
    const invitationUrl = new URL('/organization/invitations/accept', config.appOrigin);
    invitationUrl.searchParams.set('token', token);
    const link = invitationUrl.toString();
    const safeOrganizationName = organizationName.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character] ?? character);
    await this.send(to, {
      subject: `Invitation to join ${organizationName} on DBI Skills Network`,
      textContent: `You have been invited to join ${organizationName} on DBI Skills Network. Sign in with this email address to accept: ${link}`,
      htmlContent: `<p>You have been invited to join ${safeOrganizationName} on DBI Skills Network.</p><p><a href="${link.replaceAll('&', '&amp;')}">Sign in to accept the invitation</a></p>`,
    });
  }

  private async send(to: string, content: { subject: string; textContent: string; htmlContent: string }): Promise<void> {
    const config = readConfig();
    if (!config.brevoApiKey || !config.brevoFromEmail) {
      throw new ServiceUnavailableException('Email delivery is not configured');
    }

    let response: Response;
    try {
      response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': config.brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: config.brevoFromEmail, name: config.brevoFromName },
          to: [{ email: to }],
          ...content,
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      throw new ServiceUnavailableException('Email delivery is temporarily unavailable', { cause: error });
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(`Email delivery provider returned HTTP ${response.status}`);
    }
  }
}
