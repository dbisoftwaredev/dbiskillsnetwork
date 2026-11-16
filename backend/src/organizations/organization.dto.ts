import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { OrganizationRole } from './organization.policy';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Horizon Telecoms' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ example: 'RC123456', maxLength: 32 })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  cacRegistrationNumber?: string;

  @ApiPropertyOptional({ example: 'Telecommunications', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sector?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Horizon Telecoms Nigeria' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: 'RC123456', maxLength: 32, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  cacRegistrationNumber?: string | null;

  @ApiPropertyOptional({ example: 'Telecommunications', maxLength: 80, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  sector?: string | null;
}

export class InviteOrganizationMemberDto {
  @ApiProperty({ example: 'recruiter@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'RECRUITER', 'REVIEWER'] })
  @IsIn(['ADMIN', 'RECRUITER', 'REVIEWER'])
  role!: Exclude<OrganizationRole, 'OWNER'>;
}

export class AcceptOrganizationInvitationDto {
  @ApiProperty({ minLength: 32, maxLength: 64 })
  @IsString()
  @MinLength(32)
  @MaxLength(64)
  @Matches(/^[A-Za-z0-9_-]+$/)
  token!: string;
}
