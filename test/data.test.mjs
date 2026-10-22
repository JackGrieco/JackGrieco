import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregateLanguages, repoLanguageShares } from '../scripts/lib/languages.mjs';
import { summarizeCalendar } from '../scripts/lib/calendar.mjs';
import { GRAPHQL_DATA } from './fixtures.mjs';

test('aggregateLanguages sums byte sizes across repos and sorts by share', () => {
  const languages = aggregateLanguages(GRAPHQL_DATA.user.repositories.nodes, 5);

  assert.deepEqual(
    languages.map(({ name, share }) => [name, share]),
    [['HTML', 0.6], ['CSS', 0.2], ['TypeScript', 0.2]],
  );
  assert.equal(languages[0].color, '#e34c26');
});

test('aggregateLanguages respects the limit and handles no code', () => {
  assert.equal(aggregateLanguages(GRAPHQL_DATA.user.repositories.nodes, 1).length, 1);
  assert.deepEqual(aggregateLanguages([], 3), []);
});

test('aggregateLanguages falls back to a neutral color', () => {
  const repos = [{ languages: { edges: [{ size: 1, node: { name: 'Astro', color: null } }] } }];

  assert.equal(aggregateLanguages(repos, 1)[0].color, '#8b949e');
});

test('repoLanguageShares uses the repo total size', () => {
  const shares = repoLanguageShares(GRAPHQL_DATA.p0.languages);

  assert.deepEqual(shares.map(({ name, share }) => [name, share]), [['TypeScript', 0.66], ['CSS', 0.34]]);
  assert.deepEqual(repoLanguageShares(GRAPHQL_DATA.p1.languages), []);
});

test('summarizeCalendar counts active days, busiest day and keeps the week grid', () => {
  const summary = summarizeCalendar(GRAPHQL_DATA.user.contributionsCollection.contributionCalendar);

  assert.equal(summary.total, 15);
  assert.equal(summary.activeDays, 3);
  assert.equal(summary.busiestDay, 10);
  assert.deepEqual(summary.weeks, [[0, 3, 0], [10, 2]]);
});
