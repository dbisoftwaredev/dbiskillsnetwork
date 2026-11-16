import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'talent@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ minLength: 12, maxLength: 128, format: 'password', writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @ApiProperty({ enum: ['TALENT', 'ORGANIZATION_REPRESENTATIVE'] })
  @IsIn(['TALENT', 'ORGANIZATION_REPRESENTATIVE'])
  accountType!: 'TALENT' | 'ORGANIZATION_REPRESENTATIVE';

  @ApiProperty({ example: true, description: 'Required acceptance of the current terms version' })
  @IsBoolean()
  termsAccepted!: boolean;

  @ApiProperty({ example: true, description: 'Required acknowledgement of the current privacy notice' })
  @IsBoolean()
  privacyAccepted!: boolean;

  @ApiPropertyOptional({ default: false, description: 'Optional marketing consent; does not affect service messages' })
  @IsOptional()
  @IsBoolean()
  marketingOptIn = false;
}

export class SignInDto {
  @ApiProperty({ example: 'talent@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'talent@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ minLength: 32, maxLength: 64 })
  @IsString()
  @MinLength(32)
  @MaxLength(64)
  token!: string;

  @ApiProperty({ minLength: 12, maxLength: 128, format: 'password', writeOnly: true })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}

export class VerifyEmailDto {
  @ApiProperty({ minLength: 32, maxLength: 64 })
  @IsString()
  @MinLength(32)
  @MaxLength(64)
  token!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ minLength: 32, maxLength: 128, writeOnly: true })
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  refreshToken!: string;
}

export class SignOutDto extends RefreshTokenDto {}

export class VerifyMfaDto {
  @ApiProperty({ minLength: 32, maxLength: 64 })
  @IsString()
  @MinLength(32)
  @MaxLength(64)
  challengeToken!: string;

  @ApiProperty({ example: '482731', minLength: 6, maxLength: 6, pattern: '^\\d{6}$' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @Matches(/^\d{6}$/)
  code!: string;
}

export class VerifyMfaSetupDto extends VerifyMfaDto {}
