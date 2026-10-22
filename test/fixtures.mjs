export const CONFIG = Object.freeze({
  username: 'jackgrieco',
  displayName: 'Giacomo',
  tagline: null,
  projects: Object.freeze([
    Object.freeze({ repo: 'RAG-app', description: null }),
    Object.freeze({ repo: 'Docs', description: 'Custom description' }),
  ]),
  links: Object.freeze([
    Object.freeze({ label: 'GitHub', handle: '@jackgrieco', url: 'https://github.com/jackgrieco' }),
  ]),
});

const day = (date, contributionCount) => ({ date, contributionCount });

export const GRAPHQL_DATA = {
  user: {
    login: 'JackGrieco',
    name: 'Giacomo Grieco',
    avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    followers: { totalCount: 2 },
    repositories: {
      totalCount: 5,
      nodes: [
        { name: 'forked-lib', isFork: true, stargazerCount: 5, languages: { edges: [] } },
        { name: 'JackGrieco', isFork: false, stargazerCount: 0, languages: { edges: [] } },
        {
          name: 'site',
          stargazerCount: 2,
          languages: {
            edges: [
              { size: 600, node: { name: 'HTML', color: '#e34c26' } },
              { size: 200, node: { name: 'CSS', color: '#663399' } },
            ],
          },
        },
        {
          name: 'api',
          stargazerCount: 1,
          languages: {
            edges: [{ size: 200, node: { name: 'TypeScript', color: '#3178c6' } }],
          },
        },
        { name: 'notes', stargazerCount: 0, languages: { edges: [] } },
      ],
    },
    contributionsCollection: {
      contributionCalendar: {
        totalContributions: 15,
        weeks: [
          { contributionDays: [day('2026-01-04', 0), day('2026-01-05', 3), day('2026-01-06', 0)] },
          { contributionDays: [day('2026-01-11', 10), day('2026-01-12', 2)] },
        ],
      },
    },
  },
  p0: {
    name: 'RAG-app',
    description: null,
    stargazerCount: 2,
    pushedAt: '2026-10-01T10:00:00Z',
    languages: {
      totalSize: 1000,
      edges: [
        { size: 660, node: { name: 'TypeScript', color: '#3178c6' } },
        { size: 340, node: { name: 'CSS', color: '#663399' } },
      ],
    },
  },
  p1: {
    name: 'Docs',
    description: 'Original description',
    stargazerCount: 0,
    pushedAt: null,
    languages: { totalSize: 0, edges: [] },
  },
};
