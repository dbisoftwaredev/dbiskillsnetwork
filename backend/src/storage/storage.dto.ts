import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  ALLOWED_UPLOAD_PURPOSES,
  AllowedUploadMimeType,
  MAX_UPLOAD_BYTES,
  UploadPurpose,
} from './storage.policy';

export class PresignUploadDto {
  @ApiProperty({ enum: ALLOWED_UPLOAD_PURPOSES, example: 'rpl-credential' })
  @IsIn(ALLOWED_UPLOAD_PURPOSES)
  purpose!: UploadPurpose;

  @ApiProperty({ example: 'cisco-ccna-certificate.pdf', maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  filename!: string;

  @ApiProperty({ enum: ALLOWED_UPLOAD_MIME_TYPES, example: 'application/pdf' })
  @IsIn(ALLOWED_UPLOAD_MIME_TYPES)
  contentType!: AllowedUploadMimeType;

  @ApiProperty({ example: 245760, minimum: 1, maximum: MAX_UPLOAD_BYTES })
  @IsInt()
  @Min(1)
  @Max(MAX_UPLOAD_BYTES)
  sizeBytes!: number;
}

export class SignedDownloadQueryDto {
  @ApiProperty({ example: 'rpl-credential/<userId>/<uuid>-cisco-ccna-certificate.pdf' })
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  key!: string;
}
