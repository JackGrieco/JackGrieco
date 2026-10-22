import { cardFrame, escapeXml, fadeDelay, svgDocument } from '../svg.mjs';
import { estimateTextWidth, formatNumber } from '../format.mjs';
import { CARD_WIDTH, COLORS } from '../theme.mjs';

const HEIGHT = 260;
const AVATAR = { cx: 120, cy: 112, r: 56 };
const TEXT_X = 200;
const PILL = { y: 186, height: 32, minWidth: 112, padding: 40, gap: 16, startX: 64, fontSize: 14 };
const STARS = { cx: CARD_WIDTH - 150, cy: 112, r: 50 };

function renderAvatar(avatarDataUri, displayName) {
  const ring = `<circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r + 3}" fill="none" stroke="${COLORS.accent}" stroke-width="3"/>`;
  if (!avatarDataUri) {
    return [
      `<circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}" fill="${COLORS.deep}"/>`,
      `<text x="${AVATAR.cx}" y="${AVATAR.cy + 16}" text-anchor="middle" font-size="44" font-weight="800" fill="${COLORS.ink}">${escapeXml(displayName.charAt(0))}</text>`,
      ring,
    ].join('');
  }
  const size = AVATAR.r * 2;
  return [
    `<clipPath id="avatar-clip"><circle cx="${AVATAR.cx}" cy="${AVATAR.cy}" r="${AVATAR.r}"/></clipPath>`,
    `<image href="${avatarDataUri}" x="${AVATAR.cx - AVATAR.r}" y="${AVATAR.cy - AVATAR.r}" width="${size}" height="${size}" clip-path="url(#avatar-clip)" preserveAspectRatio="xMidYMid slice"/>`,
    ring,
  ].join('');
}

function renderPills(languages) {
  const pills = languages.reduce((acc, language) => {
    const width = Math.max(PILL.minWidth, estimateTextWidth(language.name, PILL.fontSize) + PILL.padding);
    const x = acc.length === 0 ? PILL.startX : acc.at(-1).x + acc.at(-1).width + PILL.gap;
    return [...acc, { name: language.name, x, width }];
  }, []);
  return pills
    .map(({ name, x, width }, index) => [
      `<g ${fadeDelay(250 + index * 90)}>`,
      `<rect x="${x}" y="${PILL.y}" width="${width}" height="${PILL.height}" rx="${PILL.height / 2}" fill="${COLORS.surface}" fill-opacity=".7" stroke="${COLORS.accent}" stroke-opacity=".6"/>`,
      `<text x="${x + 18}" y="${PILL.y + 21}" font-size="${PILL.fontSize}" font-weight="700" fill="${COLORS.ink}">${escapeXml(name)}</text>`,
      '</g>',
    ].join(''))
    .join('');
}

function renderStars(totalStars) {
  return [
    `<g ${fadeDelay(200)}>`,
    `<circle cx="${STARS.cx}" cy="${STARS.cy}" r="${STARS.r}" fill="none" stroke="${COLORS.accent}" stroke-opacity=".18"/>`,
    `<circle cx="${STARS.cx - STARS.r - 18}" cy="${STARS.cy + 10}" r="3.5" fill="${COLORS.accent}" fill-opacity=".7"/>`,
    `<text x="${STARS.cx}" y="${STARS.cy + 6}" text-anchor="middle" font-size="40" font-weight="800" fill="${COLORS.accent}">${formatNumber(totalStars)}</text>`,
    `<text x="${STARS.cx}" y="${STARS.cy + 32}" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="3" fill="${COLORS.accentSoft}">TOTAL STARS</text>`,
    '</g>',
  ].join('');
}

export function renderHero(profile) {
  const body = [
    cardFrame({ width: CARD_WIDTH, height: HEIGHT, panel: true }),
    renderAvatar(profile.avatarDataUri, profile.displayName),
    `<path d="M ${TEXT_X - 6} 98 Q ${TEXT_X + 150} 76 ${TEXT_X + 300} 96" fill="none" stroke="${COLORS.accentSoft}" stroke-opacity=".35" stroke-width="1.5"/>`,
    `<g ${fadeDelay(0)}>`,
    `<text class="mono" x="${TEXT_X}" y="80" font-size="14" font-weight="700" letter-spacing="3" fill="${COLORS.accentSoft}">@${escapeXml(profile.handle)}</text>`,
    `<text x="${TEXT_X - 2}" y="134" font-size="50" font-weight="800" letter-spacing="-1" fill="${COLORS.ink}">${escapeXml(profile.displayName)}</text>`,
    `<text x="${TEXT_X}" y="164" font-size="17" fill="${COLORS.accentSoft}">${escapeXml(profile.tagline)}</text>`,
    '</g>',
    renderPills(profile.languages),
    renderStars(profile.totalStars),
  ].join('');
  return svgDocument({ width: CARD_WIDTH, height: HEIGHT, title: `${profile.displayName} (@${profile.handle})`, body });
}
