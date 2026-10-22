import { aggregateLanguages, repoLanguageShares } from './languages.mjs';
import { summarizeCalendar } from './calendar.mjs';
import { deepFreeze } from './immutable.mjs';

const GRAPHQL_URL = 'https://api.github.com/graphql';
const TOP_LANGUAGES = 4;
const ERROR_BODY_PREVIEW = 200;

const USER_FIELDS = `
  login
  name
  avatarUrl(size: 240)
  followers { totalCount }
  repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
    totalCount
    nodes {
      name
      isFork
      stargazerCount
      languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name color } } }
    }
  }
  contributionsCollection {
    contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
  }`;

const REPO_FRAGMENT = `
fragment ProjectCard on Repository {
  name
  description
  stargazerCount
  pushedAt
  languages(first: 6, orderBy: { field: SIZE, direction: DESC }) { totalSize edges { size node { name color } } }
}`;

export function buildQuery(projects) {
  const repoLookups = projects
    .map(({ repo }, index) => `  p${index}: repository(owner: $login, name: "${repo}") { ...ProjectCard }`)
    .join('\n');
  return `query($login: String!) {\n  user(login: $login) {${USER_FIELDS}\n  }\n${repoLookups}\n}\n${REPO_FRAGMENT}`;
}

// A renamed or deleted project repo must not break the daily build: shapeProfile skips it.
const isMissingProject = (error) => error.type === 'NOT_FOUND' && /^p\d+$/.test(String(error.path?.[0]));

export async function fetchProfile({ config, token, fetchImpl = fetch }) {
  if (!token) {
    throw new Error('Missing GitHub token: set GITHUB_TOKEN (or GH_TOKEN)');
  }
  const response = await fetchImpl(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${config.username}-profile-cards`,
    },
    body: JSON.stringify({ query: buildQuery(config.projects), variables: { login: config.username } }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API responded ${response.status}: ${body.slice(0, ERROR_BODY_PREVIEW)}`);
  }
  const payload = await response.json();
  const fatalErrors = (payload.errors ?? []).filter((error) => !isMissingProject(error));
  if (fatalErrors.length > 0) {
    throw new Error(`GitHub GraphQL error: ${fatalErrors.map((error) => error.message).join('; ')}`);
  }
  if (!payload.data?.user) {
    throw new Error(`GitHub user "${config.username}" not found`);
  }
  return payload.data;
}

export async function fetchAvatarDataUri(url, fetchImpl = fetch) {
  try {
    const response = await fetchImpl(url);
    if (!response.ok) {
      console.warn(`Avatar download failed with status ${response.status}; using initials instead`);
      return null;
    }
    const type = response.headers.get('content-type') ?? 'image/png';
    const base64 = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:${type};base64,${base64}`;
  } catch (error) {
    console.warn(`Avatar download failed (${error.message}); using initials instead`);
    return null;
  }
}

function shapeProject(project, repo) {
  return {
    name: repo.name,
    description: project.description ?? repo.description ?? null,
    stars: repo.stargazerCount,
    pushedAt: repo.pushedAt,
    languages: repoLanguageShares(repo.languages),
  };
}

function defaultLinks(config) {
  return [{ label: 'GitHub', handle: `@${config.username}`, url: `https://github.com/${config.username}` }];
}

// Forks and the profile repo itself (which holds this generator's code) are not the user's projects.
function isOriginalProject(repo, username) {
  return !repo.isFork && repo.name.toLowerCase() !== username.toLowerCase();
}

export function shapeProfile(data, config, avatarDataUri) {
  const { user } = data;
  const ownRepos = user.repositories.nodes.filter((repo) => isOriginalProject(repo, config.username));
  const languages = aggregateLanguages(ownRepos, TOP_LANGUAGES);
  const defaultTagline = languages[0] ? `Building with ${languages[0].name} on GitHub.` : 'Building on GitHub.';
  const projects = config.projects
    .map((project, index) => ({ project, repo: data[`p${index}`] }))
    .filter(({ repo }) => Boolean(repo))
    .map(({ project, repo }) => shapeProject(project, repo));

  return deepFreeze({
    handle: config.username,
    displayName: config.displayName,
    tagline: config.tagline ?? defaultTagline,
    avatarDataUri,
    followers: user.followers.totalCount,
    repoCount: ownRepos.length,
    totalStars: ownRepos.reduce((sum, repo) => sum + repo.stargazerCount, 0),
    languages,
    calendar: summarizeCalendar(user.contributionsCollection.contributionCalendar),
    projects,
    links: config.links.length > 0 ? config.links : defaultLinks(config),
  });
}
