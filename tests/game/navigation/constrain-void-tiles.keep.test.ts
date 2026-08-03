/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { constrainVoidTiles } from '../../../shared/game/navigation/flood-fill/screen-prep';
import { GRID_SIZE } from '../../../shared/game/navigation/types';

// Regression for room 0x72 (East Corridor): the lower floor on layer 1 reaches the grid
// edge through an OPEN south passage (bare 0x00 corridor flanked by walls — no 0x80 door
// attrs stamped). The void flood used to seed from every boundary 0x00, walk up that
// corridor and wall the entire floor (309 tiles) — BFS from the lower layer found ~0
// tiles and upper-layer stair/ledge crosses had no landing. Doorway-shaped boundary gaps
// (narrow, wall-flanked) are walkable exits and must not seed the void flood; wide open
// spans are structural void and must.

const grid = (fill: number): number[][] =>
  Array.from({ length: GRID_SIZE }, () => new Array<number>(GRID_SIZE).fill(fill));

describe('constrainVoidTiles — doorway gaps do not seed the void flood', () => {
  // Model of 0x72's layer 1: void ocean everywhere, a walled floor region in the south
  // half (rows 40-58, cols 10-35), and a 4-wide exit corridor from the floor to the south
  // edge (rows 59-63, cols 20-23) flanked by 0x02 walls.
  const layer = grid(0x00);
  for (let c = 10; c <= 35; c++) { layer[40][c] = 0x01; layer[58][c] = 0x01; } // floor N/S walls
  for (let r = 40; r <= 58; r++) { layer[r][10] = 0x01; layer[r][35] = 0x01; } // floor W/E walls
  for (let c = 20; c <= 23; c++) layer[58][c] = 0x00;                          // opening to corridor
  for (let r = 59; r < GRID_SIZE; r++) { layer[r][19] = 0x02; layer[r][24] = 0x02; } // corridor flanks

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
    expect(constrained[0][0]).toBe(0x01);   // ocean corner
    expect(constrained[20][32]).toBe(0x01); // ocean interior
    expect(constrained[63][40]).toBe(0x01); // south edge outside the flanked gap
  });
});
