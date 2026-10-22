import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig } from '../scripts/lib/config.mjs';
import { buildQuery, fetchAvatarDataUri, fetchProfile, shapeProfile } from '../scripts/lib/github.mjs';
import { CONFIG, GRAPHQL_DATA } from './fixtures.mjs';

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
  text: async () => JSON.stringify(body),
});

test('validateConfig normalizes optional fields', () => {
  const config = validateConfig({ username: 'jackgrieco', displayName: 'Giacomo', projects: [{ repo: 'RAG-app' }] });

  assert.equal(config.tagline, null);
  assert.deepEqual(config.projects, [{ repo: 'RAG-app', description: null }]);
  assert.deepEqual(config.links, []);
  assert.ok(Object.isFrozen(config));
});

test('validateConfig rejects missing username and unsafe repo names', () => {
  assert.throws(() => validateConfig({ displayName: 'x', projects: [] }), /username/);
  assert.throws(
    () => validateConfig({ username: 'a', displayName: 'x', projects: [{ repo: 'bad") { x }' }] }),
    /repo name/,
  );
  assert.throws(() => validateConfig({ username: 'a', displayName: 'x', projects: 'nope' }), /projects/);
  assert.throws(
    () => validateConfig({ username: 'a', displayName: 'x', projects: [], links: [{ label: 'X' }] }),
    /links/,
  );
});

test('buildQuery aliases one repository lookup per project', () => {
  const query = buildQuery(CONFIG.projects);

  assert.match(query, /p0: repository\(owner: \$login, name: "RAG-app"\)/);
  assert.match(query, /p1: repository\(owner: \$login, name: "Docs"\)/);
  assert.match(query, /contributionCalendar/);
});

test('shapeProfile counts only original repos, excluding forks and the profile repo', () => {
  const profile = shapeProfile(GRAPHQL_DATA, CONFIG, null);

  assert.equal(profile.repoCount, 3);
  assert.equal(profile.totalStars, 3);
});

test('shapeProfile builds the card model from GraphQL data', () => {
  const profile = shapeProfile(GRAPHQL_DATA, CONFIG, 'data:image/png;base64,AAA');

  assert.equal(profile.handle, 'jackgrieco');
  assert.equal(profile.displayName, 'Giacomo');
  assert.equal(profile.totalStars, 3);
  assert.equal(profile.repoCount, 3);
  assert.equal(profile.followers, 2);
  assert.equal(profile.tagline, 'Building with HTML on GitHub.');
  assert.equal(profile.calendar.activeDays, 3);
  assert.equal(profile.projects[0].description, null);
  assert.equal(profile.projects[1].description, 'Custom description');
  assert.equal(profile.projects[0].languages[0].name, 'TypeScript');
  assert.ok(Object.isFrozen(profile));
});

test('shapeProfile keeps a configured tagline and skips missing repos', () => {
  const config = { ...CONFIG, tagline: 'Hello' };
  const data = { ...GRAPHQL_DATA, p1: null };

  const profile = shapeProfile(data, config, null);

  assert.equal(profile.tagline, 'Hello');
  assert.equal(profile.projects.length, 1);
});

test('fetchProfile posts the query with the token and returns data', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return jsonResponse({ data: GRAPHQL_DATA });
  };

  const data = await fetchProfile({ config: CONFIG, token: 'tkn', fetchImpl });

  assert.equal(data.user.login, 'JackGrieco');
  assert.equal(calls[0].url, 'https://api.github.com/graphql');
  assert.equal(calls[0].options.headers.Authorization, 'bearer tkn');
  assert.deepEqual(JSON.parse(calls[0].options.body).variables, { login: 'jackgrieco' });
});

test('fetchProfile surfaces HTTP and GraphQL errors', async () => {
  await assert.rejects(
    fetchProfile({ config: CONFIG, token: 't', fetchImpl: async () => jsonResponse({ message: 'Bad credentials' }, 401) }),
    /GitHub API responded 401/,
  );
  await assert.rejects(
    fetchProfile({ config: CONFIG, token: 't', fetchImpl: async () => jsonResponse({ errors: [{ message: 'boom' }] }) }),
    /boom/,
  );
  await assert.rejects(
    fetchProfile({ config: CONFIG, token: 't', fetchImpl: async () => jsonResponse({ data: { user: null } }) }),
    /not found/,
  );
  await assert.rejects(fetchProfile({ config: CONFIG, token: '', fetchImpl: async () => null }), /token/);
});

test('fetchAvatarDataUri embeds the image as base64', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => 'image/png' },
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  });

  assert.equal(await fetchAvatarDataUri('https://x/a.png', fetchImpl), 'data:image/png;base64,AQID');
});

test('fetchAvatarDataUri returns null when the download fails', async () => {
  const fetchImpl = async () => ({ ok: false, status: 404, headers: { get: () => null } });

  assert.equal(await fetchAvatarDataUri('https://x/a.png', fetchImpl), null);
});
