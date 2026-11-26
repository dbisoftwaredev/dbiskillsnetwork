import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser, JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PresignUploadDto, SignedDownloadQueryDto } from './storage.dto';
import { StorageService } from './storage.service';

@Controller('storage')
@UseGuards(JwtAuthGuard)
@ApiTags('Object Storage')
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('presign-upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a short-lived presigned upload URL for the Neon Object Storage uploads bucket' })
  @ApiOkResponse({ description: 'Presigned PUT URL and scoped objectKey' })
  @ApiServiceUnavailableResponse({ description: 'Object storage environment variables not configured' })
  presignUpload(@CurrentUser() user: AuthenticatedUser, @Body() body: PresignUploadDto) {
    return this.storage.presignUpload(user.sub, body);
  }

  @Get('signed-download')
  @ApiOperation({ summary: 'Generate a short-lived signed download URL for an owned or admin-reviewable objectKey' })
  @ApiOkResponse({ description: 'Short-lived signed GET URL' })
  @ApiForbiddenResponse({ description: 'Only the file owner or an MFA-enabled DBI admin may download' })
  @ApiServiceUnavailableResponse({ description: 'Object storage environment variables not configured' })
  signedDownload(@CurrentUser() user: AuthenticatedUser, @Query() query: SignedDownloadQueryDto) {
    return this.storage.signedDownload(user.sub, query.key);
  }
}
