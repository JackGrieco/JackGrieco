import { cardFrame, escapeXml, fadeDelay, svgDocument } from '../svg.mjs';
import { estimateTextWidth, formatDate, formatNumber, wrapText } from '../format.mjs';
import { CARD_WIDTH, COLORS } from '../theme.mjs';

const MARGIN = 36;
const HEADER_Y = 52;
const GRID_TOP = 84;
const GAP = 20;
const TILE_HEIGHT = 200;
const COLUMNS = 2;
const TILE_WIDTH = (CARD_WIDTH - MARGIN * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
const DESCRIPTION = { fontSize: 13, maxLines: 2, lineHeight: 19 };
const DONUT = { r: 30, stroke: 9, reserved: 96 };
const NO_DESCRIPTION = 'No description provided.';

function renderHeader(count) {
  return [
    `<g ${fadeDelay(0)}>`,
    `<text class="mono" x="${MARGIN}" y="${HEADER_Y}" font-size="14" letter-spacing="2" fill="${COLORS.accent}">PROJECTS.LIST</text>`,
    `<text class="mono" x="${MARGIN + 180}" y="${HEADER_Y}" font-size="13" fill="${COLORS.ink}">./projects.sh --all</text>`,
    `<text class="mono" x="${CARD_WIDTH - MARGIN}" y="${HEADER_Y}" text-anchor="end" font-size="13" fill="${COLORS.accentSoft}">${count} projects</text>`,
    '</g>',
    `<line x1="${MARGIN}" y1="${HEADER_Y + 14}" x2="${CARD_WIDTH - MARGIN}" y2="${HEADER_Y + 14}" stroke="${COLORS.accent}" stroke-opacity=".5"/>`,
  ].join('');
}

function renderDonut(languages, cx, cy) {
  const circumference = 2 * Math.PI * DONUT.r;
  const segments = languages.reduce((acc, language) => {
    const offset = acc.reduce((sum, segment) => sum + segment.length, 0);
    return [...acc, { color: language.color, length: language.share * circumference, offset }];
  }, []);
  const arcs = segments
    .map(({ color, length, offset }) => `<circle cx="${cx}" cy="${cy}" r="${DONUT.r}" fill="none" stroke="${color}" stroke-width="${DONUT.stroke}" stroke-dasharray="${length.toFixed(2)} ${circumference.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`)
    .join('');
  return [
    `<circle cx="${cx}" cy="${cy}" r="${DONUT.r}" fill="none" stroke="${COLORS.track}" stroke-width="${DONUT.stroke}"/>`,
    arcs,
    `<text class="mono" x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${COLORS.ink}">${Math.round(languages[0].share * 100)}%</text>`,
  ].join('');
}

function renderDescription(text, x, y, hasDonut) {
  const width = TILE_WIDTH - 40 - (hasDonut ? DONUT.reserved : 0);
  const maxChars = Math.floor(width / estimateTextWidth('x', DESCRIPTION.fontSize, { mono: true }));
  return wrapText(text ?? NO_DESCRIPTION, maxChars, DESCRIPTION.maxLines)
    .map((line, index) => `<text class="mono" x="${x}" y="${y + index * DESCRIPTION.lineHeight}" font-size="${DESCRIPTION.fontSize}" fill="${COLORS.accentSoft}">${escapeXml(line)}</text>`)
    .join('');
}

function renderLanguagePill(language, x, y) {
  const width = estimateTextWidth(language.name, 11, { mono: true }) + 24;
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="22" rx="11" fill="${COLORS.deep}" fill-opacity=".8" stroke="${COLORS.accent}" stroke-opacity=".55"/>`,
    `<text class="mono" x="${x + 12}" y="${y + 15}" font-size="11" fill="${COLORS.accentSoft}">${escapeXml(language.name)}</text>`,
  ].join('');
}

function renderTile(project, index) {
  const x = MARGIN + (index % COLUMNS) * (TILE_WIDTH + GAP);
  const y = GRID_TOP + Math.floor(index / COLUMNS) * (TILE_HEIGHT + GAP);
  const textX = x + 20;
  const topLanguage = project.languages[0];
  const nameWidth = estimateTextWidth(project.name, 19, { mono: true });
  return [
    `<g ${fadeDelay(120 + index * 110)}>`,
    `<rect x="${x}" y="${y}" width="${TILE_WIDTH}" height="${TILE_HEIGHT}" rx="14" fill="${COLORS.surface}" fill-opacity=".7" stroke="${COLORS.accent}" stroke-opacity=".5"/>`,
    `<line x1="${x}" y1="${y + 36}" x2="${x + TILE_WIDTH}" y2="${y + 36}" stroke="${COLORS.accent}" stroke-opacity=".4"/>`,
    `<text class="mono" x="${textX}" y="${y + 23}" font-size="12" fill="${COLORS.accentSoft}">• ${escapeXml(project.name)}</text>`,
    `<circle cx="${x + TILE_WIDTH - 20}" cy="${y + 18}" r="4.5" fill="${COLORS.accent}" fill-opacity=".7"/>`,
    `<text class="mono" x="${textX}" y="${y + 70}" font-size="19" font-weight="700" fill="${COLORS.ink}">${escapeXml(project.name)}</text>`,
    `<text class="mono cursor" x="${textX + nameWidth + 8}" y="${y + 72}" font-size="19" fill="${COLORS.accent}">_</text>`,
    renderDescription(project.description, textX, y + 96, Boolean(topLanguage)),
    topLanguage ? renderLanguagePill(topLanguage, textX, y + 134) : '',
    topLanguage ? renderDonut(project.languages, x + TILE_WIDTH - 62, y + 104) : '',
    `<text class="mono" x="${textX}" y="${y + 182}" font-size="13" fill="${COLORS.accentSoft}"><tspan fill="${topLanguage?.color ?? COLORS.accent}">★</tspan> ${formatNumber(project.stars)}<tspan dx="18">updated ${formatDate(project.pushedAt)}</tspan></text>`,
    '</g>',
  ].join('');
}

export function renderProjects(profile) {
  const rows = Math.ceil(profile.projects.length / COLUMNS);
  const height = GRID_TOP + rows * TILE_HEIGHT + Math.max(0, rows - 1) * GAP + 36;
  const body = [
    cardFrame({ width: CARD_WIDTH, height }),
    renderHeader(profile.projects.length),
    profile.projects.map(renderTile).join(''),
  ].join('');
  return svgDocument({ width: CARD_WIDTH, height, title: `${profile.displayName}'s selected projects`, body });
}
