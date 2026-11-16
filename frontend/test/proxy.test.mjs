import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config.mjs';
test('browser API requests stay on the frontend origin', async () => {
  assert.deepEqual(await config.rewrites(), [{ source: '/api/:path*', destination: 'http://127.0.0.1:3001/api/:path*' }]);
});
