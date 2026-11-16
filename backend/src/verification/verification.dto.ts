import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { VerificationDecisionInput } from './verification.policy';

export class SubmitVerificationDto {
  @ApiProperty({ example: 'CAC-Certificate-RC123456.pdf', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  documentName!: string;

  @ApiProperty({ description: 'SHA-256 hex digest of the uploaded document (storage integration pending)', pattern: '^[a-f0-9]{64}$' })
  @Matches(/^[a-f0-9]{64}$/)
  documentSha256!: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class DecideVerificationDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsIn(['APPROVE', 'REJECT'])
  decision!: VerificationDecisionInput;

  @ApiPropertyOptional({ maxLength: 1000, description: 'Required when rejecting' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}

