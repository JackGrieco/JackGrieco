import { FALLBACK_LANGUAGE_COLOR } from './theme.mjs';

function toShares(entries, total) {
  if (total <= 0) {
    return [];
  }
  return entries.map(({ name, color, size }) => ({
    name,
    color: color ?? FALLBACK_LANGUAGE_COLOR,
    share: size / total,
  }));
}

export function aggregateLanguages(repos, limit) {
  const totals = repos
    .flatMap((repo) => repo.languages?.edges ?? [])
    .reduce((acc, { size, node }) => {
      const previous = acc.get(node.name);
      return new Map(acc).set(node.name, { name: node.name, color: node.color, size: (previous?.size ?? 0) + size });
    }, new Map());
  const entries = [...totals.values()].sort((a, b) => b.size - a.size);
  const total = entries.reduce((sum, entry) => sum + entry.size, 0);
  return toShares(entries, total).slice(0, limit);
}

export function repoLanguageShares(languages) {
  const entries = (languages?.edges ?? []).map(({ size, node }) => ({ name: node.name, color: node.color, size }));
  return toShares(entries, languages?.totalSize ?? 0);
}
