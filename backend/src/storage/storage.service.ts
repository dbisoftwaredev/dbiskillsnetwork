import { ForbiddenException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database';
import { users } from '../schema';
import { PresignUploadDto } from './storage.dto';
import { buildScopedObjectKey, canReadObjectKey } from './storage.policy';

type FilesInstance = {
  signedUploadUrl: (key: string, options?: { expiresIn?: number; contentType?: string }) => Promise<{ url: string } | string>;
  url: (key: string, options?: { expiresIn?: number }) => Promise<string>;
};

const importEsm = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<Record<string, unknown>>;

@Injectable()
export class StorageService {
  constructor(private readonly database: DatabaseService) {}

  private isConfigured(): boolean {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim() &&
      process.env.AWS_ENDPOINT_URL_S3?.trim(),
    );
  }

  private async getClient(): Promise<{ files: FilesInstance; bucket: string }> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'Object storage is not configured; set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_ENDPOINT_URL_S3.',
      );
    }
    const bucket = process.env.NEON_STORAGE_BUCKET?.trim() || 'uploads';
    const [{ Files }, { neon }] = await Promise.all([
      importEsm('files-sdk') as Promise<{ Files: new (opts: { adapter: unknown }) => FilesInstance }>,
      importEsm('files-sdk/neon') as Promise<{ neon: (opts: { bucket: string }) => unknown }>,
    ]);
    return { files: new Files({ adapter: neon({ bucket }) }), bucket };
  }

  async presignUpload(userId: string, input: PresignUploadDto) {
    const { files, bucket } = await this.getClient();
    const objectKey = buildScopedObjectKey(input.purpose, userId, input.filename);
    const expiresInSeconds = 300;
    const signed = await files.signedUploadUrl(objectKey, {
      expiresIn: expiresInSeconds,
      contentType: input.contentType,
    });
    const uploadUrl = typeof signed === 'string' ? signed : signed.url;

    return {
      bucket,
      objectKey,
      uploadUrl,
      contentType: input.contentType,
      expiresInSeconds,
    };
  }

  async signedDownload(actorUserId: string, objectKey: string) {
    const [actor] = await this.database.db
      .select({ platformRole: users.platformRole, mfaEnabled: users.mfaEnabled })
      .from(users)
      .where(eq(users.id, actorUserId))
      .limit(1);

    const isPlatformAdmin = Boolean(
      actor && (actor.platformRole === 'DBI_ADMIN' || actor.platformRole === 'SUPER_ADMIN') && actor.mfaEnabled,
    );

    if (!canReadObjectKey(objectKey, actorUserId, isPlatformAdmin)) {
      throw new ForbiddenException('You do not have permission to access this object');
    }

    const { files, bucket } = await this.getClient();
    const expiresInSeconds = 300;
    const downloadUrl = await files.url(objectKey, { expiresIn: expiresInSeconds });

    return {
      bucket,
      objectKey,
      downloadUrl,
      expiresInSeconds,
    };
  }
}
