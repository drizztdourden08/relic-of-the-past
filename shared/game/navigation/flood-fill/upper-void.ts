/* @layer shared-game @kind logic */
/**
 * Upper-layer 0x00 that is only the LOWER floor showing through.
 *
 * A raised surface has to be supported: somewhere along its extent it sits over
 * the lower layer's structure. A connected run of upper-layer 0x00 that is open
 * on the lower layer at every single tile is not a surface at all. It is the
 * gap beside a walkway, and the ground seen through it belongs to the layer
 * below. Boundary flooding cannot find these: they are enclosed by the walkway's
 * own edges, so they never touch the grid border.
 *
 * Room 0x62 is the case that forced it. A bridge crosses the room, splitting the
 * upper layer into three 0x00 regions: the deck itself (supported, since it overlaps
 * lower-layer structure) and the two gaps either side (supported nowhere).
 * Treating the gaps as floor let the walk reach the deck's ledge edge from the
 * wrong side and hop onto a surface the two never share, which is what put a
 * column of phantom jump arrows down the middle of the room.
 */
import { GRID_SIZE } from '../types';

const NEIGHBOURS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

/** Does the lower layer carry any structure at all? Without it there is nothing
 *  to be supported BY, and every upper region would read as unsupported. */
const hasStructure = (layer: number[][]): boolean =>
  layer.some((row) => row.some((v) => v !== 0x00));

/**
 * Mask of every upper-layer 0x00 tile whose region never overlaps lower-layer
 * structure.
 *
 * A MASK instead of a rewritten grid, on purpose. Stamping these as 0x01 would
 * fold them into `CLIFF_WALL`, and cliff preprocessing walks a wall run to find
 * a ledge's landing, so a gap turned into wall silently extends the cliff
 * beside it and invents hops dozens of tiles long. The caller applies this to
 * the collision tiles AFTER cliffs are processed, which blocks the walk without
 * touching what the cliff scan reads.
 */
const unsupportedUpperVoid = (upper: number[][], lower: number[][]): boolean[][] => {
  const mask: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  if (!hasStructure(lower)) return mask;

  const visited: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

  for (let r0 = 0; r0 < GRID_SIZE; r0++) {
    for (let c0 = 0; c0 < GRID_SIZE; c0++) {
      if (visited[r0][c0] || upper[r0][c0] !== 0x00) continue;

      const region: Array<[number, number]> = [];
      const queue: Array<[number, number]> = [[r0, c0]];
      visited[r0][c0] = true;
      let supported = false;

      while (queue.length > 0) {
        const [r, c] = queue.pop()!;
        region.push([r, c]);
        if (lower[r][c] !== 0x00) supported = true;
        for (const [dr, dc] of NEIGHBOURS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
          if (visited[nr][nc] || upper[nr][nc] !== 0x00) continue;
          visited[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }

      if (!supported) {
        for (const [r, c] of region) mask[r][c] = true;
      }
    }
  }
  return mask;
};

export { unsupportedUpperVoid };
