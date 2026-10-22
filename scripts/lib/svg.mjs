import { COLORS, FONT_MONO, FONT_SANS } from './theme.mjs';

const CARD_RADIUS = 22;
const PANEL_INSET = 28;
const PANEL_RADIUS = 18;

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

const BASE_STYLE = `
text{font-family:${FONT_SANS}}
.mono{font-family:${FONT_MONO}}
.fade{animation:fade-up .7s cubic-bezier(.2,.7,.2,1) both}
.cursor{animation:blink 1.1s steps(1) infinite}
@keyframes fade-up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
`;

export function svgDocument({ width, height, title, body, style = '' }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">`,
    `<title>${escapeXml(title)}</title>`,
    `<style>${BASE_STYLE}${style}</style>`,
    body,
    '</svg>',
  ].join('');
}

function radial(id, color, opacity) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset=".6" stop-color="${color}" stop-opacity="${opacity * 0.3}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

export function cardFrame({ width, height, panel = false }) {
  const defs = [
    '<defs>',
    '<linearGradient id="card-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b3d38"/><stop offset=".5" stop-color="#05201f"/><stop offset="1" stop-color="#0a2230"/></linearGradient>',
    radial('orb-teal', COLORS.accent, 0.5),
    radial('orb-blue', COLORS.blue, 0.55),
    radial('orb-violet', COLORS.violet, 0.4),
    `<clipPath id="card-clip"><rect width="${width}" height="${height}" rx="${CARD_RADIUS}"/></clipPath>`,
    '</defs>',
  ].join('');
  const background = [
    '<g clip-path="url(#card-clip)">',
    `<rect width="${width}" height="${height}" fill="url(#card-bg)"/>`,
    `<ellipse cx="${width * 0.22}" cy="0" rx="${width * 0.3}" ry="${height * 0.6}" fill="url(#orb-teal)"/>`,
    `<ellipse cx="${width * 0.55}" cy="${height}" rx="${width * 0.28}" ry="${height * 0.35}" fill="url(#orb-blue)"/>`,
    `<ellipse cx="${width}" cy="${height * 0.85}" rx="${width * 0.16}" ry="${height * 0.45}" fill="url(#orb-violet)"/>`,
    '</g>',
  ].join('');
  const border = `<rect x=".75" y=".75" width="${width - 1.5}" height="${height - 1.5}" rx="${CARD_RADIUS}" fill="none" stroke="${COLORS.accent}" stroke-opacity=".55" stroke-width="1.5"/>`;
  const inner = panel
    ? `<rect class="panel" x="${PANEL_INSET}" y="${PANEL_INSET}" width="${width - PANEL_INSET * 2}" height="${height - PANEL_INSET * 2}" rx="${PANEL_RADIUS}" fill="#021514" fill-opacity=".55" stroke="${COLORS.accentSoft}" stroke-opacity=".28"/>`
    : '';
  return `${defs}${background}${border}${inner}`;
}

export function fadeDelay(ms) {
  return `class="fade" style="animation-delay:${ms}ms"`;
}
