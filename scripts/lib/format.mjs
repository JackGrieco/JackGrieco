const SANS_CHAR_RATIO = 0.56;
const MONO_CHAR_RATIO = 0.62;
const ELLIPSIS = '…';

const NUMBER_FORMAT = new Intl.NumberFormat('en-US');
const COMPACT_FORMAT = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export function formatNumber(value) {
  return NUMBER_FORMAT.format(value);
}

export function formatCompact(value) {
  return COMPACT_FORMAT.format(value);
}

export function formatDate(isoString) {
  return isoString ? isoString.slice(0, 10) : 'n/a';
}

export function truncate(text, maxChars) {
  return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1)}${ELLIPSIS}`;
}

function greedyLines(words, maxChars) {
  return words.reduce((lines, word) => {
    const last = lines.at(-1);
    if (last !== undefined && `${last} ${word}`.length <= maxChars) {
      return [...lines.slice(0, -1), `${last} ${word}`];
    }
    return [...lines, word];
  }, []);
}

export function wrapText(text, maxChars, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = greedyLines(words, maxChars);
  const visible = lines.length > maxLines
    ? [...lines.slice(0, maxLines - 1), lines.slice(maxLines - 1).join(' ')]
    : lines;
  return visible.map((line) => truncate(line, maxChars));
}

export function estimateTextWidth(text, fontSize, { mono = false } = {}) {
  return text.length * fontSize * (mono ? MONO_CHAR_RATIO : SANS_CHAR_RATIO);
}
