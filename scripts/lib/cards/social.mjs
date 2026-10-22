import { cardFrame, escapeXml, fadeDelay, svgDocument } from '../svg.mjs';
import { CARD_WIDTH, COLORS } from '../theme.mjs';

const HEIGHT = 152;
const BUTTON = { width: 220, height: 56, gap: 18 };

const SOCIAL_DEFS = `<defs><linearGradient id="button-edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${COLORS.ink}" stop-opacity=".9"/><stop offset=".5" stop-color="${COLORS.accent}" stop-opacity=".5"/><stop offset="1" stop-color="${COLORS.accentSoft}" stop-opacity=".9"/></linearGradient></defs>`;

function renderButton(link, x, y, index) {
  const iconX = x + 32;
  const iconY = y + BUTTON.height / 2;
  return [
    `<g ${fadeDelay(100 + index * 100)}>`,
    `<rect x="${x}" y="${y}" width="${BUTTON.width}" height="${BUTTON.height}" rx="${BUTTON.height / 2}" fill="${COLORS.surface}" fill-opacity=".9" stroke="url(#button-edge)" stroke-width="2"/>`,
    `<circle cx="${iconX}" cy="${iconY}" r="14" fill="#2b3a3a"/>`,
    `<text x="${iconX}" y="${iconY + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#ffffff">${escapeXml(link.label.charAt(0))}</text>`,
    `<text x="${iconX + 26}" y="${iconY - 4}" font-size="12" font-weight="700" letter-spacing="1" fill="${COLORS.accentSoft}">${escapeXml(link.label)}</text>`,
    `<text x="${iconX + 26}" y="${iconY + 15}" font-size="16" font-weight="700" fill="${COLORS.ink}">${escapeXml(link.handle)}</text>`,
    '</g>',
  ].join('');
}

export function renderSocial(profile) {
  const count = profile.links.length;
  const rowWidth = count * BUTTON.width + (count - 1) * BUTTON.gap;
  const startX = (CARD_WIDTH - rowWidth) / 2;
  const y = (HEIGHT - BUTTON.height) / 2;
  const body = [
    SOCIAL_DEFS,
    cardFrame({ width: CARD_WIDTH, height: HEIGHT, panel: true }),
    profile.links.map((link, index) => renderButton(link, startX + index * (BUTTON.width + BUTTON.gap), y, index)).join(''),
  ].join('');
  return svgDocument({ width: CARD_WIDTH, height: HEIGHT, title: `Find ${profile.displayName} online`, body });
}
