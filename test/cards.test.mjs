import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shapeProfile } from '../scripts/lib/github.mjs';
import { renderHero } from '../scripts/lib/cards/hero.mjs';
import { renderCity } from '../scripts/lib/cards/city.mjs';
import { renderStats } from '../scripts/lib/cards/stats.mjs';
import { renderProjects } from '../scripts/lib/cards/projects.mjs';
import { renderSocial } from '../scripts/lib/cards/social.mjs';
import { CONFIG, GRAPHQL_DATA } from './fixtures.mjs';

const PROFILE = shapeProfile(GRAPHQL_DATA, CONFIG, 'data:image/png;base64,AAA');

const hasDuplicateAttribute = (svg) => [...svg.matchAll(/<[a-zA-Z]+((?:\s+[\w:-]+="[^"]*")*)\s*\/?>/g)]
  .map(([, attributes]) => [...attributes.matchAll(/([\w:-]+)=/g)].map(([, name]) => name))
  .some((names) => new Set(names).size !== names.length);

const isSvg = (svg) => svg.startsWith('<svg') && svg.endsWith('</svg>') && !hasDuplicateAttribute(svg);

test('hasDuplicateAttribute catches repeated attributes on one tag', () => {
  assert.equal(hasDuplicateAttribute('<g class="a" class="b"></g>'), true);
  assert.equal(hasDuplicateAttribute('<g class="a" style="b"><rect class="c"/></g>'), false);
});

test('hero shows avatar, handle, name, tagline, languages and stars', () => {
  const svg = renderHero(PROFILE);

  assert.ok(isSvg(svg));
  assert.match(svg, /data:image\/png;base64,AAA/);
  assert.match(svg, /@jackgrieco/);
  assert.match(svg, />Giacomo</);
  assert.match(svg, /Building with HTML on GitHub\./);
  assert.match(svg, />CSS</);
  assert.match(svg, /TOTAL STARS/);
});

test('hero falls back to an initial when there is no avatar', () => {
  const svg = renderHero({ ...PROFILE, avatarDataUri: null });

  assert.doesNotMatch(svg, /<image/);
  assert.match(svg, />G</);
});

test('city shows the headline numbers and one building per day', () => {
  const svg = renderCity(PROFILE);

  assert.ok(isSvg(svg));
  assert.match(svg, /CONTRIBUTION CITY/);
  assert.match(svg, />15</);
  assert.match(svg, /3 active days/);
  assert.match(svg, /Busiest day: 10/);
  assert.equal((svg.match(/<polygon/g) ?? []).length, 5 * 3);
});

test('stats shows the four metrics', () => {
  const svg = renderStats(PROFILE);

  assert.ok(isSvg(svg));
  for (const label of ['Stars', 'Contributions', 'Repos', 'Followers']) {
    assert.match(svg, new RegExp(`>${label}<`));
  }
  assert.match(svg, />15</);
});

test('projects lists every configured repo with fallbacks', () => {
  const svg = renderProjects(PROFILE);

  assert.ok(isSvg(svg));
  assert.match(svg, /2 projects/);
  assert.match(svg, /RAG-app/);
  assert.match(svg, /No description provided\./);
  assert.match(svg, /Custom description/);
  assert.match(svg, />66%</);
  assert.match(svg, /updated 2026-10-01/);
  assert.match(svg, /updated n\/a/);
});

test('projects escapes user-provided text', () => {
  const profile = {
    ...PROFILE,
    projects: [{ ...PROFILE.projects[0], description: '<script>alert(1)</script>' }],
  };

  assert.doesNotMatch(renderProjects(profile), /<script>/);
});

test('social renders one button per link', () => {
  const svg = renderSocial(PROFILE);

  assert.ok(isSvg(svg));
  assert.match(svg, />GitHub</);
  assert.match(svg, />@jackgrieco</);
});
