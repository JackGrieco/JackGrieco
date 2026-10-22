import { cardFrame, escapeXml, fadeDelay, svgDocument } from '../svg.mjs';
import { formatCompact, formatNumber } from '../format.mjs';
import { buildingHeight, cellLevel, renderBuilding } from '../iso.mjs';
import { CARD_WIDTH, COLORS } from '../theme.mjs';

const HEIGHT = 420;
const TEXT_X = 40;
const GRID = { originX: 352, originY: 112, unit: 9 };
const HEIGHT_RANGE = { min: 2.5, max: 96 };
const LEVEL_COLORS = ['#176358', '#1fa594', '#2dd4bf', '#5eead4', '#99f6e4'];
const WEEK_DELAY_MS = 22;

const CITY_STYLE = '.week{animation:rise .8s cubic-bezier(.2,.7,.2,1) both}@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}';

function renderWeek(counts, week, busiestDay) {
  const buildings = counts
    .map((count, day) => renderBuilding({
      week,
      day,
      height: buildingHeight(count, busiestDay, HEIGHT_RANGE),
      color: LEVEL_COLORS[cellLevel(count, busiestDay)],
      grid: GRID,
    }))
    .join('');
  return `<g class="week" style="animation-delay:${week * WEEK_DELAY_MS}ms">${buildings}</g>`;
}

function renderSummary(profile) {
  const { total, activeDays, busiestDay } = profile.calendar;
  return [
    `<g ${fadeDelay(0)}>`,
    `<text class="mono" x="${TEXT_X}" y="62" font-size="13" font-weight="700" letter-spacing="3" fill="${COLORS.accent}">CONTRIBUTION CITY</text>`,
    `<text x="${TEXT_X}" y="110" font-size="42" font-weight="800" fill="${COLORS.ink}">${formatCompact(total)}</text>`,
    `<text x="${TEXT_X}" y="136" font-size="15" font-weight="600" fill="${COLORS.accentSoft}">contributions in the last year</text>`,
    `<text x="${TEXT_X}" y="176" font-size="14" font-weight="600" fill="${COLORS.accentSoft}">${formatNumber(activeDays)} active days</text>`,
    `<text x="${TEXT_X}" y="200" font-size="14" font-weight="600" fill="${COLORS.accentSoft}">Busiest day: ${formatNumber(busiestDay)}</text>`,
    `<text class="mono" x="${TEXT_X}" y="${HEIGHT - 44}" font-size="13" fill="${COLORS.muted}">@${escapeXml(profile.handle)}</text>`,
    '</g>',
  ].join('');
}

export function renderCity(profile) {
  const { weeks, busiestDay } = profile.calendar;
  const body = [
    cardFrame({ width: CARD_WIDTH, height: HEIGHT }),
    renderSummary(profile),
    weeks.map((counts, week) => renderWeek(counts, week, busiestDay)).join(''),
  ].join('');
  return svgDocument({
    width: CARD_WIDTH,
    height: HEIGHT,
    title: `${profile.displayName}'s contribution city`,
    body,
    style: CITY_STYLE,
  });
}
