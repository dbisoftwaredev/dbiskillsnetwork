import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';

const require = createRequire(import.meta.url);
require('ts-node').register({ skipProject: true, transpileOnly: true, compilerOptions: { module: 'commonjs', moduleResolution: 'node', jsx: 'react-jsx' } });
const Home = require('../app/page.tsx').default;

test('preview offers a working journey anchor and labels illustrative people and data', () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.match(html, /href="#journey"/);
  assert.match(html, /id="journey"/);
  assert.match(html, /Illustrative profiles · stand-in photos/);
  assert.match(html, /Example data from a sample profile/);
  assert.match(html, /Skip to content/);
  assert.match(html, /id="main"/);
  assert.doesNotMatch(html, /class="band/);
});

test('hero has no rotating role pill and animated text stays accessible', () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.doesNotMatch(html, /class="ticker|class="rot"/);
  // Scroll-scrubbed paragraph exposes the whole sentence as its label.
  assert.match(html, /class="scrub" aria-label="Employers and operators search verified capability/);
  // Decorative spinning badge is hidden.
  assert.match(html, /class="badge" aria-hidden="true"/);
});
