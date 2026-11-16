import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  NOTIFICATION_FREQUENCIES,
  NotificationFrequency,
  ONBOARDING_GOALS,
  ONBOARDING_STEPS,
  OnboardingGoal,
  OnboardingStep,
  TALENT_PERSONAS,
  TalentPersona,
} from './users.policy';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Babatunde A.', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName?: string;

  @ApiPropertyOptional({ example: 'Ibadan, Oyo', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @ApiPropertyOptional({ enum: ONBOARDING_GOALS, description: '"What would you like to achieve?"' })
  @IsOptional()
  @IsIn(ONBOARDING_GOALS)
  primaryGoal?: OnboardingGoal;

  @ApiPropertyOptional({ enum: TALENT_PERSONAS })
  @IsOptional()
  @IsIn(TALENT_PERSONAS)
  persona?: TalentPersona;

  @ApiPropertyOptional({ example: 'Fibre Optic Technician', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  targetOccupation?: string;

  @ApiPropertyOptional({ enum: ONBOARDING_STEPS, description: 'Save-and-resume onboarding step' })
  @IsOptional()
  @IsIn(ONBOARDING_STEPS)
  onboardingStep?: OnboardingStep;
}

export class UpdateCommunicationPreferencesDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() smsEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() inAppEnabled?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() whatsappEnabled?: boolean;

  @ApiPropertyOptional({ enum: NOTIFICATION_FREQUENCIES })
  @IsOptional()
  @IsIn(NOTIFICATION_FREQUENCIES)
  frequency?: NotificationFrequency;

  @ApiPropertyOptional({ description: 'Optional marketing opt-in/opt-out; recorded in the consent ledger' })
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}

