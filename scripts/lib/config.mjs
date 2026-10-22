import { deepFreeze } from './immutable.mjs';

const USERNAME_PATTERN = /^[A-Za-z0-9-]+$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]+$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

function fail(message) {
  throw new Error(`Invalid config.json: ${message}`);
}

function normalizeProject(project, index) {
  if (!isNonEmptyString(project?.repo) || !REPO_PATTERN.test(project.repo)) {
    fail(`projects[${index}] has an invalid repo name`);
  }
  const description = project.description ?? null;
  if (description !== null && typeof description !== 'string') {
    fail(`projects[${index}].description must be a string`);
  }
  return { repo: project.repo, description };
}

function normalizeLink(link, index) {
  const isValid = ['label', 'handle', 'url'].every((key) => isNonEmptyString(link?.[key]))
    && link.url.startsWith('https://');
  if (!isValid) {
    fail(`links[${index}] needs label, handle and an https url`);
  }
  return { label: link.label, handle: link.handle, url: link.url };
}

export function validateConfig(raw) {
  if (!isNonEmptyString(raw?.username) || !USERNAME_PATTERN.test(raw.username)) {
    fail('username must be a GitHub login');
  }
  if (!isNonEmptyString(raw.displayName)) {
    fail('displayName is required');
  }
  if (!Array.isArray(raw.projects)) {
    fail('projects must be an array');
  }
  if (raw.links !== undefined && !Array.isArray(raw.links)) {
    fail('links must be an array');
  }
  return deepFreeze({
    username: raw.username,
    displayName: raw.displayName,
    tagline: isNonEmptyString(raw.tagline) ? raw.tagline : null,
    projects: raw.projects.map(normalizeProject),
    links: (raw.links ?? []).map(normalizeLink),
  });
}
