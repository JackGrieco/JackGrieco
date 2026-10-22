import { cardFrame, fadeDelay, svgDocument } from '../svg.mjs';
import { formatNumber } from '../format.mjs';
import { CARD_WIDTH, COLORS } from '../theme.mjs';

const HEIGHT = 272;
const TILES = { x: 44, y: 124, gap: 18, height: 112, padding: 24 };
const BAR = { height: 7, offset: 88 };

// Progress bars fill up as each metric approaches these milestones.
const METRICS = [
  { label: 'Stars', key: 'totalStars', goal: 50, color: COLORS.accent },
  { label: 'Contributions', key: 'contributions', goal: 1000, color: COLORS.violet, gradient: true },
  { label: 'Repos', key: 'repoCount', goal: 30, color: COLORS.blue },
  { label: 'Followers', key: 'followers', goal: 50, color: COLORS.cyan },
];

const STATS_DEFS = `<defs><linearGradient id="bar-violet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${COLORS.violetDeep}"/><stop offset="1" stop-color="${COLORS.violet}"/></linearGradient></defs>`;

function renderTile(metric, value, index) {
  const width = (CARD_WIDTH - TILES.x * 2 - TILES.gap * (METRICS.length - 1)) / METRICS.length;
  const x = TILES.x + index * (width + TILES.gap);
  const trackWidth = width - TILES.padding * 2;
  const fillWidth = Math.max(BAR.height, trackWidth * Math.min(1, value / metric.goal));
  const fill = metric.gradient ? 'url(#bar-violet)' : metric.color;
  const barY = TILES.y + BAR.offset;
  return [
    `<g ${fadeDelay(120 + index * 110)}>`,
    `<rect x="${x}" y="${TILES.y}" width="${width}" height="${TILES.height}" rx="18" fill="${COLORS.surface}" fill-opacity=".75" stroke="${COLORS.accent}" stroke-opacity=".38"/>`,
    `<text x="${x + TILES.padding}" y="${TILES.y + 34}" font-size="14" font-weight="700" letter-spacing="1" fill="${COLORS.ink}">${metric.label}</text>`,
    `<text x="${x + TILES.padding}" y="${TILES.y + 74}" font-size="38" font-weight="800" fill="${fill}">${formatNumber(value)}</text>`,
    `<rect x="${x + TILES.padding}" y="${barY}" width="${trackWidth}" height="${BAR.height}" rx="${BAR.height / 2}" fill="${COLORS.track}"/>`,
    `<rect x="${x + TILES.padding}" y="${barY}" width="${fillWidth}" height="${BAR.height}" rx="${BAR.height / 2}" fill="${fill}"/>`,
    '</g>',
  ].join('');
}

export function renderStats(profile) {
  const values = { ...profile, contributions: profile.calendar.total };
  const body = [
    STATS_DEFS,
    cardFrame({ width: CARD_WIDTH, height: HEIGHT, panel: true }),
    `<g ${fadeDelay(0)}>`,
    `<text x="52" y="80" font-size="32" font-weight="800" letter-spacing="-.5" fill="${COLORS.ink}">Profile Signal</text>`,
    `<text x="54" y="106" font-size="14" font-weight="700" letter-spacing="1.2" fill="${COLORS.accentSoft}">Live GitHub stats, refreshed daily</text>`,
    '</g>',
    METRICS.map((metric, index) => renderTile(metric, values[metric.key], index)).join(''),
  ].join('');
  return svgDocument({ width: CARD_WIDTH, height: HEIGHT, title: `${profile.displayName}'s GitHub stats`, body });
}
