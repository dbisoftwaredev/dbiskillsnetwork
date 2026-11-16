import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const require = createRequire(import.meta.url);
require('ts-node').register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node', jsx: 'react-jsx' } });
const Home = require('../app/page.tsx').default;

test('preview offers a working journey anchor and labels illustrative credentials', () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.match(html, /href="#journey"/);
  assert.match(html, /id="journey"/);
  assert.match(html, /Sample profile. No credentials or assessment results have been issued/);
  assert.match(html, /Skip to content/);
  assert.match(html, /id="main"/);
});
