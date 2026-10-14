/* @layer tests @kind test */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { RAILS, THREE } from './metrics.constants';
import { measureMetrics } from './measure-metrics';
import { solveOf } from './solve-of';
import type { Cells, MetricsRig } from './metrics.type';
import { required } from '../../required';

vi.mock('@app/stores/hud-editor-view-store', async () => {
  const { ECHO } = await import('./metrics.constants');
  return {
    useHudEditorViewStore: (select: (s: Record<string, unknown>) => unknown) =>
      select({ gridEcho: ECHO, setGridEcho: () => {} }),
  };
});

let rig: MetricsRig;

beforeAll(async () => {
  rig = await measureMetrics();
  return () => rig.close();
}, 60_000);

describe('the cells match the real tracks, on both axes', () => {
  it('draws the screen root\'s middle band visibly wider AND taller than its edges', () => {
    const solved = solveOf(THREE);
    expect(solved.columns.map(Math.round)).toEqual([16, 382, 0]);
    expect(solved.rows.map(Math.round)).toEqual([16, 192, 16]);
    for (const rail of RAILS) {
      const mid = rig.cellAt(rail, 'three', 2, 2);
      const edge = rig.cellAt(rail, 'three', 1, 1);
      expect(`${rail} wider ${mid.width > edge.width * 2}`).toBe(`${rail} wider true`);
      expect(`${rail} taller ${mid.height > edge.height}`).toBe(`${rail} taller true`);
    }
  });

  it('draws an empty `auto` track at the floor and SAYS that is what it is', () => {
    for (const rail of RAILS) {
      const empty = rig.cellAt(rail, 'three', 3, 1);
      expect(`${rail} floor ${empty.width}`).toBe(`${rail} floor 24`);
    }
    const heads = required(rig.read[232], 'the read at 232').heads;
    const marked = heads
      .filter((hd) => hd.case === 'three' && hd.axis === 'columns' && hd.index === 3);
    expect(marked.length).toBe(1);
    expect(required(marked[0], 'the marked header').empty).toBe(true);
    expect(heads
      .filter((hd) => hd.case === 'three' && hd.axis === 'columns' && hd.index !== 3)
      .every((hd) => hd.empty === false)).toBe(true);
  });

  it('keeps every cell of a row the same height and every cell of a column the same width', () => {
    for (const rail of RAILS) {
      const cells = rig.cellsOf(rail, 'three');
      expect(`${rail} cells ${cells.length}`).toBe(`${rail} cells 9`);
      for (const c of cells) {
        const sameColumn = cells.find((o) => o.column === c.column && o.row !== c.row) as Cells;
        const sameRow = cells.find((o) => o.row === c.row && o.column !== c.column) as Cells;
        expect(`${rail} w ${Math.abs(c.width - sameColumn.width) < 0.5}`).toBe(`${rail} w true`);
        expect(`${rail} h ${Math.abs(c.height - sameRow.height) < 0.5}`).toBe(`${rail} h true`);
      }
    }
  });

  it('puts every header exactly over, and beside, what it labels', () => {
    for (const rail of RAILS) {
      for (const head of required(rig.read[rail], `the read at ${rail}`).heads.filter((hd) => hd.case === 'three')) {
        const owned = rig.cellsOf(rail, 'three')
          .filter((c) => (head.axis === 'columns' ? c.column : c.row) === head.index);
        for (const c of owned) {
          if (head.axis === 'columns') {
            expect(`${rail} col${head.index} x ${head.x} ${c.x}`).toBe(`${rail} col${head.index} x ${c.x} ${c.x}`);
            expect(`${rail} col${head.index} w ${head.width}`).toBe(`${rail} col${head.index} w ${c.width}`);
          } else {
            expect(`${rail} row${head.index} y ${head.y} ${c.y}`).toBe(`${rail} row${head.index} y ${c.y} ${c.y}`);
            expect(`${rail} row${head.index} h ${head.height}`).toBe(`${rail} row${head.index} h ${c.height}`);
          }
        }
      }
    }
  });

  it('never squashes a track below the 24 px target, at 188 / 232 / 320', () => {
    for (const rail of RAILS) {
      for (const kase of ['three', 'twelve', 'states']) {
        for (const c of rig.cellsOf(rail, kase)) {
          expect(`${rail}/${kase} ${c.width >= 24 && c.height >= 24}`).toBe(`${rail}/${kase} true`);
        }
      }
    }
  });
});
