import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PassportVisibility, RplDecisionInput } from './passport.policy';

export class WorkPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  relocate?: boolean;

  @ApiPropertyOptional({ example: ['FULL_TIME', 'CONTRACT'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  contractTypes?: string[];
}

export class UpdateTalentProfileDto {
  @ApiPropertyOptional({ example: 'kelechi-rf-eng', maxLength: 64 })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9-]{2,63}$/)
  handle?: string;

  @ApiPropertyOptional({ example: 'RF & Microwave Transmission Engineer', maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ enum: ['OPEN_TO_OPPORTUNITIES', 'ACTIVELY_LOOKING', 'NOT_LOOKING'] })
  @IsOptional()
  @IsIn(['OPEN_TO_OPPORTUNITIES', 'ACTIVELY_LOOKING', 'NOT_LOOKING'])
  availabilityStatus?: string;

  @ApiPropertyOptional({ type: WorkPreferencesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkPreferencesDto)
  workPreferences?: WorkPreferencesDto;

  @ApiPropertyOptional({ description: 'Single-use token from POST /api/v1/public/career-readiness-explorer' })
  @IsOptional()
  @IsString()
  @MinLength(16)
  @MaxLength(120)
  explorerHandoffToken?: string;

  @ApiPropertyOptional({ description: 'Must be true to redeem explorerHandoffToken into the user profile' })
  @IsOptional()
  @IsBoolean()
  confirmExplorerSnapshot?: boolean;
}

export class AddPassportSkillDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  skillId!: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, description: 'Optional self-rating (does not grant verified proficiency)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  selfRating?: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  evidenceNote?: string;
}

export class UpdatePassportVisibilityDto {
  @ApiProperty({ enum: ['PUBLIC', 'EMPLOYERS_ONLY', 'PRIVATE'] })
  @IsIn(['PUBLIC', 'EMPLOYERS_ONLY', 'PRIVATE'])
  visibility!: PassportVisibility;
}

export class SubmitCredentialDto {
  @ApiProperty({ example: 'Cisco Certified Network Associate (CCNA)', maxLength: 160 })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ example: 'CCNA', maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  qualificationCode?: string;

  @ApiProperty({ example: 'Cisco Systems', maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  issuer!: string;

  @ApiProperty({ example: 'ccna-certificate.pdf', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  documentName!: string;

  @ApiProperty({ description: 'SHA-256 hex digest of the uploaded document', pattern: '^[a-f0-9]{64}$' })
  @Matches(/^[a-f0-9]{64}$/)
  documentSha256!: string;

  @ApiPropertyOptional({ description: 'Optional Neon Object Storage key from POST /api/v1/storage/presign-upload', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  objectKey?: string;

  @ApiPropertyOptional({ example: '2025-04-15', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  issueDate?: string;

  @ApiPropertyOptional({ example: '2028-04-15', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  expiryDate?: string;

  @ApiProperty({ description: 'Taxonomy skill IDs covered by this qualification for RPL verification', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsUUID('4', { each: true })
  mappedSkillIds!: string[];

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class DecideRplDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsIn(['APPROVE', 'REJECT'])
  decision!: RplDecisionInput;

  @ApiPropertyOptional({ maxLength: 1000, description: 'Required when rejecting' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
