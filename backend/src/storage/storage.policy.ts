import { randomUUID } from 'node:crypto';

export const ALLOWED_UPLOAD_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
export type AllowedUploadMimeType = (typeof ALLOWED_UPLOAD_MIME_TYPES)[number];

export const ALLOWED_UPLOAD_PURPOSES = ['org-verification', 'rpl-credential'] as const;
export type UploadPurpose = (typeof ALLOWED_UPLOAD_PURPOSES)[number];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? 'document';
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 80);
  return cleaned || 'document';
}

export function buildScopedObjectKey(purpose: UploadPurpose, userId: string, filename: string): string {
  return `${purpose}/${userId}/${randomUUID()}-${sanitizeFilename(filename)}`;
}

export function canReadObjectKey(key: string, actorUserId: string, isPlatformAdmin: boolean): boolean {
  if (isPlatformAdmin) return true;
  const segments = key.split('/');
  if (segments.length < 3) return false;
  return segments[1] === actorUserId;
}
