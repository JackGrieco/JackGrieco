import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardFrame, escapeXml, svgDocument } from '../scripts/lib/svg.mjs';

test('escapeXml escapes markup-significant characters', () => {
  assert.equal(escapeXml(`<a href="x">Tom & 'Jerry'</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;');
});

test('escapeXml stringifies non-string values', () => {
  assert.equal(escapeXml(42), '42');
});

test('svgDocument wraps body with size, accessible title and reduced-motion rule', () => {
  const svg = svgDocument({ width: 100, height: 50, title: 'A & B', body: '<rect/>' });

  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 100 50"/);
  assert.match(svg, /<title>A &amp; B<\/title>/);
  assert.match(svg, /prefers-reduced-motion/);
  assert.match(svg, /<rect\/>/);
  assert.match(svg, /<\/svg>$/);
});

test('cardFrame draws background, glow orbs and border sized to the card', () => {
  const frame = cardFrame({ width: 860, height: 200 });

  assert.match(frame, /width="860" height="200"/);
  assert.match(frame, /radialGradient/);
  assert.match(frame, /stroke="#2dd4bf"/);
});

test('cardFrame can add an inner panel', () => {
  const plain = cardFrame({ width: 860, height: 200 });
  const panel = cardFrame({ width: 860, height: 200, panel: true });

  assert.ok(panel.length > plain.length);
  assert.match(panel, /class="panel"/);
});
