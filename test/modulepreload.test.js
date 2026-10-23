// index.html preloads every startup module so they download in parallel (no build step).
// This keeps that list in sync with the real import graph: a module added without a preload
// line slows the page down, and a stale line downloads a file nobody uses or 404s.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

/** Static imports of one module, as repo-relative paths. Dynamic import() is not followed. */
function importsOf(file) {
  const source = readFileSync(join(root, file), 'utf8');
  const specifiers = [...source.matchAll(/^\s*(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]/gm)]
    .concat([...source.matchAll(/^\s*import\s*['"](\.[^'"]+)['"]/gm)])
    .map((m) => m[1]);
  return specifiers.map((s) => relative(root, normalize(join(root, dirname(file), s))));
}

function startupGraph(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    stack.push(...importsOf(file));
  }
  return seen;
}

test('index.html preloads exactly the modules imported at startup', () => {
  const entries = [...html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(entries.length > 0, 'index.html has a module entry script');

  const expected = new Set(entries.flatMap((e) => [...startupGraph(e)]));
  const preloaded = new Set([...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((m) => m[1]));

  for (const href of preloaded) assert.ok(existsSync(join(root, href)), `preloaded file exists: ${href}`);
  assert.deepEqual([...preloaded].sort(), [...expected].sort());
});

test('fonts are preloaded with the attributes browsers require', () => {
  const fontPreloads = [...html.matchAll(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>/g)].map((m) => m[0]);
  assert.equal(fontPreloads.length, 2);
  for (const tag of fontPreloads) {
    assert.match(tag, /type="font\/woff2"/);
    assert.match(tag, /crossorigin/);
    const href = tag.match(/href="([^"]+)"/)[1];
    assert.ok(existsSync(join(root, href)), `font file exists: ${href}`);
  }
});
