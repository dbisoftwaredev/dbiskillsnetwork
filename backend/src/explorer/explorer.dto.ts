import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class EvaluateExplorerDto {
  @ApiProperty({ example: 'fibre-optic-technician', description: 'Target pilot role benchmark slug' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  roleSlug!: string;

  @ApiProperty({
    example: ['fiber-fusion-splicing', 'otdr-fault-testing'],
    description: 'Self-reported skill slugs from the 5-question readiness check',
    type: [String],
  })
  @IsArray()
  @ArrayMaxSize(25)
  @IsString({ each: true })
  knownSkillSlugs!: string[];

  @ApiProperty({ example: 2, minimum: 0, maximum: 40 })
  @IsInt()
  @Min(0)
  @Max(40)
  experienceYears!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  hasFieldSafetyTraining!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasVendorCertification!: boolean;
}
