import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { validateConfig } from './lib/config.mjs';
import { fetchAvatarDataUri, fetchProfile, shapeProfile } from './lib/github.mjs';
import { renderHero } from './lib/cards/hero.mjs';
import { renderCity } from './lib/cards/city.mjs';
import { renderStats } from './lib/cards/stats.mjs';
import { renderProjects } from './lib/cards/projects.mjs';
import { renderSocial } from './lib/cards/social.mjs';

const ROOT = new URL('../', import.meta.url);
const ASSETS = new URL('assets/', ROOT);

const CARDS = {
  hero: renderHero,
  city: renderCity,
  stats: renderStats,
  projects: renderProjects,
  social: renderSocial,
};

async function loadConfig() {
  const raw = await readFile(new URL('config.json', ROOT), 'utf8');
  return validateConfig(JSON.parse(raw));
}

async function main() {
  const config = await loadConfig();
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  const data = await fetchProfile({ config, token });
  const avatarDataUri = await fetchAvatarDataUri(data.user.avatarUrl);
  const profile = shapeProfile(data, config, avatarDataUri);

  await mkdir(ASSETS, { recursive: true });
  await Promise.all(
    Object.entries(CARDS).map(([name, render]) => writeFile(new URL(`${name}.svg`, ASSETS), render(profile))),
  );
  process.stdout.write(`Wrote ${Object.keys(CARDS).length} cards for @${profile.handle} to assets/\n`);
}

main().catch((error) => {
  console.error(`Profile build failed: ${error.message}`);
  process.exitCode = 1;
});
