import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateTextWidth,
  formatCompact,
  formatDate,
  formatNumber,
  truncate,
  wrapText,
} from '../scripts/lib/format.mjs';

test('formatNumber adds thousands separators', () => {
  assert.equal(formatNumber(1042), '1,042');
  assert.equal(formatNumber(3), '3');
});

test('formatCompact abbreviates thousands like the original card', () => {
  assert.equal(formatCompact(1042), '1K');
  assert.equal(formatCompact(1550), '1.6K');
  assert.equal(formatCompact(87), '87');
});

test('formatDate returns ISO day or n/a when missing', () => {
  assert.equal(formatDate('2026-10-01T10:00:00Z'), '2026-10-01');
  assert.equal(formatDate(null), 'n/a');
});

test('truncate leaves short text untouched and adds an ellipsis otherwise', () => {
  assert.equal(truncate('short', 10), 'short');
  assert.equal(truncate('abcdefghij', 5), 'abcd…');
});

test('wrapText splits on words and caps the number of lines', () => {
  const lines = wrapText('one two three four five six seven', 10, 2);

  assert.deepEqual(lines, ['one two', 'three fou…']);
});

test('wrapText returns an empty list for empty text', () => {
  assert.deepEqual(wrapText('', 10, 2), []);
});

test('wrapText hard-cuts a single word longer than the line', () => {
  assert.deepEqual(wrapText('supercalifragilistic', 8, 1), ['superca…']);
});

test('estimateTextWidth scales with length and font size', () => {
  const sans = estimateTextWidth('abcd', 10);
  const mono = estimateTextWidth('abcd', 10, { mono: true });

  assert.ok(sans > 0);
  assert.ok(mono > sans);
  assert.equal(estimateTextWidth('abcd', 20), sans * 2);
});
