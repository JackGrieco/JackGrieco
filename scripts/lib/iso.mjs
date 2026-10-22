// 2:1 isometric grid: weeks run right-down, weekdays run left-down.
const CELL_GAP = 0.08;
const LEVELS = 4;
const TOP_LIGHT = 1.15;
const LEFT_SHADE = 0.78;
const RIGHT_SHADE = 0.58;

const round = (value) => Math.round(value * 100) / 100;

export function project(week, day, { originX, originY, unit }) {
  return {
    x: round(originX + (week - day) * unit),
    y: round(originY + (week + day) * unit * 0.5),
  };
}

export function buildingHeight(count, maxCount, range) {
  if (count <= 0 || maxCount <= 0) {
    return range.min;
  }
  return range.min + Math.sqrt(count / maxCount) * (range.max - range.min);
}

export function cellLevel(count, maxCount) {
  if (count <= 0 || maxCount <= 0) {
    return 0;
  }
  return Math.min(LEVELS, Math.max(1, Math.ceil((count / maxCount) * LEVELS)));
}

export function shade(hex, factor) {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
  return `#${channels
    .map((channel) => Math.min(255, Math.round(channel * factor)).toString(16).padStart(2, '0'))
    .join('')}`;
}

const lift = ({ x, y }, height) => ({ x, y: round(y - height) });
const points = (corners) => corners.map(({ x, y }) => `${x},${y}`).join(' ');

export function renderBuilding({ week, day, height, color, grid }) {
  const near = 1 - CELL_GAP;
  const back = project(week + CELL_GAP, day + CELL_GAP, grid);
  const right = project(week + near, day + CELL_GAP, grid);
  const front = project(week + near, day + near, grid);
  const left = project(week + CELL_GAP, day + near, grid);
  const top = [back, right, front, left].map((corner) => lift(corner, height));
  return [
    `<polygon points="${points([left, front, top[2], top[3]])}" fill="${shade(color, LEFT_SHADE)}"/>`,
    `<polygon points="${points([right, front, top[2], top[1]])}" fill="${shade(color, RIGHT_SHADE)}"/>`,
    `<polygon points="${points(top)}" fill="${shade(color, TOP_LIGHT)}"/>`,
  ].join('');
}
