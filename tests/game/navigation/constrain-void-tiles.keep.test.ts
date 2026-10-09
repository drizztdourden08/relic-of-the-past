/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { constrainVoidTiles } from '@rotp/navigation';
import { GRID_SIZE } from '@rotp/navigation';

const grid = (fill: number): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(fill));

const FLOOR_TOP = 40;
const FLOOR_BOTTOM = 58;
const FLOOR_LEFT = 10;
const FLOOR_RIGHT = 35;
const CORRIDOR_LEFT_FLANK = 19;
const CORRIDOR_RIGHT_FLANK = 24;

describe('constrainVoidTiles keeps doorway gaps from seeding the void flood', () => {
  const layer = grid(0x00);
  for (let c = FLOOR_LEFT; c <= FLOOR_RIGHT; c++) { layer[FLOOR_TOP][c] = 0x01; layer[FLOOR_BOTTOM][c] = 0x01; }
  for (let r = FLOOR_TOP; r <= FLOOR_BOTTOM; r++) { layer[r][FLOOR_LEFT] = 0x01; layer[r][FLOOR_RIGHT] = 0x01; }
  for (let c = CORRIDOR_LEFT_FLANK + 1; c < CORRIDOR_RIGHT_FLANK; c++) layer[FLOOR_BOTTOM][c] = 0x00;
  for (let r = FLOOR_BOTTOM + 1; r < GRID_SIZE; r++) {
    layer[r][CORRIDOR_LEFT_FLANK] = 0x02;
    layer[r][CORRIDOR_RIGHT_FLANK] = 0x02;
  }

  const constrained = constrainVoidTiles(layer, grid(0x00));

  it('keeps the enclosed floor walkable', () => {
    expect(constrained[50][20]).toBe(0x00);
    expect(constrained[45][30]).toBe(0x00);
  });

  it('keeps the wall-flanked exit corridor open down to the edge', () => {
    expect(constrained[60][21]).toBe(0x00);
    expect(constrained[63][20]).toBe(0x00);
    expect(constrained[63][23]).toBe(0x00);
  });

  it('still walls the wide-open structural void', () => {
    expect(constrained[0][0]).toBe(0x01);
    expect(constrained[20][32]).toBe(0x01);
    expect(constrained[63][40]).toBe(0x01);
  });
});
