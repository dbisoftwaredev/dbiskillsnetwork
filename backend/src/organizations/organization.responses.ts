import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from './organization.policy';

export class OrganizationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Horizon Telecoms' })
  name!: string;

  @ApiPropertyOptional({ example: 'RC123456', nullable: true })
  cacRegistrationNumber!: string | null;

  @ApiPropertyOptional({ example: 'Telecommunications', nullable: true })
  sector!: string | null;

  @ApiProperty({ enum: ['UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED'] })
  verificationStatus!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;
}

export class OrganizationMemberResponseDto {
  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ example: 'recruiter@example.com' })
  email!: string;

  @ApiProperty({ enum: ['OWNER', 'ADMIN', 'RECRUITER', 'REVIEWER'] })
  role!: OrganizationRole;

  @ApiProperty({ format: 'date-time' })
  joinedAt!: Date;
}

export class OrganizationInvitationResponseDto {
  @ApiProperty({ example: 'Invitation sent' })
  message!: string;
}
