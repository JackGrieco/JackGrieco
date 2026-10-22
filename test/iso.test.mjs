import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildingHeight, cellLevel, project, renderBuilding, shade } from '../scripts/lib/iso.mjs';

const GRID = { originX: 100, originY: 50, unit: 10 };

test('project moves right-down along weeks and left-down along days', () => {
  const origin = project(0, 0, GRID);
  const nextWeek = project(1, 0, GRID);
  const nextDay = project(0, 1, GRID);

  assert.deepEqual(origin, { x: 100, y: 50 });
  assert.ok(nextWeek.x > origin.x && nextWeek.y > origin.y);
  assert.ok(nextDay.x < origin.x && nextDay.y > origin.y);
});

test('buildingHeight is flat for empty days and grows with contributions', () => {
  const range = { min: 2, max: 80 };

  assert.equal(buildingHeight(0, 50, range), 2);
  assert.equal(buildingHeight(50, 50, range), 80);
  assert.ok(buildingHeight(5, 50, range) < buildingHeight(20, 50, range));
  assert.equal(buildingHeight(3, 0, range), 2);
});

test('cellLevel maps counts to five buckets', () => {
  assert.equal(cellLevel(0, 40), 0);
  assert.equal(cellLevel(1, 40), 1);
  assert.equal(cellLevel(40, 40), 4);
  assert.equal(cellLevel(5, 0), 0);
});

test('shade darkens and lightens hex colors within bounds', () => {
  assert.equal(shade('#808080', 0.5), '#404040');
  assert.equal(shade('#808080', 2), '#ffffff');
  assert.equal(shade('#2dd4bf', 1), '#2dd4bf');
});

test('renderBuilding draws top, left and right faces', () => {
  const svg = renderBuilding({ week: 0, day: 0, height: 20, color: '#2dd4bf', grid: GRID });

  assert.equal((svg.match(/<polygon/g) ?? []).length, 3);
});
