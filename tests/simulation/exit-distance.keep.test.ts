/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { stepDistances, distanceAt, decodeScore } from '../../apps/web/src/lib/game/simulator/exit-order';

const GRID = 64;
const UNREACHED = 0xffff;
const OUT_OF_AREA_BIAS = 0x1000;
const UNKNOWN_DISTANCE = 999;

const gridWithWall = (wallRow: number): number[][] =>
  Array.from({ length: GRID }, (_, r) => Array.from({ length: GRID }, () => (r === wallRow ? 0 : 1)));

describe('exit score decoding', () => {
  it('reports a plain walk distance as steps', () => {
    expect(decodeScore(42)).toEqual({ steps: 42 });
  });

  it('strips the out-of-area bias instead of printing 4096', () => {
    expect(decodeScore(OUT_OF_AREA_BIAS + 28)).toEqual({ steps: 28, stepsNote: 'other-screen' });
    expect(decodeScore(OUT_OF_AREA_BIAS)).toEqual({ steps: 0, stepsNote: 'other-screen' });
  });

  it('gives no step count when the distance is unknown', () => {
    expect(decodeScore(UNKNOWN_DISTANCE)).toEqual({ stepsNote: 'via-hop' });
    expect(decodeScore(UNREACHED)).toEqual({});
  });

  it('never reports the sentinel as a step count', () => {
    for (const score of [UNKNOWN_DISTANCE, OUT_OF_AREA_BIAS + UNKNOWN_DISTANCE, UNREACHED]) {
      expect(decodeScore(score).steps ?? 0).toBeLessThan(UNKNOWN_DISTANCE);
    }
  });
});

describe('ledge hops in the walk BFS', () => {
  it('leaves the far side of a wall unreachable with no ledge', () => {
    const dist = stepDistances(gridWithWall(10), { row: 5, col: 5 }, []);
    expect(dist[20 * GRID + 5]).toBe(UNKNOWN_DISTANCE);
  });

  it('sorts everything across a ledge drop after every walk on this side', () => {
    const ledges = [{ startRow: 9, startCol: 5, endRow: 11, endCol: 5 }];
    const dist = stepDistances(gridWithWall(10), { row: 5, col: 5 }, ledges);
    expect(dist[9 * GRID + 5]).toBe(4);
    expect(dist[11 * GRID + 5]).toBeGreaterThan(UNKNOWN_DISTANCE);
    expect(dist[20 * GRID + 5]).toBe(dist[11 * GRID + 5] + 9);
  });

  it('treats a ledge as one-way, so the far side cannot walk back up it', () => {
    const ledges = [{ startRow: 9, startCol: 5, endRow: 11, endCol: 5 }];
    const dist = stepDistances(gridWithWall(10), { row: 20, col: 5 }, ledges);
    expect(dist[9 * GRID + 5]).toBe(UNKNOWN_DISTANCE);
  });

  it('ignores ledges pointing outside the grid instead of corrupting distances', () => {
    const ledges = [{ startRow: 9, startCol: 5, endRow: 99, endCol: 5 }];
    expect(() => stepDistances(gridWithWall(10), { row: 5, col: 5 }, ledges)).not.toThrow();
  });
});

describe('distanceAt', () => {
  it('finds the nearest walkable ring when the target tile itself is solid', () => {
    const dist = stepDistances(gridWithWall(10), { row: 5, col: 5 }, []);
    expect(distanceAt(dist, { row: 10, col: 5 })).toBe(1);
  });
});
