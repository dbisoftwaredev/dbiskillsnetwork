import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildScopedObjectKey, canReadObjectKey, sanitizeFilename } from '../src/storage/storage.policy';

test('Storage key scoping sanitizes filenames and enforces owner or MFA admin read access', () => {
  assert.equal(sanitizeFilename('../../evil path/CAC Cert (2026).pdf'), 'CAC-Cert-2026-.pdf');

  const key = buildScopedObjectKey('rpl-credential', 'user-123', 'ccna.pdf');
  assert.ok(key.startsWith('rpl-credential/user-123/'));
  assert.ok(key.endsWith('-ccna.pdf'));

  assert.equal(canReadObjectKey(key, 'user-123', false), true);
  assert.equal(canReadObjectKey(key, 'other-user', false), false);
  assert.equal(canReadObjectKey(key, 'admin-user', true), true);
});
