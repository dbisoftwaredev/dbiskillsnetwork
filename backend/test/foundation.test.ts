import 'reflect-metadata';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readConfig } from '../src/config';
import { HealthController } from '../src/app.module';
import { DatabaseService } from '../src/database';

test('frontend origin defaults without requiring environment variables', () => {
  assert.equal(readConfig({}).appOrigin, 'http://localhost:3000');
  assert.equal(readConfig({}).databaseUrl, undefined);
  assert.equal(readConfig({}).swaggerEnabled, true);
});
test('rejects invalid deployment configuration', () => {
  for (const APP_ORIGIN of ['ftp://example.com', 'https://example.com/path', 'https://user:pass@example.com']) {
    assert.throws(() => readConfig({ APP_ORIGIN }));
  }
  assert.throws(() => readConfig({ DATABASE_URL: 'mysql://localhost/db' }));
  assert.throws(() => readConfig({ SWAGGER_ENABLED: 'sometimes' }));
});
test('Swagger is disabled by default in production and can be explicitly enabled', () => {
  assert.equal(readConfig({ NODE_ENV: 'production' }).swaggerEnabled, false);
  assert.equal(readConfig({ NODE_ENV: 'production', SWAGGER_ENABLED: 'true' }).swaggerEnabled, true);
  assert.equal(readConfig({ NODE_ENV: 'development', SWAGGER_ENABLED: 'false' }).swaggerEnabled, false);
});
test('readiness does not claim success without a working database', async () => {
  for (const status of ['unconfigured', 'unavailable'] as const) {
    const controller = new HealthController({ check: async () => status } as DatabaseService);
    await assert.rejects(controller.ready(), (error: any) => error.getStatus() === 503);
  }
  const ready = new HealthController({ check: async () => 'connected' } as DatabaseService);
  assert.deepEqual(await ready.ready(), { status: 'ready', database: 'connected' });
  assert.equal(ready.live().status, 'ok');
});
